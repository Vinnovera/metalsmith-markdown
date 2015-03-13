
var basename = require('path').basename;
var debug = require('debug')('metalsmith-markdown');
var dirname = require('path').dirname;
var extname = require('path').extname;
var marked = require('marked');
var async = require('async');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Metalsmith plugin to convert markdown files.
 *
 * @param {Object} options (optional)
 *   @property {Array} keys
 * @return {Function}
 */

function plugin(options){
  options = options || {};
  var keys = options.keys || [];

  return function(files, metalsmith, done){
    async.each(Object.keys(files), function(file, callback){
      debug('checking file: %s', file);
      if (!markdown(file)) return;
      var data = files[file];
      var dir = dirname(file);
      var html = basename(file, extname(file)) + '.html';
      if ('.' != dir) html = dir + '/' + html;

      debug('converting file: %s', file);
      marked(data.contents.toString(), options, function(err, content) {
          if (err) return callback(err);

          data.contents = new Buffer(content);

          delete files[file];
          files[html] = data;

          if (keys.length) {
              async.each(keys, function(key, callback) {
                marked(data[key], options, function(err, content) {
                    if (err) return callback(err);

                    data[key] = content;
                    callback();
                });
              }, callback);
          } else {
              callback();
          }
      });
    }, done);
  };
}

/**
 * Check if a `file` is markdown.
 *
 * @param {String} file
 * @return {Boolean}
 */

function markdown(file){
  return /\.md|\.markdown/.test(extname(file));
}