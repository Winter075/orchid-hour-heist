// Drawing for the conservatory. Shapes, gradients and glow, no tile sheet.

import { BLOCKERS, EXIT, LOOT, PALETTE, ROOM, SHADOWS, VIEW, WALLS } from './config.js';

function rounded(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function glow(ctx, x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

export function drawRoom(ctx, time) {
  const background = ctx.createLinearGradient(0, 0, VIEW.w, VIEW.h);
  background.addColorStop(0, PALETTE.night);
  background.addColorStop(0.55, '#10182b');
  background.addColorStop(1, '#080d1a');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);

  ctx.save();
  ctx.beginPath();
  ctx.rect(ROOM.x, ROOM.y, ROOM.w, ROOM.h);
  ctx.clip();

  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(ROOM.x, ROOM.y, ROOM.w, ROOM.h);

  // Broad stone inlays, deliberately oversized so this never reads as a tile map.
  const panels = [
    [28, 88, 278, 210], [306, 88, 300, 210], [606, 88, 326, 210],
    [28, 298, 278, 242], [306, 298, 300, 242], [606, 298, 326, 242],
  ];
  panels.forEach(([x, y, w, h], index) => {
    ctx.fillStyle = index % 2 ? PALETTE.floor : PALETTE.floorAlt;
    ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
    ctx.strokeStyle = 'rgba(201,163,91,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 10.5, y + 10.5, w - 21, h - 21);
  });

  // Moonlight through the glass roof.
  for (let i = 0; i < 4; i += 1) {
    const x = 120 + i * 210;
    const drift = Math.sin(time * 0.12 + i) * 8;
    ctx.fillStyle = 'rgba(140,190,220,0.035)';
    ctx.beginPath();
    ctx.moveTo(x + drift, ROOM.y);
    ctx.lineTo(x + 90 + drift, ROOM.y);
    ctx.lineTo(x + 190 + drift, ROOM.y + ROOM.h);
    ctx.lineTo(x + 36 + drift, ROOM.y + ROOM.h);
    ctx.closePath();
    ctx.fill();
  }

  // Dust motes drift on a fixed clock so the room feels alive without random data.
  for (let i = 0; i < 34; i += 1) {
    const px = ROOM.x + ((i * 137 + time * (6 + (i % 5))) % ROOM.w);
    const py = ROOM.y + ((i * 83 + Math.sin(time * 0.5 + i) * 24 + ROOM.h * 4) % ROOM.h);
    ctx.fillStyle = `rgba(233,226,207,${0.05 + (i % 4) * 0.02})`;
    ctx.fillRect(px, py, 2, 2);
  }

  ctx.restore();

  // Brass frame and corner bolts.
  ctx.strokeStyle = PALETTE.brassDim;
  ctx.lineWidth = 6;
  ctx.strokeRect(ROOM.x - 3, ROOM.y - 3, ROOM.w + 6, ROOM.h + 6);
  ctx.strokeStyle = 'rgba(245,199,99,0.55)';
  ctx.lineWidth = 1;
  ctx.strokeRect(ROOM.x - 7.5, ROOM.y - 7.5, ROOM.w + 15, ROOM.h + 15);
  for (const [x, y] of [[ROOM.x, ROOM.y], [ROOM.x + ROOM.w, ROOM.y], [ROOM.x, ROOM.y + ROOM.h], [ROOM.x + ROOM.w, ROOM.y + ROOM.h]]) {
    glow(ctx, x, y, 14, 'rgba(245,199,99,0.16)');
    ctx.fillStyle = PALETTE.brass;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawCover(ctx) {
  for (const zone of SHADOWS) {
    ctx.save();
    rounded(ctx, zone.x, zone.y, zone.w, zone.h, 18);
    ctx.fillStyle = 'rgba(23,59,60,0.72)';
    ctx.fill();
    ctx.setLineDash([7, 7]);
    ctx.strokeStyle = 'rgba(140,230,224,0.22)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

export function drawFurniture(ctx) {
  for (const wall of WALLS) {
    ctx.save();
    ctx.strokeStyle = '#070b16';
    ctx.lineWidth = 17;
    ctx.beginPath();
    ctx.moveTo(wall.x1, wall.y1);
    ctx.lineTo(wall.x2, wall.y2);
    ctx.stroke();
    ctx.strokeStyle = PALETTE.brassDim;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(245,199,99,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  for (const block of BLOCKERS) {
    if (block.kind === 'crate') {
      rounded(ctx, block.x, block.y, block.w, block.h, 6);
      ctx.fillStyle = '#3a2e2c';
      ctx.fill();
      ctx.strokeStyle = 'rgba(201,163,91,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(201,163,91,0.25)';
      ctx.beginPath();
      ctx.moveTo(block.x + 6, block.y + 6);
      ctx.lineTo(block.x + block.w - 6, block.y + block.h - 6);
      ctx.moveTo(block.x + block.w - 6, block.y + 6);
      ctx.lineTo(block.x + 6, block.y + block.h - 6);
      ctx.stroke();
    } else if (block.kind === 'plinth') {
      glow(ctx, block.x + block.w / 2, block.y + block.h / 2, block.w * 0.8, 'rgba(63,143,131,0.12)');
      rounded(ctx, block.x, block.y, block.w, block.h, 9);
      ctx.fillStyle = '#1f3540';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140,230,224,0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(140,230,224,0.14)';
      ctx.fillRect(block.x + 10, block.y + 10, block.w - 20, 6);
    } else {
      rounded(ctx, block.x, block.y, block.w, block.h, 5);
      ctx.fillStyle = '#283044';
      ctx.fill();
      ctx.strokeStyle = 'rgba(201,163,91,0.38)';
      ctx.lineWidth = 2;
      ctx.stroke();
      for (let x = block.x + 14; x < block.x + block.w - 8; x += 26) {
        ctx.fillStyle = 'rgba(245,199,99,0.16)';
        ctx.fillRect(x, block.y + 8, 3, block.h - 16);
      }
    }
  }
}

export function drawCones(ctx, keepers, eyes) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (const guard of keepers) {
    const spec = guard.spec;
    const angle = guard.coneAngle || guard.facing;
    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);
    ctx.arc(guard.x, guard.y, spec.range, angle - spec.half, angle + spec.half);
    ctx.closePath();
    const gradient = ctx.createRadialGradient(guard.x, guard.y, 6, guard.x, guard.y, spec.range);
    const heat = guard.awareness;
    gradient.addColorStop(0, `rgba(255,${Math.round(120 - heat * 70)},${Math.round(110 - heat * 60)},0.34)`);
    gradient.addColorStop(1, 'rgba(255,70,80,0.01)');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = guard.seeing ? 'rgba(255,92,98,0.65)' : 'rgba(255,120,110,0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  for (const eye of eyes) {
    const spec = eye.spec;
    ctx.beginPath();
    ctx.moveTo(eye.x, eye.y);
    ctx.arc(eye.x, eye.y, spec.range, eye.angle - spec.half, eye.angle + spec.half);
    ctx.closePath();
    const gradient = ctx.createRadialGradient(eye.x, eye.y, 6, eye.x, eye.y, spec.range);
    gradient.addColorStop(0, eye.seeing ? 'rgba(255,90,96,0.38)' : 'rgba(245,199,99,0.24)');
    gradient.addColorStop(1, 'rgba(245,199,99,0.01)');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = eye.seeing ? 'rgba(255,92,98,0.7)' : 'rgba(245,199,99,0.3)';
    ctx.stroke();
  }
  ctx.restore();
}

export function drawKeepers(ctx, keepers) {
  for (const guard of keepers) {
    glow(ctx, guard.x, guard.y, 26, guard.seeing ? 'rgba(255,92,98,0.28)' : 'rgba(255,150,110,0.12)');
    ctx.save();
    ctx.translate(guard.x, guard.y);
    ctx.rotate(guard.facing);
    ctx.fillStyle = '#3c2130';
    ctx.beginPath();
    ctx.moveTo(-6, -9);
    ctx.lineTo(-15, 0);
    ctx.lineTo(-6, 9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6d2f3c';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.brass;
    ctx.beginPath();
    ctx.arc(4, 0, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (guard.awareness > 0.15) {
      ctx.fillStyle = guard.awareness > 0.6 ? PALETTE.danger : PALETTE.gold;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(guard.awareness > 0.6 ? '!' : '?', guard.x, guard.y - 20);
    }
  }
}

export function drawEyes(ctx, eyes) {
  for (const eye of eyes) {
    glow(ctx, eye.x, eye.y, 22, eye.seeing ? 'rgba(255,92,98,0.3)' : 'rgba(245,199,99,0.14)');
    ctx.save();
    ctx.translate(eye.x, eye.y);
    ctx.fillStyle = '#2a2f3f';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.brass;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.rotate(eye.angle);
    ctx.fillStyle = eye.seeing ? PALETTE.danger : PALETTE.gold;
    ctx.fillRect(4, -4, 12, 8);
    ctx.restore();
  }
}

export function drawLoot(ctx, time, stolen) {
  const { x, y } = LOOT;
  if (stolen) {
    ctx.strokeStyle = 'rgba(245,199,99,0.45)';
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    return;
  }

  glow(ctx, x, y, 62, 'rgba(245,199,99,0.2)');
  ctx.fillStyle = 'rgba(9,14,26,0.85)';
  ctx.beginPath();
  ctx.ellipse(x, y + 18, 32, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gold orchid under a bell jar.
  ctx.save();
  ctx.translate(x, y + 4);
  const sway = Math.sin(time * 1.1) * 2;
  ctx.strokeStyle = '#8f7a3e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.quadraticCurveTo(sway, 0, sway, -16);
  ctx.stroke();
  for (let petal = 0; petal < 5; petal += 1) {
    const a = (petal / 5) * Math.PI * 2 + time * 0.08;
    ctx.fillStyle = petal % 2 ? '#f5c763' : '#ffdf92';
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * 9 + sway, Math.sin(a) * 8 - 17, 5, 10, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fff3c8';
  ctx.beginPath();
  ctx.arc(sway, -17, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = 'rgba(190,230,230,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 24, y + 18);
  ctx.lineTo(x - 24, y - 14);
  ctx.quadraticCurveTo(x - 24, y - 36, x, y - 36);
  ctx.quadraticCurveTo(x + 24, y - 36, x + 24, y - 14);
  ctx.lineTo(x + 24, y + 18);
  ctx.stroke();
  ctx.fillStyle = 'rgba(180,225,225,0.09)';
  ctx.fill();
}

export function drawExit(ctx, time, active) {
  const exit = EXIT;
  const pulse = 0.5 + Math.sin(time * 3) * 0.5;
  glow(ctx, exit.x, exit.y, active ? 58 + pulse * 12 : 28, active ? 'rgba(140,230,224,0.3)' : 'rgba(201,163,91,0.12)');
  ctx.save();
  ctx.translate(exit.x, exit.y);
  ctx.strokeStyle = active ? PALETTE.cyan : PALETTE.brassDim;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, exit.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([5, 7]);
  ctx.strokeStyle = active ? 'rgba(140,230,224,0.7)' : 'rgba(201,163,91,0.3)';
  ctx.beginPath();
  ctx.arc(0, 0, exit.r - 7, time * (active ? 1.2 : 0.3), time * (active ? 1.2 : 0.3) + Math.PI * 1.6);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = active ? PALETTE.paper : PALETTE.brassDim;
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(active ? 'ESCAPE' : 'VAN', 0, 4);
  ctx.restore();
}

export function drawDecoys(ctx, decoys) {
  for (const decoy of decoys) {
    const alpha = Math.min(1, decoy.life);
    ctx.save();
    ctx.globalAlpha = alpha;
    glow(ctx, decoy.x, decoy.y, 28, 'rgba(140,230,224,0.24)');
    ctx.fillStyle = PALETTE.cyan;
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2;
      ctx.fillRect(decoy.x + Math.cos(a) * 9 - 1.5, decoy.y + Math.sin(a) * 9 - 1.5, 3, 3);
    }
    ctx.restore();
  }
}

export function drawThief(ctx, thief, veiled, crouching, time) {
  const { x, y } = thief;
  if (veiled) glow(ctx, x, y, 46, 'rgba(140,230,224,0.34)');
  else glow(ctx, x, y, 30, 'rgba(245,199,99,0.18)');

  ctx.save();
  ctx.translate(x, y);
  const bob = crouching ? 1 : Math.sin(time * 9) * 1.4;

  // A thin brass ring keeps the thief findable when the sheet is shrunk.
  ctx.strokeStyle = veiled ? 'rgba(140,230,224,0.75)' : 'rgba(245,199,99,0.55)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.arc(0, 0, 19 + Math.sin(time * 2) * 1.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = veiled ? 'rgba(140,230,224,0.35)' : 'rgba(7,11,22,0.6)';
  ctx.beginPath();
  ctx.ellipse(0, 15, 15, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = veiled ? '#1c6063' : '#1d2940';
  ctx.beginPath();
  ctx.moveTo(0, -19 + bob);
  ctx.quadraticCurveTo(15, -7 + bob, 13, 14);
  ctx.lineTo(-13, 14);
  ctx.quadraticCurveTo(-15, -7 + bob, 0, -19 + bob);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#080d1a';
  ctx.beginPath();
  ctx.arc(0, -9 + bob, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.cyan;
  ctx.fillRect(-5, -10 + bob, 10, 3);

  ctx.fillStyle = PALETTE.paper;
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('WREN', 0, -25 + bob);
  ctx.restore();
}
