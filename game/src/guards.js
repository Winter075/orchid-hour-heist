// The keepers: patrols, lantern cones, sight checks and decoy investigation.

import { KEEPERS } from './config.js';
import { angleDifference, inShadow, lineOfSight, moveWithCollision } from './world.js';

export function createKeepers() {
  return KEEPERS.map((spec, index) => ({
    spec,
    index,
    x: spec.from.x,
    y: spec.from.y,
    facing: Math.PI / 2,
    progress: index === 1 ? 0.35 : 0.1,
    direction: 1,
    wait: 0,
    awareness: 0,
    investigating: null,
    seeing: false,
  }));
}

export function updateKeepers(keepers, dt, time, thief, decoy, veiled) {
  let detected = 0;

  for (const guard of keepers) {
    const spec = guard.spec;

    if (guard.wait > 0) {
      guard.wait -= dt;
    } else if (guard.investigating && guard.investigating.life > 0) {
      guard.investigating.life -= dt;
      const target = guard.investigating;
      const dx = target.x - guard.x;
      const dy = target.y - guard.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 8) {
        const speed = spec.speed * 1.15;
        moveWithCollision(guard, (dx / distance) * speed * dt, (dy / distance) * speed * dt, 11);
        guard.facing = Math.atan2(dy, dx);
      } else {
        guard.facing += dt * 1.1;
      }
    } else {
      guard.investigating = null;
      const span = Math.hypot(spec.to.x - spec.from.x, spec.to.y - spec.from.y);
      guard.progress += (guard.direction * spec.speed * dt) / span;
      if (guard.progress >= 1) {
        guard.progress = 1;
        guard.direction = -1;
        guard.wait = spec.pause;
      } else if (guard.progress <= 0) {
        guard.progress = 0;
        guard.direction = 1;
        guard.wait = spec.pause;
      }
      guard.x = spec.from.x + (spec.to.x - spec.from.x) * guard.progress;
      guard.y = spec.from.y + (spec.to.y - spec.from.y) * guard.progress;
      guard.facing = Math.atan2(spec.to.y - spec.from.y, spec.to.x - spec.from.x) * guard.direction;
      if (guard.direction < 0) guard.facing += Math.PI;
    }

    const sweep = Math.sin(time * 1.35 + guard.index * 1.9) * spec.sweep;
    const coneAngle = guard.facing + sweep;
    guard.coneAngle = coneAngle;

    const dx = thief.x - guard.x;
    const dy = thief.y - guard.y;
    const distance = Math.hypot(dx, dy);
    let sees = false;

    if (!veiled && distance < spec.range && Math.abs(angleDifference(Math.atan2(dy, dx), coneAngle)) < spec.half) {
      sees = lineOfSight(guard.x, guard.y, thief.x, thief.y);
    }

    guard.seeing = sees;
    guard.awareness = Math.max(0, Math.min(1, guard.awareness + (sees ? dt * 2.4 : -dt * 1.3)));

    if (sees && distance > 0) {
      const closeness = 1.25 - (distance / spec.range) * 0.55;
      detected += 26 * closeness * (inShadow(thief.x, thief.y) ? 0.34 : 1);
    }
  }

  return detected;
}

export function sendDecoy(keepers, decoy) {
  let nearest = null;
  let best = Infinity;
  for (const guard of keepers) {
    const distance = Math.hypot(guard.x - decoy.x, guard.y - decoy.y);
    if (distance < best && distance < 420) {
      best = distance;
      nearest = guard;
    }
  }
  if (nearest) {
    nearest.investigating = { x: decoy.x, y: decoy.y, life: 3.6 };
    nearest.awareness = Math.max(nearest.awareness, 0.45);
  }
}
