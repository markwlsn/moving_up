// Modern Ligawan Romance, Marriage, and Family System:
// Models healthy modern Filipino dating stages: Crush -> Talking Stage -> DTR -> Mag-Jowa -> Engaged -> Married -> Children.
export function createRomanceManager(npcsData, npcManager, toast) {
  const candidates = npcsData.filter((n) => n.tier === 'romance');

  const rom = {
    preference: 'both', // 'male', 'female', or 'both'
    spouseId: null,
    children: [], // array of { name, stage: 'baby'|'toddler'|'child', ageDays }
    data: {},
  };

  candidates.forEach((c) => {
    rom.data[c.id] = {
      vibeMatch: 50, // 0 to 100%
      stage: 'Crush',
      datingConfirmed: false,
    };
  });

  rom.getHearts = (id) => npcManager.getHearts(id);

  rom.getStage = (id) => rom.data[id]?.stage || 'Crush';

  rom.addVibe = (id, delta) => {
    if (!rom.data[id]) return;
    rom.data[id].vibeMatch = Math.max(0, Math.min(100, rom.data[id].vibeMatch + delta));
  };

  rom.defineRelationship = (id) => {
    const hearts = rom.getHearts(id);
    const d = rom.data[id];
    const candidate = npcsData.find((n) => n.id === id);

    if (hearts < 5) {
      toast.show(`${candidate.name}: "Let's take it slow muna, okay?" (Need 5+ Hearts)`);
      return false;
    }

    if (d.stage === 'Crush') {
      d.stage = 'Talking Stage';
      toast.show(`❤️ You and ${candidate.name} entered the Talking Stage!`);
      return true;
    } else if (d.stage === 'Talking Stage') {
      if (hearts >= 7 && d.vibeMatch >= 60) {
        d.stage = 'Mag-jowa (Official)';
        toast.show(`💖 "Official na tayo!" ${candidate.name} is now your jowa!`);
        return true;
      } else {
        toast.show(`${candidate.name}: "I like you a lot, let's keep going on dates first!"`);
        return false;
      }
    }
    return false;
  };

  rom.propose = (id, hasUpgradedFarmhouse) => {
    const candidate = npcsData.find((n) => n.id === id);
    const d = rom.data[id];
    const hearts = rom.getHearts(id);

    if (!hasUpgradedFarmhouse) {
      toast.show("Expand Bukid ni Lolo farmhouse first via Bayanihan to welcome your spouse!");
      return false;
    }

    if (hearts >= 10 && d.stage === 'Mag-jowa (Official)') {
      d.stage = 'Engaged';
      rom.spouseId = id;
      toast.show(`💍 ${candidate.name} said YES! You are now Engaged!`);
      return true;
    } else {
      toast.show(`${candidate.name} is touched, but feels it's not the right moment yet.`);
      return false;
    }
  };

  rom.marry = (id) => {
    rom.spouseId = id;
    if (rom.data[id]) rom.data[id].stage = 'Married';
    const c = npcsData.find((n) => n.id === id);
    toast.show(`💒 KASAL NA KAYO! Married to ${c.name}!`);
  };

  rom.haveChild = (name = 'Liwayway') => {
    if (!rom.spouseId || rom.children.length >= 2) return false;
    rom.children.push({ name, stage: 'baby', ageDays: 1 });
    toast.show(`👶 Welcome baby ${name} to your growing family!`);
    return true;
  };

  rom.onNewDay = (farm) => {
    // Spouse morning help
    if (rom.spouseId) {
      // Spouse automatically waters several crop plots in the morning!
      farm.waterAll();
    }
    // Children growth
    rom.children.forEach((ch) => {
      ch.ageDays++;
      if (ch.ageDays > 28 && ch.stage === 'baby') ch.stage = 'toddler';
      else if (ch.ageDays > 56 && ch.stage === 'toddler') ch.stage = 'child';
    });
  };

  return rom;
}
