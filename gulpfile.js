/**
 * Created by borm on 06.01.16.
 */
var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var path = require('path');
var source = require('vinyl-source-stream');
var bundleLogger, handleErrors;
bundleLogger = require('./gulp/bundleLogger');
handleErrors = require('./gulp/handleErrors');

gulp.task('watch', function(){
  global.isWatching = true;
});

gulp.task('default', ['watch'], function(){

  var bundle, reportFinished, stream;
  stream = browserify({
    debug: true,
    cache: {},
    packageCache: {},
    basedir: __dirname,
    fullPaths: true,
    paths: [path.join(__dirname, '/assets')],
    entries: [path.join(__dirname, '/assets/stats.js')],
    extensions: ['.js']
  }).transform('babelify', {
    presets: ['es2015']
  });

  bundle = function() {
    bundleLogger.start('stats.js');
    return stream.bundle().on('error', handleErrors)
      .pipe(source('stats.js'))
      .pipe(gulp.dest('./static'))
      .on('end', reportFinished);
  };
  if (global.isWatching) {
    stream = watchify(stream);
    stream.on('update', bundle);
  }
  reportFinished = function() {
    return bundleLogger.end('stats.js');
  };
  return bundle();

});