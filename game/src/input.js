// Keyboard and pointer state for the one-screen heist.

const held = new Set();
const pressed = new Set();

export const pointer = { x: 480, y: 300 };

export function bindInput(canvas) {
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
    if (!held.has(key)) pressed.add(key);
    held.add(key);
  });

  window.addEventListener('keyup', (event) => held.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => held.clear());

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) * (canvas.width / rect.width);
    pointer.y = (event.clientY - rect.top) * (canvas.height / rect.height);
  });
}

export function isDown(key) {
  return held.has(key);
}

// Consume a one-shot key press so a single tap fires one action.
export function takePress(key) {
  if (!pressed.has(key)) return false;
  pressed.delete(key);
  return true;
}

export function clearPresses() {
  pressed.clear();
}

export function moveVector() {
  let dx = 0;
  let dy = 0;
  if (held.has('a') || held.has('arrowleft')) dx -= 1;
  if (held.has('d') || held.has('arrowright')) dx += 1;
  if (held.has('w') || held.has('arrowup')) dy -= 1;
  if (held.has('s') || held.has('arrowdown')) dy += 1;
  if (dx && dy) {
    dx *= Math.SQRT1_2;
    dy *= Math.SQRT1_2;
  }
  return { dx, dy };
}
