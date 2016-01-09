/**
 * Created by borm on 09.01.16.
 */
var notify;

notify = require('gulp-notify');

module.exports = function() {
  var args;
  args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end');
};