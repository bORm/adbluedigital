/**
 * Created by borm on 09.01.16.
 */
var gutil, prettyHrtime, startTime;

gutil = require('gulp-util');

prettyHrtime = require('pretty-hrtime');

startTime = void 0;

module.exports = {
  start: function(filepath) {
    startTime = process.hrtime();
    gutil.log('Bundling', gutil.colors.green(filepath) + '...');
  },
  end: function(filepath) {
    var prettyTime, taskTime;
    taskTime = process.hrtime(startTime);
    prettyTime = prettyHrtime(taskTime);
    gutil.log('Bundled', gutil.colors.green(filepath), 'in', gutil.colors.magenta(prettyTime));
  }
};