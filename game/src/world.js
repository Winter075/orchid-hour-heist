// Movement, furniture collisions and line of sight.

import { BLOCKERS, ROOM, SHADOWS, WALLS, clamp } from './config.js';

function hitsBlocker(x, y, radius) {
  for (const b of BLOCKERS) {
    const cx = clamp(x, b.x, b.x + b.w);
    const cy = clamp(y, b.y, b.y + b.h);
    const dx = x - cx;
    const dy = y - cy;
    if (dx * dx + dy * dy < radius * radius) return true;
  }
  return false;
}

function hitsWall(x, y, radius) {
  for (const w of WALLS) {
    const cx = clamp(x, Math.min(w.x1, w.x2), Math.max(w.x1, w.x2));
    const cy = clamp(y, Math.min(w.y1, w.y2), Math.max(w.y1, w.y2));
    const dx = x - cx;
    const dy = y - cy;
    if (dx * dx + dy * dy < radius * radius) return true;
  }
  return false;
}

export function canStand(x, y, radius = 10) {
  if (x < ROOM.x + radius || x > ROOM.x + ROOM.w - radius) return false;
  if (y < ROOM.y + radius || y > ROOM.y + ROOM.h - radius) return false;
  return !hitsBlocker(x, y, radius) && !hitsWall(x, y, radius);
}

// Move one axis at a time so the thief slides along furniture instead of sticking.
export function moveWithCollision(pos, dx, dy, radius = 10) {
  const stepX = clamp(dx, -14, 14);
  const stepY = clamp(dy, -14, 14);
  if (canStand(pos.x + stepX, pos.y, radius)) pos.x += stepX;
  if (canStand(pos.x, pos.y + stepY, radius)) pos.y += stepY;
}

function segmentHitsRect(x1, y1, x2, y2, rect) {
  let tMin = 0;
  let tMax = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;

  for (const [start, delta, low, high] of [
    [x1, dx, rect.x, rect.x + rect.w],
    [y1, dy, rect.y, rect.y + rect.h],
  ]) {
    if (Math.abs(delta) < 1e-8) {
      if (start < low || start > high) return false;
      continue;
    }
    let t1 = (low - start) / delta;
    let t2 = (high - start) / delta;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }
  return tMax >= 0 && tMin <= 1;
}

function segmentHitsLine(x1, y1, x2, y2, wall) {
  const r = { x: x2 - x1, y: y2 - y1 };
  const s = { x: wall.x2 - wall.x1, y: wall.y2 - wall.y1 };
  const denom = r.x * s.y - r.y * s.x;
  if (Math.abs(denom) < 1e-8) return false;
  const t = ((wall.x1 - x1) * s.y - (wall.y1 - y1) * s.x) / denom;
  const u = ((wall.x1 - x1) * r.y - (wall.y1 - y1) * r.x) / denom;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

export function lineOfSight(x1, y1, x2, y2) {
  for (const b of BLOCKERS) {
    if (segmentHitsRect(x1, y1, x2, y2, b)) return false;
  }
  for (const w of WALLS) {
    if (segmentHitsLine(x1, y1, x2, y2, w)) return false;
  }
  return true;
}

export function inShadow(x, y) {
  return SHADOWS.some((s) => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h);
}

export function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
