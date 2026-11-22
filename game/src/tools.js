// Tools cost more than they give: every use nudges the alarm gauge up.

import { RULES, clamp } from './config.js';
import { sendDecoy } from './guards.js';

export function createTools() {
  return {
    decoys: RULES.decoyCharges,
    veils: RULES.veilCharges,
    veilTime: 0,
    activeDecoys: [],
    lastAction: '',
    actionFlash: 0,
  };
}

export function throwDecoy(tools, keepers, target) {
  if (tools.decoys <= 0) return false;
  tools.decoys -= 1;
  const decoy = { x: target.x, y: target.y, life: 3.6 };
  tools.activeDecoys.push(decoy);
  sendDecoy(keepers, decoy);
  tools.lastAction = 'Chalk decoy thrown';
  tools.actionFlash = 1.6;
  return true;
}

export function drawVeil(tools) {
  if (tools.veils <= 0 || tools.veilTime > 0) return false;
  tools.veils -= 1;
  tools.veilTime = 3;
  tools.lastAction = 'Mist veil released';
  tools.actionFlash = 1.6;
  return true;
}

export function updateTools(tools, dt) {
  tools.veilTime = Math.max(0, tools.veilTime - dt);
  tools.actionFlash = Math.max(0, tools.actionFlash - dt);
  for (const decoy of tools.activeDecoys) decoy.life -= dt;
  tools.activeDecoys = tools.activeDecoys.filter((decoy) => decoy.life > 0);
}

export function alarmForAction(tools, action) {
  const cost = action === 'decoy' ? RULES.decoyAlarm : RULES.veilAlarm;
  tools.lastAction = action === 'decoy' ? 'Decoy: +6 alarm' : 'Veil: +8 alarm';
  tools.actionFlash = 1.6;
  return cost;
}

export function alarmLevel(alarm) {
  return clamp(alarm / 100, 0, 1);
}
