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
  if (key_str === 'w' || key_str === 'k') {
    return this.move(0, -1);
  } else if (key_str === 'a' || key_str === 'h') {
    return this.move(-1, 0);
  } else if (key_str === 's' || key_str === 'j') {
    return this.move(0, 1);
  } else if (key_str === 'd' || key_str === 'l') {
    return this.move(1, 0);
  } else if (key_str === 'f') {
    return this.fire();
  } else if (key_str === 'r') {
    return this.reload();
  } else if (key_str === 'e') {
    return this.equip();
  }

  return true;
};

Hordelike.prototype.move = function (move_x, move_y) {
  var new_x = this.x + move_x, new_y = this.y + move_y;
  if (this.time <= this.status.moveCD) {
    return false;
  } else if (new_x < 0 || 96 <= new_x || new_y < 0 || 25 <= new_y) {
    this.message = 'Blocked';
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
  if (this.time <= this.status.fireCD) {
    return false;
  } else if (this.status.magazine === 0) {
    this.message = 'You need to reload.';
    return false;
  } else if (this.time <= this.status.reloadCD) {
    this.message = "You are reloading.";
    return false;
  }
  var enemy = this.enemies[0];
  if (enemy) {
    enemy.dead = true;
    this.screen[enemy.y][enemy.x] = ' ';
    this.items[enemy.y][enemy.x] = this.items[enemy.y][enemy.x] || Hordelike.getWeaponFromStatus(enemy.status);
    this.message = 'You shooted an enemy.';
  } else {
    this.message = 'It did not hit.';
  }
  this.status.magazine--;
  this.status.fireCD = this.time + this.status.fireSpeed;
  return true;
};

Hordelike.getWeaponFromStatus = function (status) {
  var weapon = {};
  weapon.symbol      = status.symbol;
  weapon.power       = status.power;
  weapon.magazine    = status.magazine;
  weapon.capacity    = status.capacity;
  weapon.fireSpeed   = status.fireSpeed;
  weapon.reloadSpeed = status.reloadSpeed;
  weapon.rangeMin    = status.rangeMin;
  weapon.rangeMax    = status.rangeMax;
  weapon.rangeType   = status.rangeType;
  return weapon;
};

Hordelike.setWeaponToStatus = function (status, weapon) {
  status.symbol      = weapon.symbol;
  status.power       = weapon.power;
  status.magazine    = weapon.magazine;
  status.capacity    = weapon.capacity;
  status.fireSpeed   = weapon.fireSpeed;
  status.reloadSpeed = weapon.reloadSpeed;
  status.rangeMin    = weapon.rangeMin;
  status.rangeMax    = weapon.rangeMax;
  status.rangeType   = weapon.rangeType;
  return status;
};

Hordelike.prototype.reload = function () {
  if (this.time <= this.status.reloadCD) {
    return false;
  } else if (this.status.ammo === 0) {
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

Hordelike.prototype.equip = function () {
  if (this.time <= this.status.fireCD) {
    return false;
  } else if (this.time <= this.status.reloadCD) {
    return false;
  } else if (this.time <= this.status.moveCD) {
    return false;
  } else if (!this.items[this.y][this.x]) {
    this.message = 'There is nothing here to pick up.';
    return false;
  }

  var old_weapon = Hordelike.getWeaponFromStatus(this.status);
  Hordelike.setWeaponToStatus(this.status, this.items[this.y][this.x]);
  this.items[this.y][this.x] = old_weapon;

  var message = 'E - equip --> ';
  var status = old_weapon;
  var weapon_str = 'POW:' + status.power + ' CAP:' + status.magazine + '/' + status.capacity + '/**' ;
  weapon_str += ' SPD:' + status.fireSpeed + ' RLD:' + status.reloadSpeed + ' RNG:' + status.rangeType;
  message += (Hordelike_EMPTY_LINE_STR + weapon_str).slice(message.length - 96);
  this.message = message;

  this.status.moveCD = this.time + this.status.moveSpeed; // equip CD = move CD

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
