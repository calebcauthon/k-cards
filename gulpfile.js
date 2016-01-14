var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var gulpNgConfig = require('gulp-ng-config');
var child = require('child_process');

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('heroku-start', function () {
  gulp.task('make-config');
});

gulp.task('server', function() {
  var server = child.spawn('node', ['server.js']);
  server.stdout.pipe(console.log.bind(console));
  server.stderr.pipe(console.log.bind(console));
});

gulp.task('make-config', function () {
  gulp.src('angular-config.json')
  .pipe(gulpNgConfig('recipeApp.config', { environment: process.env.KITCHENIO_ENVIRONMENT }))
  .pipe(gulp.dest('./www/js'))
});

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('js', function() {
  return gulp.src("www/lib/k-cards-js/services.js")
    .pipe(gulp.dest("www/js/k-cards-services"))
});


