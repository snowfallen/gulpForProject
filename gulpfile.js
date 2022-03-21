const {src , dest , watch ,parallel, series} = require('gulp');
const browserSync = require ('browser-sync').create(); 

function browsersync() {
    browserSync.init({
        server : {
            baseDir: "app/"
        }
    });
}

const scss = require('gulp-sass')(require('sass'));
const uglify = require ('gulp-uglify-es').default;
const concat = require('gulp-concat');
const autoprefixer = require ('gulp-autoprefixer');
const imagemin = require ('gulp-imagemin');
const del = require ('del');

function clearDist() {
    return del('dist')
}

function images() {
    return src('app/img/**/*')
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(dest('dist/img'))
}

function styles() {
    return src('app/scss/style.scss')
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
        overrideBrowserslist:["last 10 version"],
        grid:true
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js','!app/js/main.min.js'], scripts);
    watch(['app/*.html']).on ('change',browserSync.reload);
}

function scripts() {
    return src([
        'app/js/main.js',
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function build() {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ],{base:'app'})
    .pipe(dest('dist'))
}
exports.styles = styles; 
exports.watching = watching;
exports.browsersync = browsersync; 
exports.scripts = scripts;
exports.images = images;
exports.clearDist = clearDist;

exports.build = series(clearDist , images , build);
exports.default = parallel(styles,browsersync,scripts,watching);