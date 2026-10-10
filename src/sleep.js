import { wasPressed } from './input.js';

// Sleep flow: confirm prompt -> fade out -> resolve new day & earnings -> show date card -> fade in.
// Also handles passing out at 2:00 AM (with medical penalty and reduced energy).
export function createSleep(cfg, { clock, energy, width, height, hud }) {
  const s = {
    state: 'idle',
    t: 0,
    passedOut: false,
    message: '',
    overnightInfo: null,
  };

  s.isBlocking = () => s.state !== 'idle';

  s.askToSleep = () => { s.state = 'confirm'; clock.paused = true; };

  s.passOut = () => {
    s.passedOut = true;
    s.message = 'You passed out from exhaustion...';
    begin();
  };

  function begin() {
    s.state = 'fadeOut';
    s.t = 0;
    clock.paused = true;
  }

  function resolveNewDay() {
    let restore;
    if (s.passedOut) restore = cfg.restorePassOut;
    else if (clock.isLate()) restore = cfg.restoreAfterLate;
    else restore = cfg.restoreBeforeLate;

    clock.startNewDay();
    energy.restoreFraction(restore);
    s.restoredPercent = Math.round(restore * 100);

    let info = null;
    if (s.onOvernight) {
      info = s.onOvernight({ passedOut: s.passedOut });
    }
    s.overnightInfo = info;
    if (s.onNewDay) s.onNewDay();
  }

  s.update = function (dt) {
    switch (s.state) {
      case 'confirm':
        if (wasPressed('interact')) { s.passedOut = false; s.message = ''; begin(); }
        else if (wasPressed('cancel')) { s.state = 'idle'; clock.paused = false; }
        break;
      case 'fadeOut':
        s.t += dt;
        if (s.t >= cfg.fadeSeconds) { resolveNewDay(); s.state = 'hold'; s.t = 0; }
        break;
      case 'hold':
        s.t += dt;
        if (s.t >= cfg.holdSeconds) { s.state = 'fadeIn'; s.t = 0; }
        break;
      case 'fadeIn':
        s.t += dt;
        if (s.t >= cfg.fadeSeconds) { s.state = 'idle'; clock.paused = false; }
        break;
    }
  };

  s.render = function (ctx) {
    ctx.font = '8px monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    if (s.state === 'confirm') {
      const w = 220, h = 44, x = (width - w) / 2, y = height - h - 30;
      ctx.fillStyle = hud.panelColor;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = hud.textColor;
      ctx.fillText('Go to sleep for the night?', width / 2, y + 14);
      ctx.fillText('[Space/J] Sleep    [Esc/K] Not yet', width / 2, y + 30);
    } else if (s.state !== 'idle') {
      let a = 1;
      if (s.state === 'fadeOut') a = s.t / cfg.fadeSeconds;
      if (s.state === 'fadeIn') a = 1 - s.t / cfg.fadeSeconds;
      ctx.fillStyle = `rgba(0,0,0,${Math.min(1, Math.max(0, a))})`;
      ctx.fillRect(0, 0, width, height);
      if (s.state === 'hold') {
        const d = clock.date();
        ctx.fillStyle = d.part.color;
        ctx.fillText(d.part.name, width / 2, height / 2 - 20);
        ctx.fillStyle = '#fff';
        ctx.fillText(`${d.weekday}, Day ${d.dayOfPart}  -  Year ${d.year}`, width / 2, height / 2 - 6);
        ctx.fillText(`Good morning! Energy restored to ${s.restoredPercent}%`, width / 2, height / 2 + 10);

        let offY = 24;
        if (s.overnightInfo && s.overnightInfo.earnings > 0) {
          ctx.fillStyle = '#a3e635';
          ctx.fillText(`Shipped in Kaing: +₱${s.overnightInfo.earnings}`, width / 2, height / 2 + offY);
          offY += 13;
        }
        if (s.overnightInfo && s.overnightInfo.penalty > 0) {
          ctx.fillStyle = hud.lateColor;
          ctx.fillText(`Clinic Fee (Passed Out): -₱${s.overnightInfo.penalty}`, width / 2, height / 2 + offY);
          offY += 13;
        }
        if (s.message) {
          ctx.fillStyle = hud.lateColor;
          ctx.fillText(s.message, width / 2, height / 2 + offY);
        }
      }
    }
    ctx.textAlign = 'left';
  };

  return s;
}
