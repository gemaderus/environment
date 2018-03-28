var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var reload = browserSync.reload;
var fileinclude = require('gulp-file-include');
var plumber = require('gulp-plumber');
var cachebust = require('gulp-cache-bust');

var src = {
    scss: 'src/scss/*.scss',
    css: 'app/css',
    html: 'app/*.html',
    index: 'src/*.html'
};

var errorMsg = '\x1b[41mError\x1b[0m';

var onError = function (err) {
    gutil.beep();
    console.log(errorMsg + ' ' + err.toString());
    this.emit('end');
};

// Static Server + watching scss/html files
gulp.task('serve', ['html-partials', 'sass'], function() {
    browserSync.init({
        server: './app'
    });

    gulp.watch(src.scss, ['sass']);
    gulp.watch(src.index, ['html-partials']);
    gulp.watch(src.html).on('change', reload);
});

gulp.task('html-partials', function () {
    return gulp.src(src.index)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(fileinclude({
            filters: {
                prefix: '@@',
                basepath: '@file'
            }
        }))
        .pipe(cachebust({
            type: 'timestamp'
        }))
        .pipe(gulp.dest('app'));
});


// Compile sass into CSS
gulp.task('sass', function() {
    return gulp
        .src(src.scss)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(src.css))
        .pipe(reload({ stream: true }));
});

gulp.task('default', ['serve']);
