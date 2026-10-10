// In-game clock + calendar.
// Time is minutes since midnight of the current day; values past 1440 mean "after midnight"
// (e.g. 1500 = 1:00 AM, still the same in-game day until the player sleeps or passes out).
export function createClock(cfg, calendar) {
  const daysPerYear = calendar.daysPerPart * calendar.parts.length;
  const clock = {
    day: 1, // absolute day number, starting at 1
    minutes: cfg.wakeHour * 60,
    paused: false,
    _acc: 0,
  };
  const passOutAt = cfg.passOutHour * 60;
  const lateAt = cfg.lateHour * 60;

  // Advances time. Returns 'passout' on the tick the pass-out time is reached.
  clock.update = function (dt) {
    if (clock.paused) return null;
    clock._acc += dt;
    while (clock._acc >= cfg.realSecondsPerGameMinute) {
      clock._acc -= cfg.realSecondsPerGameMinute;
      if (clock.addMinutes(1)) return 'passout';
    }
    return null;
  };

  // Returns true if this pushed time to (or past) pass-out.
  clock.addMinutes = function (n) {
    clock.minutes = Math.min(passOutAt, clock.minutes + n);
    return clock.minutes >= passOutAt;
  };

  clock.isLate = () => clock.minutes >= lateAt;

  clock.startNewDay = function () {
    clock.day++;
    clock.minutes = cfg.wakeHour * 60;
    clock._acc = 0;
  };

  clock.date = function (day = clock.day) {
    const i = day - 1;
    const partIndex = Math.floor((i % daysPerYear) / calendar.daysPerPart);
    const part = calendar.parts[partIndex];
    return {
      year: Math.floor(i / daysPerYear) + 1,
      part,
      dayOfPart: (i % calendar.daysPerPart) + 1,
      weekday: calendar.weekdays[i % calendar.weekdays.length],
    };
  };

  // 12-hour format, e.g. "4:00 AM", "12:00 AM" (midnight), "1:30 AM".
  clock.timeText = function () {
    const m = clock.minutes % 1440;
    const h24 = Math.floor(m / 60);
    const mm = String(m % 60).padStart(2, '0');
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${mm} ${h24 < 12 ? 'AM' : 'PM'}`;
  };

  clock.dateText = function (day) {
    const d = clock.date(day);
    return `${d.weekday}, ${d.part.name} ${d.dayOfPart} (Year ${d.year})`;
  };

  return clock;
}
