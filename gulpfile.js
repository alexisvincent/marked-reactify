var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');

gulp.task('browserify', function () {
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: './lib/browser.js',
        debug: true
    });

    return b.bundle()
        .pipe(source('./marked-reactify.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./build/'));
});

gulp.task('watch', ['browserify'], function() {
    gulp.watch('./lib/**/*.js', ['browserify']);
})

gulp.task('default', ['watch']);
