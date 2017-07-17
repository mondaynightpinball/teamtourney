'use strict';

const fs = require('fs');

function mockTeams() {
  for(let i = 1; i <= 16; i++) {
    let team = `Team #${i}\n`;
    for(let j = 0; j < 4; j++) {
      team += `Player #${(4*(i-1)) + j + 1}\n`;
    }
    fs.writeFileSync(`./data/teams/team-${i}`, team);
  }
}

mockTeams();
