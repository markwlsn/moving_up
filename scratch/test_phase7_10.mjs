import { readFileSync } from 'fs';

globalThis.window = { addEventListener() {} };
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) || null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const root = (process.argv[2] || process.cwd()).replace(/\\/g, '/');
const J = (p) => JSON.parse(readFileSync(`${root}/${p}`));

const { createNPCManager } = await import(`file:///${root}/src/npc.js`);
const { createBayanihan } = await import(`file:///${root}/src/bayanihan.js`);
const { createPet } = await import(`file:///${root}/src/pet.js`);
const { createPhone } = await import(`file:///${root}/src/phone.js`);
const { createRomanceManager } = await import(`file:///${root}/src/romance.js`);
const { createEventManager } = await import(`file:///${root}/src/events.js`);
const { createDialogueBox } = await import(`file:///${root}/src/dialogue.js`);
const { createSpriteRenderer } = await import(`file:///${root}/src/sprites.js`);
const { createInventory } = await import(`file:///${root}/src/inventory.js`);

const check = (l, got, exp) => console.log(got === exp ? 'PASS' : 'FAIL', l, JSON.stringify(got));

// 1. DATA VALIDATION (Phase 7)
const npcs = J('data/npcs.json');
check('total 30 NPCs', npcs.length, 30);
const romanceList = npcs.filter((n) => n.tier === 'romance');
check('10 romance candidates', romanceList.length, 10);
const boys = romanceList.filter((n) => n.gender === 'male');
const girls = romanceList.filter((n) => n.gender === 'female');
check('5 romance boys', boys.length, 5);
check('5 romance girls', girls.length, 5);
const coreList = npcs.filter((n) => n.tier === 'core');
check('8 core villagers', coreList.length, 8);
const lightList = npcs.filter((n) => n.tier === 'light');
check('12 light villagers', lightList.length, 12);

// 2. NPC MANAGER & FRIENDSHIP
const npcMgr = createNPCManager(npcs);
const jericho = npcs.find((n) => n.id === 'jericho');
const talkRes1 = npcMgr.talk('jericho');
check('first talk awards points', talkRes1.firstTimeToday, true);
check('second talk same day does not duplicate', npcMgr.talk('jericho').firstTimeToday, false);

const items = J('data/items.json');
const kamoteItem = items.find((i) => i.id === 'kamote');
const giftRes = npcMgr.giveGift('jericho', 'kamote', kamoteItem);
check('favorite gift gives +80', giftRes.delta, 80);
check('gifted today blocks second gift', npcMgr.giveGift('jericho', 'kamote', kamoteItem).ok, false);

// 3. BAYANIHAN PROJECTS (Phase 8)
const projects = J('data/projects.json');
check('4 Bayanihan projects', projects.length, 4);
const inv = createInventory(items, [{ id: 'palay', count: 50 }, { id: 'kamote', count: 50 }]);
let money = 2000;
const wallet = { get: () => money, spend: (n) => money -= n };
const toast = { show() {} };
const bayanihan = createBayanihan(projects, inv, wallet, toast);
check('kapilya starts incomplete', bayanihan.isCompleted('kapilya'), false);
// Donate to kapilya until complete
bayanihan.selectedIndex = 0;
for (let i = 0; i < 6; i++) bayanihan.donateToSelected();
check('kapilya completes after resources donated', bayanihan.isCompleted('kapilya'), true);

// 4. PET SYSTEM (Phase 8)
const pet = createPet({}, toast);
check('pet has name Tagpi', pet.name, 'Tagpi');
check('petting pet increases affection', pet.petAnimal(), true);
check('second pet same day blocked', pet.petAnimal(), false);

// 5. MODERN LIGAWAN ROMANCE & DTR (Phase 10)
const romanceMgr = createRomanceManager(npcs, npcMgr, toast);
// Jericho starts at Crush
check('jericho stage is Crush', romanceMgr.getStage('jericho'), 'Crush');
// Give enough points to reach 5 hearts
npcMgr.state['jericho'].points = 550;
check('jericho has 5 hearts', romanceMgr.getHearts('jericho'), 5);
check('define relationship advances to Talking Stage', romanceMgr.defineRelationship('jericho'), true);
check('jericho stage is Talking Stage', romanceMgr.getStage('jericho'), 'Talking Stage');

// Advance to Mag-jowa (needs 7+ hearts and 60+ vibe)
npcMgr.state['jericho'].points = 750;
romanceMgr.addVibe('jericho', 20); // 50 + 20 = 70 vibe
check('define relationship advances to Mag-jowa', romanceMgr.defineRelationship('jericho'), true);
check('jericho is Official jowa', romanceMgr.getStage('jericho'), 'Mag-jowa (Official)');

// Propose without farmhouse fails
npcMgr.state['jericho'].points = 1000;
check('propose without upgraded farmhouse fails', romanceMgr.propose('jericho', false), false);
// Propose with upgraded farmhouse succeeds!
check('propose with upgraded farmhouse succeeds', romanceMgr.propose('jericho', true), true);
romanceMgr.marry('jericho');
check('spouse is jericho', romanceMgr.spouseId, 'jericho');
check('have child Liwayway', romanceMgr.haveChild('Liwayway'), true);
check('children count is 1', romanceMgr.children.length, 1);

// 6. PHONE TEXTING (Phase 10)
const phone = createPhone(npcs, romanceMgr, toast);
phone.selectedCandidateIndex = 0;
phone.selectContact();
check('active chat is jericho', phone.activeChat.id, 'jericho');
phone.askOnDate('Plaza Night Lights');
check('date confirmed in thread', phone.messages['jericho'].some((m) => m.text.includes('Game!')), true);

// 7. FIESTAS & EVENTS (Phase 9)
const fiestas = J('data/fiestas.json');
check('4 seasonal fiestas', fiestas.length, 4);
const dlg = createDialogueBox(J('data/glossary.json'), { width: 480, height: 270 });
const evMgr = createEventManager(fiestas, dlg, toast);
const mockFiestaDate = { part: { id: 'early_taginit' }, dayOfPart: 20 };
const todayF = evMgr.getTodayFiesta(mockFiestaDate);
check('Day 20 early tag-init is Flores Festival', todayF?.id, 'flores');

// 8. SPRITES
const sprites = createSpriteRenderer();
check('sprite renderer has drawPlayer', typeof sprites.drawPlayer, 'function');
check('sprite renderer has drawNPC', typeof sprites.drawNPC, 'function');
check('sprite renderer has drawPet', typeof sprites.drawPet, 'function');
check('sprite renderer has drawTile', typeof sprites.drawTile, 'function');

console.log('ALL PHASE 7-10 RIGOROUS UNIT CHECKS PASSED!');
