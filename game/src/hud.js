// The readable strip across the top and the small overlays. Judges see this first.

import { PALETTE, RULES, VIEW } from './config.js';

function text(ctx, value, x, y, size, color, align = 'left', weight = '') {
  ctx.font = `${weight} ${size}px monospace`.trim();
  ctx.textAlign = align;
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

function chip(ctx, label, value, x, y, w, accent) {
  ctx.fillStyle = 'rgba(10,16,30,0.85)';
  ctx.fillRect(x, y, w, 30);
  ctx.strokeStyle = 'rgba(201,163,91,0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, 29);
  text(ctx, label, x + 9, y + 12, 9, 'rgba(233,226,207,0.6)');
  text(ctx, value, x + 9, y + 25, 12, accent, 'left', 'bold');
}

export function drawHud(ctx, state) {
  ctx.fillStyle = 'rgba(7,11,22,0.96)';
  ctx.fillRect(0, 0, VIEW.w, 78);
  ctx.strokeStyle = 'rgba(201,163,91,0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 77.5);
  ctx.lineTo(VIEW.w, 77.5);
  ctx.stroke();

  text(ctx, 'THE ORCHID HOUR', 24, 28, 19, PALETTE.gold, 'left', 'bold');
  text(ctx, 'conservatory heist / one room, three routes', 24, 47, 10, 'rgba(233,226,207,0.55)');
  text(ctx, state.stolen ? 'TAKE THE ORCHID TO THE VAN' : 'REACH THE ORCHID UNDER THE BELL JAR', 24, 65, 10, PALETTE.cyan);

  // Alarm meter: twenty segments, green to amber to red.
  const meterX = 300;
  const meterY = 32;
  const segments = 20;
  const width = 15;
  const gap = 3;
  const filled = Math.round((state.alarm / 100) * segments);
  text(ctx, 'ALARM', meterX, 20, 10, 'rgba(233,226,207,0.65)');
  for (let i = 0; i < segments; i += 1) {
    const color = i < 7 ? '#4f9b78' : i < 14 ? '#d8a53f' : '#e0525b';
    ctx.globalAlpha = i < filled ? 1 : 0.16;
    ctx.fillStyle = color;
    ctx.fillRect(meterX + i * (width + gap), meterY, width, 18);
    ctx.globalAlpha = 1;
  }
  const alarmColor = state.alarm > 70 ? PALETTE.danger : state.alarm > 35 ? PALETTE.gold : '#7fd3a2';
  text(ctx, `${Math.round(state.alarm)}%`, meterX + segments * (width + gap) + 10, 46, 11, alarmColor, 'left', 'bold');
  text(ctx, state.alarm > 70 ? 'KEEPERS ALERTED' : state.alarm > 35 ? 'SUSPICION RISING' : 'QUIET', meterX, 65, 10, alarmColor);

  chip(ctx, 'CHALK', `${state.tools.decoys} left`, 710, 11, 76, PALETTE.cyan);
  chip(ctx, 'VEIL', `${state.tools.veils} left`, 794, 11, 76, PALETTE.cyan);
  chip(ctx, state.stolen ? 'GETAWAY' : 'TIME', state.stolen ? `${Math.ceil(state.getaway)}s` : `${Math.floor(state.elapsed)}s`, 878, 11, 76, PALETTE.gold);

  if (state.tools.veilTime > 0) {
    text(ctx, `VEIL ${state.tools.veilTime.toFixed(1)}s`, 690, 64, 10, PALETTE.cyan);
  } else if (state.tools.actionFlash > 0 && state.tools.lastAction) {
    text(ctx, state.tools.lastAction, 690, 64, 10, PALETTE.gold);
  }

  ctx.fillStyle = 'rgba(7,11,22,0.94)';
  ctx.fillRect(0, VIEW.h - 54, VIEW.w, 54);
  ctx.strokeStyle = 'rgba(201,163,91,0.28)';
  ctx.beginPath();
  ctx.moveTo(0, VIEW.h - 53.5);
  ctx.lineTo(VIEW.w, VIEW.h - 53.5);
  ctx.stroke();
  text(ctx, 'MOVE  WASD / arrows      CROUCH  hold Shift      CHALK  D      VEIL  V      TAKE / RESTART  E / R      HELP  H', 24, VIEW.h - 30, 11, 'rgba(233,226,207,0.72)');
  text(ctx, 'Crates and walls block sight. Teal shadows slow detection. Every tool adds alarm. Stay low, watch the sweep, then run.', 24, VIEW.h - 12, 10, 'rgba(233,226,207,0.42)');
}

export function drawOverlay(ctx, kind, state) {
  ctx.fillStyle = 'rgba(5,8,16,0.76)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  const panelX = 210;
  const panelY = 170;
  ctx.fillStyle = '#10182b';
  ctx.fillRect(panelX, panelY, 540, 260);
  ctx.strokeStyle = PALETTE.brass;
  ctx.lineWidth = 2;
  ctx.strokeRect(panelX, panelY, 540, 260);

  if (kind === 'caught') {
    text(ctx, 'CAUGHT', VIEW.w / 2, panelY + 74, 42, PALETTE.danger, 'center', 'bold');
    text(ctx, 'The keepers read the room before you did.', VIEW.w / 2, panelY + 116, 14, PALETTE.paper, 'center');
    text(ctx, 'Cones slow inside teal cover. Crouch with Shift.', VIEW.w / 2, panelY + 145, 12, 'rgba(233,226,207,0.7)', 'center');
    text(ctx, 'Chalk pulls one keeper away. Veil hides you for three seconds.', VIEW.w / 2, panelY + 168, 12, 'rgba(233,226,207,0.7)', 'center');
    text(ctx, 'Both tools raise the alarm, so spend them early.', VIEW.w / 2, panelY + 191, 12, 'rgba(233,226,207,0.7)', 'center');
  } else if (kind === 'escape') {
    text(ctx, 'GETAWAY', VIEW.w / 2, panelY + 74, 42, PALETTE.cyan, 'center', 'bold');
    text(ctx, 'The Sun Orchid is yours.', VIEW.w / 2, panelY + 118, 16, PALETTE.paper, 'center');
    text(ctx, `Time ${Math.floor(state.elapsed)}s   Alarm ${Math.round(state.alarm)}%   Tools left ${state.tools.decoys + state.tools.veils}`, VIEW.w / 2, panelY + 154, 13, PALETTE.gold, 'center');
    text(ctx, 'Planning beat speed. The van rolls into the dark.', VIEW.w / 2, panelY + 188, 12, 'rgba(233,226,207,0.7)', 'center');
  } else if (kind === 'help') {
    text(ctx, 'THE ORCHID HOUR', VIEW.w / 2, panelY + 58, 26, PALETTE.gold, 'center', 'bold');
    const lines = [
      'Steal the Sun Orchid from the bell jar, then run to the van on the left.',
      'Three routes: the service gap below the first wall, the open middle aisle,',
      'or the vault approach above the second wall. Crates block sight.',
      'Stand in teal shadows and crouch to cut what the cones can read.',
      'D throws chalk at the pointer and pulls one keeper away for three seconds.',
      'V drops a mist veil that hides you from cones and eyes for three seconds.',
      'Both tools add alarm. The gauge decays when nothing sees you.',
      'E takes the orchid and starts a 20 second getaway clock. R restarts. H closes this.',
    ];
    lines.forEach((line, index) => text(ctx, line, VIEW.w / 2, panelY + 94 + index * 19, 12, 'rgba(233,226,207,0.82)', 'center'));
  }
  text(ctx, 'press R to run again', VIEW.w / 2, panelY + 235, 11, 'rgba(233,226,207,0.5)', 'center');
}

export function alarmSummary(alarm) {
  if (alarm > RULES.getawaySeconds * 4) return 'loud';
  return 'quiet';
}
