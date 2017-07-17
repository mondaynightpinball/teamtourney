'use strict';

const fs = require('fs');

function mockMachines() {
  for(let i = 1; i <= 20; i++) {
    fs.writeFileSync(`./data/machines/machine-${i}`, `Machine #${i}`);
  }
}

mockMachines();
