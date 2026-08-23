let ctx: AudioContext | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let step = 0;

const MELODY = [523.25, 659.25, 783.99, 659.25, 880, 783.99, 659.25, 523.25];

function beep(freq: number) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  gain.gain.value = 0.05;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

export async function startMusic() {
  if (timer) return;
  ctx = ctx ?? new AudioContext();
  if (ctx.state === "suspended") await ctx.resume();
  timer = setInterval(() => {
    beep(MELODY[step % MELODY.length]!);
    step += 1;
  }, 420);
}

export function stopMusic() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
