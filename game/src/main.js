// The Orchid Hour: one screen, one prize, one alarm gauge.

import { EXIT, LOOT, PALETTE, RULES, THIEF_START, VIEW, clamp } from './config.js';
import { bindInput, clearPresses, isDown, moveVector, pointer, takePress } from './input.js';
import { canStand, inShadow, moveWithCollision } from './world.js';
import { createKeepers, updateKeepers } from './guards.js';
import { createEyes, updateEyes } from './cameras.js';
import { alarmForAction, createTools, drawVeil, throwDecoy, updateTools } from './tools.js';
import { cue } from './sound.js';
import {
  drawCones, drawCover, drawDecoys, drawEyes, drawExit, drawFurniture,
  drawKeepers, drawLoot, drawRoom, drawThief,
} from './render.js';
import { drawHud, drawOverlay } from './hud.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
bindInput(canvas);

const state = {
  mode: 'play',
  thief: { ...THIEF_START },
  keepers: createKeepers(),
  eyes: createEyes(),
  tools: createTools(),
  alarm: 0,
  elapsed: 0,
  getaway: RULES.getawaySeconds,
  stolen: false,
  spottedFlash: 0,
};

let last = performance.now();

function resize() {
  const ratio = Math.min(window.innerWidth / VIEW.w, window.innerHeight / VIEW.h);
  canvas.width = Math.round(window.innerWidth);
  canvas.height = Math.round(window.innerHeight);
  ctx.setTransform(ratio, 0, 0, ratio, (canvas.width - VIEW.w * ratio) / 2, (canvas.height - VIEW.h * ratio) / 2);
}
window.addEventListener('resize', resize);
resize();

function restart() {
  state.mode = 'play';
  state.thief = { ...THIEF_START };
  state.keepers = createKeepers();
  state.eyes = createEyes();
  state.tools = createTools();
  state.alarm = 0;
  state.elapsed = 0;
  state.getaway = RULES.getawaySeconds;
  state.stolen = false;
  state.spottedFlash = 0;
  clearPresses();
}

function handleActions() {
  if (takePress('r')) restart();
  if (takePress('h')) {
    state.mode = state.mode === 'help' ? 'play' : 'help';
  }
  if (state.mode !== 'play') return;

  if (takePress('d')) {
    const target = { x: clamp(pointer.x, 40, 920), y: clamp(pointer.y, 100, 528) };
    if (throwDecoy(state.tools, state.keepers, target)) {
      state.alarm += alarmForAction(state.tools, 'decoy');
      cue('decoy');
    }
  }
  if (takePress('v')) {
    if (drawVeil(state.tools)) {
      state.alarm += alarmForAction(state.tools, 'veil');
      cue('veil');
    }
  }
  if (takePress('e') && !state.stolen) {
    if (Math.hypot(state.thief.x - LOOT.x, state.thief.y - LOOT.y) < 46) {
      state.stolen = true;
      state.getaway = RULES.getawaySeconds;
      state.alarm += RULES.stealAlarm;
      cue('steal');
    }
  }
}

function step(dt) {
  if (state.mode !== 'play') return;
  state.elapsed += dt;

  const crouching = isDown('shift');
  const speed = crouching ? RULES.crouchSpeed : RULES.walkSpeed;
  const vector = moveVector();
  moveWithCollision(state.thief, vector.dx * speed * dt, vector.dy * speed * dt, 10);

  updateTools(state.tools, dt);

  const decoy = state.tools.activeDecoys[state.tools.activeDecoys.length - 1] || null;
  const veiled = state.tools.veilTime > 0;
  const guardPressure = updateKeepers(state.keepers, dt, state.elapsed, state.thief, decoy, veiled);
  const eyePressure = updateEyes(state.eyes, dt, state.elapsed, state.thief, veiled);
  const pressure = guardPressure + eyePressure;

  state.alarm = clamp(state.alarm + (pressure - RULES.alarmDecay) * dt, 0, 100);
  if (pressure > 18 && state.alarm > 40) state.spottedFlash = 1;
  state.spottedFlash = Math.max(0, state.spottedFlash - dt * 1.8);

  if (state.alarm >= 100) {
    state.mode = 'caught';
    cue('spotted');
    return;
  }

  if (state.stolen) {
    state.getaway -= dt;
    if (state.getaway <= 0) {
      state.getaway = 0;
      state.mode = 'caught';
      cue('spotted');
      return;
    }
    if (Math.hypot(state.thief.x - EXIT.x, state.thief.y - EXIT.y) < EXIT.r) {
      state.mode = 'escape';
      cue('escape');
    }
  }
}

function paint() {
  ctx.save();
  drawRoom(ctx, state.elapsed);
  drawCover(ctx);
  drawExit(ctx, state.elapsed, state.stolen);
  drawLoot(ctx, state.elapsed, state.stolen);
  drawFurniture(ctx);
  drawDecoys(ctx, state.tools.activeDecoys);
  drawCones(ctx, state.keepers, state.eyes);
  drawKeepers(ctx, state.keepers);
  drawEyes(ctx, state.eyes);
  drawThief(ctx, state.thief, state.tools.veilTime > 0, isDown('shift'), state.elapsed);

  if (state.spottedFlash > 0) {
    ctx.fillStyle = `rgba(224,82,91,${state.spottedFlash * 0.13})`;
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  }
  drawHud(ctx, state);

  if (state.mode !== 'play') drawOverlay(ctx, state.mode, state);
  ctx.restore();
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  handleActions();
  if (!state.frozen) step(dt);
  try {
    paint();
  } catch (error) {
    window.__orchidError = String(error && (error.stack || error));
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Small hook used for test captures and manual play checks.
window.__orchid = {
  state,
  restart,
  snapshot(mode) {
    restart();
    if (mode === 'cover') {
      state.thief.x = 468;
      state.thief.y = 424;
      state.elapsed = 6;
      state.alarm = 12;
    }
    if (mode === 'crossing') {
      state.thief.x = 388;
      state.thief.y = 420;
      state.elapsed = 12;
      state.alarm = 36;
      state.tools.decoys = 1;
      state.tools.activeDecoys = [{ x: 470, y: 452, life: 2.2 }];
    }
    if (mode === 'spotted') {
      state.thief.x = 196;
      state.thief.y = 468;
      state.keepers[0].x = 180;
      state.keepers[0].y = 390;
      state.keepers[0].facing = Math.PI / 2;
      state.keepers[0].coneAngle = Math.PI / 2;
      state.keepers[0].awareness = 1;
      state.keepers[0].seeing = true;
      state.elapsed = 17;
      state.alarm = 82;
      state.spottedFlash = 1;
    }
    if (mode === 'getaway') {
      state.thief.x = 280;
      state.thief.y = 470;
      state.stolen = true;
      state.alarm = 54;
      state.getaway = 14;
      state.elapsed = 26;
      state.tools.veils = 1;
    }
    paint();
  },
};

// A fixed moment for taking stills of the game's own renderer.
const shot = location.hash.replace('#shot=', '');
if (['cover', 'crossing', 'spotted', 'getaway'].includes(shot)) {
  window.__orchid.snapshot(shot);
  state.frozen = true;
}
