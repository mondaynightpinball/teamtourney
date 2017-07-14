'use strict';

// const debug = console.log;
const debug = function() {};
const info = console.log;

const Combinator = require('./combinator.js');

// TODO: Load teams from a file.
const teams = [
  { key: 'A', schedule: [], history: [] },
  { key: 'B', schedule: [], history: [] },
  { key: 'C', schedule: [], history: [] },
  { key: 'D', schedule: [], history: [] },

  { key: 'E', schedule: [], history: [] },
  { key: 'F', schedule: [], history: [] },
  { key: 'G', schedule: [], history: [] },
  { key: 'H', schedule: [], history: [] },

  { key: 'I', schedule: [], history: [] },
  { key: 'J', schedule: [], history: [] },
  { key: 'K', schedule: [], history: [] },
  { key: 'L', schedule: [], history: [] },

  { key: 'M', schedule: [], history: [] },
  { key: 'N', schedule: [], history: [] },
  { key: 'O', schedule: [], history: [] },
  { key: 'P', schedule: [], history: [] },
];

const machines = [];
for(let i = 0; i < 20; i++) {
  machines.push(`M${i+1}`);
}

debug('MACHINES:', machines);

const lookup = {};
teams.forEach(team => lookup[team.key] = team);

debug('LOOKUP:', lookup);

const numRounds = 3;
debug('numRounds:', numRounds);
const MAX_HA = Math.ceil(numRounds / 2);
debug('MAX_HA:', MAX_HA);

function getHomeAway(team) {
  let nHome = 0, nAway = 0, streak = 0;
  team.schedule.forEach(match => {
    const isHome = match.home === team.key;
    // debug('isHome', isHome, match);
    if(isHome) {
      nHome++;
      if(streak < 0) streak = 0;
      streak++;
    }
    if(!isHome) {
      nAway++;
      if(streak > 0) streak = 0;
      streak--;
    }
  });
  // debug('getHomeAway', team.key, nHome, nAway, streak);
  if(nHome === MAX_HA) return { home: 0, away: 1 };
  if(nAway === MAX_HA) return { home: 1, away: 0 };
  if(streak >= 2)  return { home: 0, away: 1 };
  if(streak <= -2) return { home: 1, away: 0 };
  // We can conditionally allow streaks of 3+ matches, but
  //  we might not need to.
  // if(streak === 2) return  { home: 0.1, away: 0.9 };
  // if(streak === -2) return { home: 0.9, away: 0.1 };
  return { home: 0.5, away: 0.5 };
}

let iters = 0, fails = 0;
function generateRound() {
  if(++iters % 1000 === 0) info(iters, (iters - fails));
  let round = [];
  let p = {};
  let v = {};

  const index = {};
  teams.forEach(team => {
    const vs = {};
    const on = {};
    team.schedule.forEach( (m, i) => {
      vs[m.home] = (i + 1);
      vs[m.away] = (i + 1);
      m.machines.forEach( mk => on[mk] = true );
    });
    index[team.key] = { vs, on, ha: getHomeAway(team) };
  });

  teams.forEach(team => {
    if(p[team.key]) return; // team already scheduled for the round.
    const choices = [];
    const prob = index[team.key].ha;
    const hist = index[team.key].vs;

    debug('----------------------------------------------');
    debug('team:', team.key);
    debug('hist:', hist);
    teams.forEach(opp => {
      if(p[opp.key]) return; // opp already scheduled for the round.
      if(team.key === opp.key) return; // teams don't play themselves.
      if(hist[opp.key]) return; // teams already played.

      const oProb = index[opp.key].ha;

      const available = machines.filter( m => {
        return !v[m] && !index[team.key].on[m] && !index[opp.key].on[m];
      });

      debug('available:', available);
      if(prob.home > 0 && oProb.away > 0) { // !v[team.venue] &&
        // TODO: Also filter any machines used by team or opp
        const iter = new Combinator(available, 2);
        while(iter.advance()) {
          choices.push({
            home: team.key, away: opp.key, machines: iter.combo(),
            weight: prob.home * oProb.away
          });
        }
      }
      if(prob.away > 0 && oProb.home > 0) { // !v[opp.venue] &&
        const iter = new Combinator(available, 2);
        while(iter.advance()) {
          choices.push({
            home: opp.key, away: team.key, machines: iter.combo(),
            weight: prob.away * oProb.home
          });
        }
      }
      //TODO: We could calc sum as part of this loop.
    });
    let sum = 0;
    choices.forEach(choice => {
      sum += choice.weight;
    });
    const rnd = Math.random();
    let tally = 0;
    const draw = choices.find(choice => {
      tally += choice.weight / sum;
      return rnd < tally;
    });

    // TODO: Handle empty choices!!!

    debug('choices:', choices);
    debug('rnd:', rnd);
    debug('draw:', draw);
    p[draw.home] = true;
    p[draw.away] = true;
    draw.machines.forEach( m => v[m] = true);

    round.push(draw);
  });
  round.forEach(match => {
    lookup[match.home].schedule.push(match);
    lookup[match.away].schedule.push(match);
  });

  return round;
}

function popWeek() {
  teams.forEach(team => {
    team.schedule.pop();
  });
}

function shuffle(arr) {
  for(let i = arr.length - 1; i >= 0; i--) {
    let dex = Math.floor( Math.random() * i);
    let tmp = arr[i];
    arr[i] = arr[dex];
    arr[dex] = tmp;
  }
  return arr;
}

function generateSchedule() {
  // debug('generateSchedule', teams, numWeeks);

  let stack = [];
  let stats = {};
  let attempts = 0;
  // let zeros = 0;
  while(stack.length < numRounds) {
    try {
      let week = generateRound();
      stack.push(week);
      debug('****************** CHECKING WEEK ', stack.length, week);
      // NOTE: All validation should now be happening on a match by match
      //        basis inside of generateWeek. If it fails, it should throw
      //        an error, instead of an empty week.
      attempts = 0;
    } catch (err) {
      debug('@@@@@@@@@@@@@@@@@@@@@@@', err.message);
      fails++;
      // stats['all'] = stats['all'] ? stats['all'] + 1 : 1;
      let n = stack.length;
      stats[n] = stats[n] ? stats[n] + 1 : 1;
      if(attempts++ > 0 && stack.length > 0) {
        stack.pop();
        popWeek();
        attempts = 0;
        // NOTE: It might be better not to reset until successfully gen'ing a week.
        //       This means that a bad branch can be cleared out fairly quickly.
      }
      shuffle(teams);
    }
    if(iters % 1000 === 0) info(stats);
  }
  teams.forEach(team => {
    info('TEAM:', team.key, team.schedule.length);
    info(team.schedule);
  });
  info('FINISHED iters:', iters, 'fails:', fails);
  return stack;
}

module.exports = generateSchedule;
