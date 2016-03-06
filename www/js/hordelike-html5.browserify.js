(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Hordelike = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Hordelike = require('./hordelike');

// for node.js, not for CommonJS
module.exports = Hordelike;

Hordelike.prototype.initialCanvas = function (element) {
  this.canvasElement = document.createElement('canvas');
  element.appendChild(this.canvasElement);
  this.resizeCanvas();

  Hordelike.ins = this;
  var game = this;
  var lastPoint = game.lastPoint = [];
  this.canvasElement.addEventListener('touchstart', function (e) {
    e.preventDefault();
    var rect = e.target.getBoundingClientRect();
    var point = game.getPointFromHTML(e.changedTouches[0].clientX - rect.left, e.changedTouches[0].clientY - rect.top);
    lastPoint[0] = point[0];
    lastPoint[1] = point[1];
    game.touchNow = point;
    game.active = true;
    game.startAnimation();
  });

  this.canvasElement.addEventListener('touchmove', function (e) {
    e.preventDefault();
    var rect = e.target.getBoundingClientRect();
    var point = game.getPointFromHTML(e.changedTouches[0].clientX - rect.left, e.changedTouches[0].clientY - rect.top);
    if (game.touchNow[0] === point[0] && game.touchNow[1] === point[1]) {
      // nothing
    } else {
      lastPoint[0] = point[0];
      lastPoint[1] = point[1];
    }
    game.touchNow = point;
  });

  this.canvasElement.addEventListener('touchend', function (e) {
    e.preventDefault();
    var rect = e.target.getBoundingClientRect();
    var point = game.getPointFromHTML(e.changedTouches[0].clientX - rect.left, e.changedTouches[0].clientY - rect.top);
    lastPoint[0] = point[0];
    lastPoint[1] = point[1];
    game.touchNow = point;
    game.active = false;
  });

  this.canvasElement.addEventListener('mousedown', function (e) {
    e.preventDefault();
    var rect = e.target.getBoundingClientRect();
    var point = game.getPointFromHTML(e.clientX - rect.left, e.clientY - rect.top);
    lastPoint[0] = point[0];
    lastPoint[1] = point[1];
    game.active = true;
    game.startAnimation();
  });

  this.canvasElement.addEventListener('mousemove', function (e) {
    e.preventDefault();
    var rect = e.target.getBoundingClientRect();
    var point = game.getPointFromHTML(e.clientX - rect.left, e.clientY - rect.top);
    lastPoint[0] = point[0];
    lastPoint[1] = point[1];
  });

  this.canvasElement.addEventListener('mouseup', function (e) {
    e.preventDefault();
    var rect = e.target.getBoundingClientRect();
    var point = game.getPointFromHTML(e.clientX - rect.left, e.clientY - rect.top);
    lastPoint[0] = point[0];
    lastPoint[1] = point[1];
    game.active = false;
  });

  this.canvasElement.addEventListener('mouseleave', function (e) {
    e.preventDefault();
    game.active = false;
  });

  window.addEventListener("keydown", function (e) {
    e.preventDefault();
    var key = String.fromCharCode(e.keyCode);
    game.keyNow = key;
  }, false);

  window.addEventListener("keyup", function (e) {
    e.preventDefault();
    var key = String.fromCharCode(e.keyCode);
    if (game.keyNow === key) {
      game.keyNow = '_';
    }
  }, false);

  window.addEventListener('resize', function() {
    if (game.resizeTimer) {
      clearTimeout(game.resizeTimer);
    }
    game.resizeTimer = setTimeout(function () {
      game.resizeCanvas();
    }, 100);
  });

  this.mainInterval = window.setInterval(function () {
    if (game.key(game.keyNow.toLowerCase())) {
      game.draw();
    }
  },200);
};

Hordelike.prototype.startAnimation = function () {
  var lastPoint = this.lastPoint;
  var game = this;
  if (game.active && game.point(lastPoint[0], lastPoint[1])) {
    game.draw();
  }
  if (this.animationInterval) {
    window.clearInterval(this.animationInterval);
  }
  this.animationInterval = window.setInterval(function () {
    if (game.active && game.point(lastPoint[0], lastPoint[1])) {
      game.draw();
    }
  }, 200);
};

Hordelike.FONT_MAP_SIZE = 50; // font map is for pre-rendering area, 50 x 50 is reserved in the default
Hordelike.prototype.resizeCanvas = function () {
  if (this.maxWidth  && this.maxWidth  === window.innerWidth &&
      this.maxHeight && this.maxHeight === window.innerHeight) {
    return; // nothing to do
  }

  var device_pixel_ratio = window.devicePixelRatio || 1;
  this.maxWidth  = window.innerWidth;
  this.maxHeight = window.innerHeight;
  var font_size = Math.min(Math.floor(this.maxWidth * device_pixel_ratio / 96), Math.floor(this.maxHeight * device_pixel_ratio / 27 / 2));
  if (this.fontX === font_size && this.fontY === font_size * 2) {
    return; // nothing to do
  }

  this.fontX = font_size; this.fontY = font_size * 2;
  this.devicePixelRatio = device_pixel_ratio;

  this.canvasElement.setAttribute('width',  this.fontX * 96);
  this.canvasElement.setAttribute('height', this.fontY * 27);
  this.canvasElement.parentElement.style.width  = Math.round(this.fontX * 96 / device_pixel_ratio) + 'px';
  this.canvasElement.parentElement.style.height = Math.round(this.fontY * 27 / device_pixel_ratio) + 'px';
  this.canvasElement.style.width  = Math.round(this.fontX * 96 / device_pixel_ratio) + 'px';
  this.canvasElement.style.height = Math.round(this.fontY * 27 / device_pixel_ratio) + 'px';
  this.canvasContext = this.canvasElement.getContext("2d");
  this.canvasContext.fillStyle = 'white';

  this.fontCanvasElement = document.createElement('canvas');
  this.fontCanvasElement.setAttribute('width',  this.fontX);
  this.fontCanvasElement.setAttribute('height', this.fontY);
  this.fontCanvasContext = this.fontCanvasElement.getContext("2d");
  this.fontCanvasContext.fillStyle = this.fillStyle = 'black';
  this.fontCanvasContext.font = this.fontY + 'px Monospace';
  this.fontCanvasContext.textAlign = 'center';
  this.fontCanvasContext.textBaseline = 'middle';

  this.fontMap = {}; // str + ' ' + color : [ dx, dy ]
  this.fontLength = 0;
  this.fontMapCanvasElement = document.createElement('canvas');
  this.fontMapCanvasElement.setAttribute('width',  this.fontX * Hordelike.FONT_MAP_SIZE);
  this.fontMapCanvasElement.setAttribute('height', this.fontY * Hordelike.FONT_MAP_SIZE);
  this.fontMapCanvasContext = this.fontMapCanvasElement.getContext("2d");
  this.fontMapCanvasContext.fillStyle = 'white';
  this.fontMapCanvasContext.fillRect(0, 0, this.fontX * Hordelike.FONT_MAP_SIZE, this.fontY * Hordelike.FONT_MAP_SIZE);

  // for full width
  this.fontFWCanvasElement = document.createElement('canvas');
  this.fontFWCanvasElement.setAttribute('width',  this.fontX * 2);
  this.fontFWCanvasElement.setAttribute('height', this.fontY);
  this.fontFWCanvasContext = this.fontFWCanvasElement.getContext("2d");
  this.fontFWCanvasContext.fillStyle = this.fillStyle = 'black';
  this.fontFWCanvasContext.font = this.fontY + 'px Monospace';
  this.fontFWCanvasContext.textAlign = 'center';
  this.fontFWCanvasContext.textBaseline = 'middle';

  this.fontFWMap = {}; // str + ' ' + color : [ dx, dy ]
  this.fontFWLength = 0;
  this.fontFWMapCanvasElement = document.createElement('canvas');
  this.fontFWMapCanvasElement.setAttribute('width',  this.fontX * Hordelike.FONT_MAP_SIZE * 2);
  this.fontFWMapCanvasElement.setAttribute('height', this.fontY * Hordelike.FONT_MAP_SIZE);
  this.fontFWMapCanvasContext = this.fontFWMapCanvasElement.getContext("2d");
  this.fontFWMapCanvasContext.fillStyle = 'white';
  this.fontFWMapCanvasContext.fillRect(0, 0, this.fontX * Hordelike.FONT_MAP_SIZE * 2, this.fontY * Hordelike.FONT_MAP_SIZE);

  // initial drawing
  this.draw(true);
};

Hordelike.prototype.getPointFromHTML = function (x, y) {
  var px = x, py = y;
  var mx = Math.floor(px * this.devicePixelRatio / this.fontX), my = Math.floor(py * this.devicePixelRatio / this.fontY);
  return [ mx, my ];
};

Hordelike.COLOR_REGEXP = /^\{([^-]+)-fg\}(.*)\{\/\1-fg\}$/;
Hordelike.prototype.draw = function (initial) {
  var screen = this.getScreen();
  var context = this.canvasContext;

  // for half width
  var font_element = this.fontCanvasElement;
  var font_context = this.fontCanvasContext;
  var font_map = this.fontMap;
  var font_map_element = this.fontMapCanvasElement;
  var font_map_context = this.fontMapCanvasContext;

  // for full width
  var fontfw_element = this.fontFWCanvasElement;
  var fontfw_context = this.fontFWCanvasContext;
  var fontfw_map = this.fontFWMap;
  var fontfw_map_element = this.fontFWMapCanvasElement;
  var fontfw_map_context = this.fontFWMapCanvasContext;

  var old_screen = initial ? null : this.oldScreen;
  var dw = this.fontX, dh = this.fontY;

  var get_str_pos = function (str, color, full_width) {
    if (font_map[str + ' ' + color]) {
      return font_map[str + ' ' + color];
    }
    var dx, dy, px, py;
    if (full_width) {
      ++this.fontFWLength;
      dx = (this.fontFWLength % Hordelike.FONT_MAP_SIZE) * dw * 2; dy = Math.floor(this.fontFWLength / Hordelike.FONT_MAP_SIZE) * dh;
      px = dw; py = dh * 0.5;
      fontfw_context.clearRect(0, 0, dw * 2, dh);
      fontfw_context.fillStyle = color;
      fontfw_context.fillText(str, px, py);
      fontfw_map_context.drawImage(fontfw_element, dx, dy);
      fontfw_map[str + ' ' + color] = [ dx, dy ];
      return fontfw_map[str + ' ' + color];
    } else {
      ++this.fontLength;
      dx = (this.fontLength % Hordelike.FONT_MAP_SIZE) * dw; dy = Math.floor(this.fontLength / Hordelike.FONT_MAP_SIZE) * dh;
      px = dw * 0.5; py = dh * 0.5;
      font_context.clearRect(0, 0, dw, dh);
      font_context.fillStyle = color;
      font_context.fillText(str, px, py);
      font_map_context.drawImage(font_element, dx, dy);
      font_map[str + ' ' + color] = [ dx, dy ];
      return font_map[str + ' ' + color];
    }
  };
  var before_full_width = false;
  for (var y = 0; y < 27; ++y) {
    for (var x = 0; x < 96; ++x) {
      var str = screen[y][x];
      if (!str) { // null is blank
        str = screen[y][x] = ' ';
      }
      var full_width = before_full_width;
      before_full_width = (str.indexOf("\0") !== -1); // if str have null-str, next str is full-width

      if (old_screen && str === old_screen[y][x]) { // no-updated
        continue;
      }

      var colors = Hordelike.COLOR_REGEXP.exec(str);
      if (colors) {
        if (this.fillStyle !== colors[1]) {
          this.fillStyle = colors[1];
        }
        str = colors[2];
      } else {
        if (this.fillStyle !== 'black') {
          this.fillStyle = 'black';
        }
      }
      var dx = dw * (full_width ? x - 1 : x), dy = dh * y;
      var s = get_str_pos.call(this, str, this.fillStyle, full_width);
      var sx = s[0], sy = s[1], sw = (full_width ? dw * 2 : dw ), sh = dh;
      context.drawImage((full_width ? fontfw_map_element : font_map_element), sx, sy, sw, sh, dx, dy, (full_width ? dw * 2 : dw), dh);
    }
  }
  this.oldScreen = screen.map(function (row) { return row.concat(); });
};

},{"./hordelike":2}],2:[function(require,module,exports){
var Hordelike = function () {
  var screen = this.screen = [];
  for (var y = 0; y < 25; ++y) { // status line is 2
    var row = [];
    for (var x = 0; x < 96; ++x) {
      row.push(' ');
    }
    screen.push(row);
  }
  this.x = 48;
  this.y = 13;
  screen[this.y][this.x] = '@';

  this.wave = 0;
  this.time = 0;

  this.status = {};
  this.status.health = 10;
  this.status.healthMax = 10;
  this.status.moveSpeed = 10;

  this.status.power = 10;
  this.status.capacity = 10;
  this.status.capacityMax = 10;
  this.status.ammo = 100;
  this.status.fireSpeed = 10;
  this.status.reload = 10;
  this.status.rangeType = "A";

  this.status.wait = 10;
  this.status.waitType = "none";
};
// for node.js, not for CommonJS
module.exports = Hordelike;

var Hordelike_PLAYER_X = 27;    // less is harder
var Hordelike_PLAYER_Y = 30;     // less is harder

var Hordelike_EMPTY_LINE_STR = '                                                                                                ';
var Hordelike_MANUAL_LINE_STR = 'WASD - move, F - fire, R - reload, E - equip an item' + Hordelike_EMPTY_LINE_STR;

Hordelike.prototype.getScreen = function () {
  var status = this.status;
  var status_str = 'WAVE:' + this.wave + ' TIME:' + this.time + ' HP:' + status.health + '/' + status.healthMax + ' SPD:' + status.moveSpeed;
  var weapon_str = 'POW:' + status.power + ' CAP:' + status.capacity + '/' + status.capacityMax + '/' + status.ammo;
  weapon_str += ' SPD:' + status.fireSpeed + ' RLD:' + status.reload + ' RNG:' + status.rangeType;
  status_str += (Hordelike_EMPTY_LINE_STR + weapon_str).slice(status_str.length - 96);
  return [ status_str.split(''), Hordelike_MANUAL_LINE_STR.split('') ].concat(this.screen);
};

Hordelike.prototype.move = function (move_x, move_y) {
  var new_x = this.x + move_x, new_y = this.y + move_y;
  if (new_x < 0 || 96 <= new_x || new_y < 0 || 25 <= new_y) {
    return false;
  }
  this.screen[this.y][this.x] = ' ';
  this.screen[new_y][new_x] = '@';
  this.x = new_x; this.y = new_y;
  return true;
};

Hordelike.prototype.key = function (key_str) {
  if (key_str === 'w') {
    return this.move(0, -1);
  } else if (key_str === 'a') {
    return this.move(-1, 0);
  } else if (key_str === 's') {
    return this.move(0, 1);
  } else if (key_str === 'd') {
    return this.move(1, 0);
  }
  return true;
};

Hordelike.prototype.point = function (x, y) {
  return true;
};

},{}]},{},[1])(1)
});