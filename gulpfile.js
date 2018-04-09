const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const reload = browserSync.reload;
const fileinclude = require('gulp-file-include');
const cachebust = require('gulp-cache-bust');
const plumber = require('gulp-plumber');
const gutil = require('gulp-util');

const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');

const src = {
  scss: 'src/scss/**/*.scss',
  css: 'app/css',
  js: 'src/js/*.js',
  html: 'src/*.html',
  index: 'app/*.html'
};

const errorMsg = '\x1b[41mError\x1b[0m';
const filesGenerated =
  'Your distribution files are generated in: \x1b[1m' +
  __dirname +
  '/app/' +
  '\x1b[0m - ✅';

const onError = err => {
  gutil.beep();
  console.log(errorMsg + ' ' + err.toString());
  this.emit('end');
};


gulp.task('html-includes', () => {
  return gulp
    .src(['src/*.html'])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(
      fileinclude({
        filters: {
          prefix: '@@',
          basepath: '@file'
        }
      })
    )
    .pipe(
      cachebust({
        type: 'timestamp'
      })
    )
    .pipe(gulp.dest('app'));
});

gulp.task('js', () =>
  gulp
    .src(src.js)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['env']
      })
    )
    .pipe(concat('build.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('app/js'))
    .pipe(reload({ stream: true }))
);

// Static Server + watching scss/html files
gulp.task('serve', ['html-includes', 'js', 'sass'], () => {
  browserSync.init({
    server: './app'
  });

  gulp.watch(src.scss, ['sass']);
  gulp.watch(src.js, ['js']);
  gulp.watch(src.html, ['html-includes']);
  gulp.watch(src.index).on('change', reload);
});

// Compile sass into CSS
gulp.task('sass', () => {
  return gulp
    .src(src.scss)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(src.css))
    .pipe(reload({ stream: true }));
});

gulp.task('default', ['serve']);
