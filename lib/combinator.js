'use strict';

// O(1) memory combinator. Pretty nifty!
function Combinator(items, size) {
  // const n = items.length;
  // TODO Check for weird inputs
  this.p = [];
  this.items = items;
  this.size = size;
}

Combinator.prototype.combo = function() {
  return this.p.map(i => this.items[i]);
};

Combinator.prototype.advance = function() {
  // We try to move the pointers, starting with the far right.
  const { p, items, size } = this;
  if(p.length === 0) {
    for(let i = 0; i < size; i++) {
      this.p[i] = i;
    }
    return true;
  }
  const n = items.length;
  for(let i = 0; i < p.length; i++) {
    let index = p.length - 1 - i;
    let x = p[index];
    if(x < n - 1 - i) {
      // The i-th pointer is less than max position.
      p[index]++;
      for(let j = index + 1; j < p.length; j++) {
        p[j] = p[j-1] + 1;
      }
      return true;
    }
  }
  return false;
};

module.exports = Combinator;
