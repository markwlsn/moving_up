import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createTitleScreen } from '../src/title.js';
import { createRomanceManager } from '../src/romance.js';
import { createPhone } from '../src/phone.js';
import { createStorage } from '../src/storage.js';

console.log('--- RUNNING PHASE 11 VERIFICATION TESTS ---');

// Mock storage
function makeMockStorage(hasSaveInitial = false) {
  let savedData = hasSaveInitial ? { version: 1, money: 500 } : null;
  return {
    hasSave: () => !!savedData,
    save: (d) => { savedData = d; return true; },
    load: () => savedData,
    deleteSave: () => { savedData = null; return true; }
  };
}

// 1. Title Screen State Machine Tests
{
  const stNoSave = makeMockStorage(false);
  let startGamePayload = null;
  const ts1 = createTitleScreen(stNoSave, (payload) => { startGamePayload = payload; }, { width: 480, height: 270 });
  
  assert.equal(ts1.state, 'title');
  assert.equal(ts1.hasSave, false);

  // Press interact on 'Start New Game'
  const mockKeys = (k) => (action) => action === k;
  ts1.update(mockKeys('interact'));
  assert.equal(ts1.state, 'preference', 'Should transition to preference selection');

  // Change preference to 'female' (index 1)
  ts1.update(mockKeys('down'));
  assert.equal(ts1.selectedIndex, 1);
  ts1.update(mockKeys('interact'));
  assert.equal(ts1.preference, 'female', 'Should record female preference');
  assert.equal(ts1.state, 'intro', 'Should transition to intro prologue');

  // Progress through prologue
  ts1.update(mockKeys('interact')); // step 1
  assert.equal(ts1.introStep, 1);
  ts1.update(mockKeys('interact')); // step 2
  assert.equal(ts1.introStep, 2);
  ts1.update(mockKeys('interact')); // finishes
  assert.deepEqual(startGamePayload, { isNew: true, preference: 'female' }, 'Should trigger new game with chosen preference');
  console.log('✓ Title screen: New Game flow and preference selection verified');
}

// 2. Title Screen Continue Game flow
{
  const stWithSave = makeMockStorage(true);
  let startGamePayload = null;
  const ts2 = createTitleScreen(stWithSave, (payload) => { startGamePayload = payload; }, { width: 480, height: 270 });

  assert.equal(ts2.hasSave, true);
  // Option 0 is 'Continue Game'
  ts2.update((k) => k === 'interact');
  assert.deepEqual(startGamePayload, { isNew: false }, 'Should trigger continue game');
  console.log('✓ Title screen: Continue Game flow verified');
}

// 3. Title Screen Controls Modal flow
{
  const st = makeMockStorage(false);
  const ts3 = createTitleScreen(st, () => {}, { width: 480, height: 270 });
  ts3.update((k) => k === 'down'); // Move to 'Controls & Guide'
  ts3.update((k) => k === 'interact');
  assert.equal(ts3.state, 'controls');
  ts3.update((k) => k === 'cancel');
  assert.equal(ts3.state, 'title');
  console.log('✓ Title screen: Controls modal toggle verified');
}

// 4. Phone candidate filtering by Romance Preference
{
  const npcsData = JSON.parse(readFileSync('data/npcs.json', 'utf8'));
  const mockToast = { show: () => {} };
  const mockNpcManager = { getHearts: () => 0 };

  // Preference: female
  const romFemale = createRomanceManager(npcsData, mockNpcManager, mockToast);
  romFemale.preference = 'female';
  const phoneFemale = createPhone(npcsData, romFemale, mockToast);
  
  phoneFemale.open();
  phoneFemale.selectContact();
  assert.equal(phoneFemale.activeChat.gender, 'female', 'Candidate must be female when preference is female');
  
  // Preference: male
  const romMale = createRomanceManager(npcsData, mockNpcManager, mockToast);
  romMale.preference = 'male';
  const phoneMale = createPhone(npcsData, romMale, mockToast);
  phoneMale.open();
  phoneMale.selectContact();
  assert.equal(phoneMale.activeChat.gender, 'male', 'Candidate must be male when preference is male');

  // Preference: both
  const romBoth = createRomanceManager(npcsData, mockNpcManager, mockToast);
  romBoth.preference = 'both';
  const phoneBoth = createPhone(npcsData, romBoth, mockToast);
  phoneBoth.open();
  let count = 0;
  for (let i = 0; i < 10; i++) {
    phoneBoth.selectContact();
    if (phoneBoth.activeChat) count++;
    phoneBoth.moveContact(1);
  }
  assert.equal(count, 10, 'All 10 candidates reachable when preference is both');
  console.log('✓ Modern Ligawan phone filtering responds to romance preference');
}

// 5. Crop and Economy Balance Verification
{
  const crops = JSON.parse(readFileSync('data/crops.json', 'utf8'));
  const items = JSON.parse(readFileSync('data/items.json', 'utf8'));
  const itemMap = Object.fromEntries(items.map(i => [i.id, i]));

  assert.equal(crops.length, 8, 'Should have exactly 8 crops');
  crops.forEach(c => {
    assert.ok(c.growDays >= 5 && c.growDays <= 10, `${c.id} growDays ${c.growDays} within cozy 5-10 day window`);
    assert.ok(c.sellPrice > c.seedPrice, `${c.id} sell price must exceed seed price`);
    assert.ok(c.seasons.length >= 1, `${c.id} must be tagged with at least one season part`);

    const cropItem = itemMap[c.id];
    assert.ok(cropItem, `Matching item for crop ${c.id} exists`);
    assert.equal(cropItem.sellPrice, c.sellPrice, `${c.id} item sell price matches crop definition`);

    const seedItem = itemMap[`seed_${c.id}`];
    assert.ok(seedItem, `Matching seed item for crop ${c.id} exists`);
    assert.equal(seedItem.buyPrice, c.seedPrice, `${c.id} seed item buy price matches crop seedPrice`);
  });
  console.log('✓ Economy & crop pricing balance consistency confirmed');
}

// 6. Villager Data Integrity (30 Villagers)
{
  const npcs = JSON.parse(readFileSync('data/npcs.json', 'utf8'));
  assert.equal(npcs.length, 30, 'Must have exactly 30 villagers');
  const romance = npcs.filter(n => n.tier === 'romance');
  const core = npcs.filter(n => n.tier === 'core');
  const light = npcs.filter(n => n.tier === 'light');

  assert.equal(romance.length, 10, 'Must have 10 romance candidates');
  assert.equal(core.length, 8, 'Must have 8 core villagers');
  assert.equal(light.length, 12, 'Must have 12 light villagers');

  const maleRomance = romance.filter(n => n.gender === 'male');
  const femaleRomance = romance.filter(n => n.gender === 'female');
  assert.equal(maleRomance.length, 5, 'Must have 5 male romance candidates');
  assert.equal(femaleRomance.length, 5, 'Must have 5 female romance candidates');

  npcs.forEach(n => {
    assert.ok(n.name, 'Every NPC has a name');
    assert.ok(n.role, `NPC ${n.id} has a role`);
    assert.ok(n.dialogue, `NPC ${n.id} has dialogue`);
    assert.ok(n.dialogue.intro || n.dialogue.default, `NPC ${n.id} has intro or default dialogue`);
    assert.ok(n.schedule.morning && n.schedule.afternoon && n.schedule.evening, `NPC ${n.id} has 3-period daily schedule`);
  });
  console.log('✓ 30 Villagers hierarchy and schedule integrity confirmed');
}

console.log('--- ALL PHASE 11 TESTS PASSED PERFECTLY! ---');
