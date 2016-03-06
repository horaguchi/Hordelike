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
