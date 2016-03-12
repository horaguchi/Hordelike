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
    game.key((game.keyNow || '').toLowerCase());
    game.turn();
    game.draw();
  }, 50);
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
  var items = this.items = [];
  for (var y = 0; y < 25; ++y) { // status line is 2
    var item_row = [];
    for (var x = 0; x < 96; ++x) {
      item_row.push(false);
    }
    items.push(item_row);
  }
  this.message = Hordelike_MANUAL_LINE_STR;

  this.x = 48;
  this.y = 13;
  screen[this.y][this.x] = '@';

  this.wave = 0;
  this.time = 0;

  this.status = {};
  this.status.health = 10;
  this.status.healthMax = 10;
  this.status.moveSpeed = 6;
  this.status.moveCD = 0;

  this.status.symbol = '/';
  this.status.power = 10;
  this.status.magazine = 10;
  this.status.capacity = 10;
  this.status.ammo = 100;
  this.status.fireSpeed = 4;
  this.status.fireCD = 0;
  this.status.reloadSpeed = 30;
  this.status.reloadCD = 0;
  this.status.rangeSpeed = 18;
  this.status.rangeMin = 3;
  this.status.rangeMax = 5;
  this.status.rangeType = 'B';

  this.enemies = [];
};
// for node.js, not for CommonJS
module.exports = Hordelike;

var Hordelike_EMPTY_LINE_STR = '                                                                                                ';
var Hordelike_MANUAL_LINE_STR = 'WASD - move, F - fire, R - reload, E - equip an item';

Hordelike.prototype.getScreen = function () {
  var status = this.status;
  var px = this.x, py = this.y;
  var time = this.time;
  var status_str = 'WAVE:' + this.wave + ' TIME:' + Math.floor(time / 10) + ' HP:' + status.health + '/' + status.healthMax + ' SPD:' + status.moveSpeed;
  var weapon_str = 'POW:' + status.power + ' CAP:' + status.magazine + '/' + status.capacity + '/' + status.ammo;
  weapon_str += ' SPD:' + status.fireSpeed + ' RLD:' + (time <= status.reloadCD ? status.reloadCD - time : status.reloadSpeed) + ' RNG:' + status.rangeType;
  status_str += (Hordelike_EMPTY_LINE_STR + weapon_str).slice(status_str.length - 96);
  var items = this.items;
  return [ status_str.split(''), (this.message + Hordelike_EMPTY_LINE_STR).split('') ].concat(this.screen.map(function (row, y) {
    return row.map(function (tile, x) {
      if (tile !== ' ') {
        return tile;
      } else if (items[y][x]) {
        return items[y][x].symbol;
      }
      var is_range = false;
      var range_num = status.rangeMin + Math.min(status.rangeMax, Math.floor(Math.max(0, (time - status.moveCD)) / status.rangeSpeed));
      if (status.rangeType === 'A' && Math.abs(x - px) + Math.abs(y - py) < range_num) {
        is_range = true;
      } else if (status.rangeType === 'B' && (x - px) * (x - px) + (y - py) * (y - py) < range_num * range_num) {
        is_range = true;
      } else if (status.rangeType === 'C' && (x - px) * (x - px) + (y - py) * (y - py) < range_num * range_num) {
        is_range = true;
      }
      return is_range ? '.' : tile;
    });
  }));
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
  } else if (key_str === 'f') {
    return this.fire();
  } else if (key_str === 'r') {
    return this.reload();
  }
  return true;
};

Hordelike.prototype.move = function (move_x, move_y) {
  var new_x = this.x + move_x, new_y = this.y + move_y;
  if (new_x < 0 || 96 <= new_x || new_y < 0 || 25 <= new_y) {
    this.message = 'Blocked';
    return false;
  } else if (this.time <= this.status.moveCD) {
    return false;
  } else if (this.screen[new_y][new_x] !== ' ') {
    this.message = 'Blocked';
    return false;
  }
  this.screen[this.y][this.x] = ' ';
  this.screen[new_y][new_x] = '@';
  this.x = new_x; this.y = new_y;
  this.status.moveCD = this.time + this.status.moveSpeed;
  if (this.items[new_y][new_x]) {
    var message = 'E - equip --> ';
    var status = this.items[new_y][new_x];
    var weapon_str = 'POW:' + status.power + ' CAP:' + status.magazine + '/' + status.capacity + '/**' ;
    weapon_str += ' SPD:' + status.fireSpeed + ' RLD:' + status.reloadSpeed + ' RNG:' + status.rangeType;
    message += (Hordelike_EMPTY_LINE_STR + weapon_str).slice(message.length - 96);
    this.message = message;
  } else {
    this.message = '';
  }
  return true;
};

Hordelike.prototype.enemyMove = function (enemy) {
  if (this.time <= enemy.status.moveCD) {
    return false;
  }
  var x_abs = Math.abs(this.x - enemy.x);
  var y_abs = Math.abs(this.y - enemy.y);
  if (x_abs === 0 && y_abs === 1) {
    return false;
  } else if (x_abs === 1 && y_abs === 0) {
    return false;
  }
  var new_x = this.x < enemy.x ? enemy.x - 1 : enemy.x + 1;
  var new_y = this.y < enemy.y ? enemy.y - 1 : enemy.y + 1;
  if (this.screen[new_y][enemy.x] !== ' ' && this.screen[enemy.y][new_x] !== ' ') {
    return false;
  } else if (this.screen[new_y][enemy.x] === ' ' && this.screen[enemy.y][new_x] !== ' ') {
    new_x = enemy.x;
  } else if (this.screen[new_y][enemy.x] !== ' ' && this.screen[enemy.y][new_x] === ' ') {
    new_y = enemy.y;
  } else if (x_abs === y_abs) {
    if (Math.random() < 0.5) {
      new_x = enemy.x;
    } else {
      new_y = enemy.y;
    }
  } else if (x_abs < y_abs) {
    new_x = enemy.x;
  } else {
    new_y = enemy.y;
  }
  this.screen[enemy.y][enemy.x] = ' ';
  this.screen[new_y][new_x] = enemy.type;
  enemy.x = new_x; enemy.y = new_y;
  enemy.status.moveCD = this.time + enemy.status.moveSpeed;
  return true;
};

Hordelike.prototype.fire = function () {
  if (this.status.magazine === 0) {
    this.message = 'You need to reload.';
    return false;
  } else if (this.time <= this.status.fireCD) {
    return false;
  } else if (this.time <= this.status.reloadCD) {
    this.message = "You are reloading.";
    return false;
  }
  var enemy = this.enemies[0];
  if (enemy) {
    enemy.dead = true;
    this.screen[enemy.y][enemy.x] = ' ';
    var weapon = {};
    weapon.symbol      = enemy.status.symbol;
    weapon.power       = enemy.status.power;
    weapon.magazine    = enemy.status.magazine;
    weapon.capacity    = enemy.status.capacity;
    weapon.fireSpeed   = enemy.status.fireSpeed;
    weapon.reloadSpeed = enemy.status.reloadSpeed;
    weapon.rangeMin    = enemy.status.rangeMin;
    weapon.rangeMax    = enemy.status.rangeMax;
    weapon.rangeType   = enemy.status.rangeType;
    this.items[enemy.y][enemy.x] = weapon;
    this.message = 'You shooted an enemy.';
  } else {
    this.message = 'It did not hit.';
  }
  this.status.magazine--;
  this.status.fireCD = this.time + this.status.fireSpeed;
  return true;
};

Hordelike.prototype.reload = function () {
  if (this.status.ammo === 0) {
    return false;
  } else if (this.time <= this.status.reloadCD) {
    return false;
  } else if (this.status.magazine === this.status.capacity) {
    this.message = "You don't need to reload.";
    return false;
  }
  this.status.magazine += this.status.ammo;
  this.status.ammo = Math.max(this.status.magazine - this.status.capacity, 0);
  this.status.magazine -= this.status.ammo;
  this.status.reloadCD = this.time + this.status.reloadSpeed;
  this.message = "You are reloading.";
  return true;
};

Hordelike.prototype.turn = function () {
  this.time++;
  if (this.time % 50 === 0) {
    this.createEnemy();
  }
  this.enemies = this.enemies.filter(function (enemy) {
    if (!enemy.dead) {
      this.enemyMove(enemy);
      return true;
    }
  }, this);
  return true;
};

Hordelike.prototype.createEnemy = function () {
  var enemy = {};
  enemy.x = 0;
  enemy.y = 0;
  enemy.type = 'Z';
  enemy.status = {};
  enemy.status.health = 10;
  enemy.status.healthMax = 10;
  enemy.status.moveSpeed = 8;
  enemy.status.moveCD = 0;

  enemy.status.symbol = '|';
  enemy.status.power = 10;
  enemy.status.magazine = 10;
  enemy.status.capacity = 10;
  enemy.status.ammo = 100;
  enemy.status.fireSpeed = 4;
  enemy.status.fireCD = 0;
  enemy.status.reloadSpeed = 16;
  enemy.status.reloadCD = 0;
  enemy.status.rangeMin = 1;
  enemy.status.rangeMax = 10;
  enemy.status.rangeType = 'A';

  this.enemies.push(enemy);
  this.screen[enemy.y][enemy.x] = enemy.type;
};

Hordelike.prototype.point = function (x, y) {
  return true;
};

},{}]},{},[1])(1)
});