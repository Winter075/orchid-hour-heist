// Wall-mounted glass eyes. Slow, wide sweeps that reward watching the rhythm.

import { EYES } from './config.js';
import { angleDifference, inShadow, lineOfSight } from './world.js';

export function createEyes() {
  return EYES.map((spec, index) => ({
    spec,
    index,
    x: spec.x,
    y: spec.y,
    angle: spec.base,
    seeing: false,
    awareness: 0,
  }));
}

export function updateEyes(eyes, dt, time, thief, veiled) {
  let detected = 0;

  for (const eye of eyes) {
    const spec = eye.spec;
    eye.angle = spec.base + Math.sin(time * spec.speed + spec.index * 2.2) * spec.sweep;

    const dx = thief.x - eye.x;
    const dy = thief.y - eye.y;
    const distance = Math.hypot(dx, dy);
    let sees = false;

    if (!veiled && distance < spec.range && Math.abs(angleDifference(Math.atan2(dy, dx), eye.angle)) < spec.half) {
      sees = lineOfSight(eye.x, eye.y, thief.x, thief.y);
    }

    eye.seeing = sees;
    eye.awareness = Math.max(0, Math.min(1, eye.awareness + (sees ? dt * 2.8 : -dt * 1.5)));

    if (sees && distance > 0) {
      const closeness = 1.15 - (distance / spec.range) * 0.4;
      detected += 21 * closeness * (inShadow(thief.x, thief.y) ? 0.34 : 1);
    }
  }

  return detected;
}
