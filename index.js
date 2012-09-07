
/**
 * Simple wrapper component around `window.open()`.
 *
 * Usage:
 *
 *     var Popup = require('popup');
 *     var win = new Popup('http://google.com', { width: 100, height: 100 });
 *     win.on('close', function () {
 *       console.log('popup window was closed');
 *     });
 */

/**
 * Module derencencies.
 */

var Emitter = require('emitter')
  , inherit = require('inherit');

/**
 * Module exports.
 */

exports = module.exports = Popup;

/**
 * Default Popup options.
 */

var defaults = {
    width: 700
  , height: 520
  , menubar: 'no'
  , resizable: 'yes'
  , location: 'yes'
  , scrollbars: 'no'
  , centered: true
};

/**
 * The "Popup" constructor.
 */

function Popup (src, opts) {
  if (!(this instanceof Popup)) {
    return new Popup(src, opts);
  }

  // ensure an opts object exists
  opts = opts || {};

  // set the defaults if not provided
  for (var i in defaults) {
    if (!(i in opts)) {
      opts[i] = defaults[i];
    }
  }

  // open the window in the center of the screen
  if (opts.centered) {
    if (null == opts.left)
      opts.left = (screen.width / 2) - (opts.width / 2);
    if (null == opts.top)
      opts.top = (screen.height / 2) - (opts.height / 2);
    delete opts.centered;
  }

  // interval to check for the window being closed
  var interval = 500;
  if (opts.interval) {
    interval = +opts.interval;
    delete opts.interval;
  }

  // turn the "opts" object into a window.open()-compatible String
  var optsStr = [];
  for (var key in opts) {
    optsStr.push(key + '=' + opts[key]);
  }
  optsStr = optsStr.join(',');

  // every popup window has a unique "name"
  var name = opts.name;

  // if a "name" was not provided, then create a random one
  if (!name) name = 'popup-' + (Math.random() * 0x10000000 | 0).toString(36);

  Emitter.call(this);
  this.name = name;
  this.opts = opts;
  this.optsStr = optsStr;

  // finally, open and return the popup window
  this.window = window.open(src, name, optsStr);
  this.focus();

  this.interval = setInterval(checkClose(this), interval);
}

// inherit from Emitter
inherit(Popup, Emitter);

/**
 * Closes the popup window.
 */

Popup.prototype.close = function () {
  this.window.close();
}

/**
 * Focuses the popup window (brings to front).
 */

Popup.prototype.focus = function () {
  this.window.focus();
}

/**
 * Emits the "close" event.
 */

Popup.prototype._checkClose = function () {
  if (this.window.closed) {
    this.emit('close');
    clearInterval(this.interval);
  }
}

function checkClose (popup) {
  return function () {
    popup._checkClose();
  }
}
