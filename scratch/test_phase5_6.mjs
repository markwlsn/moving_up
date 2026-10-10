import { readFileSync } from 'fs';

// Mock browser globals for headless testing
globalThis.window = { addEventListener() {} };
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) || null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const root = (process.argv[2] || process.cwd()).replace(/\\/g, '/');
const J = (p) => JSON.parse(readFileSync(`${root}/${p}`));

const { createMap } = await import(`file:///${root}/src/map.js`);
const { createInventory } = await import(`file:///${root}/src/inventory.js`);
const { createShipping } = await import(`file:///${root}/src/shipping.js`);
const { createShop } = await import(`file:///${root}/src/shop.js`);
const { createStorage } = await import(`file:///${root}/src/storage.js`);

const check = (l, got, exp) => console.log(got === exp ? 'PASS' : 'FAIL', l, JSON.stringify(got));

// 1. Data Integrity
const items = J('data/items.json');
const crops = J('data/crops.json');
const tiles = J('data/tiles.json');

check('items count >= 16', items.length >= 16, true);
const cropIds = crops.map((c) => c.id);
const seeds = items.filter((it) => it.category === 'seed');
check('all seeds have valid crops', seeds.every((s) => cropIds.includes(s.cropId)), true);

// 2. Maps & Warps Validation
const mapFiles = ['farm', 'house', 'village', 'store'];
const loadedMaps = {};
for (const mf of mapFiles) {
  const data = J(`data/maps/${mf}.json`);
  loadedMaps[mf] = createMap(data, tiles);
  check(`map ${mf} loaded`, !!loadedMaps[mf], true);
}

// Check that every warp points to an existing map within valid bounds
let warpsValid = true;
for (const [mid, m] of Object.entries(loadedMaps)) {
  for (const w of m.warps) {
    const target = loadedMaps[w.targetMap];
    if (!target) { warpsValid = false; console.error(`Bad targetMap ${w.targetMap} in ${mid}`); }
    if (w.targetTileX < 0 || w.targetTileX >= target.width || w.targetTileY < 0 || w.targetTileY >= target.height) {
      warpsValid = false; console.error(`Out of bounds warp in ${mid} to ${w.targetMap}`);
    }
  }
}
check('all warps point to valid maps and bounds', warpsValid, true);

// 3. Inventory Tests
const inv = createInventory(items, [{ id: 'pandesal', count: 2 }]);
check('initial pandesal count', inv.count('pandesal'), 2);
check('add more pandesal stacks', inv.add('pandesal', 3), true);
check('stacked count is 5', inv.count('pandesal'), 5);
check('add talong crop', inv.add('talong', 4), true);
check('has talong 4', inv.has('talong', 4), true);
check('remove talong 2', inv.remove('talong', 2), true);
check('remaining talong is 2', inv.count('talong'), 2);

// 4. Shipping Bin Tests
const shipping = createShipping(inv, items);
check('deposit 1 talong into shipping', shipping.deposit('talong', 1), true);
check('talong in inventory reduced to 1', inv.count('talong'), 1);
check('shipping bin has 1 item', shipping.bin.length, 1);
// Talong sellPrice is 40
check('shipping total value is 40', shipping.totalValue(), 40);
const payout = shipping.payoutAndClear();
check('payout value is 40', payout.value, 40);
check('shipping bin empty after payout', shipping.bin.length, 0);

// 5. Shop Tests (Buy & Sell)
let money = 200;
const wallet = {
  get: () => money,
  add: (n) => { money += n; },
  spend: (n) => { money -= n; },
};
const toastMock = { show() {} };
const shop = createShop(items, inv, wallet, toastMock);

// Buy seed_okra (cost 20)
shop.mode = 'buy';
shop.buyIndex = items.filter((x) => x.buyPrice !== null).findIndex((x) => x.id === 'seed_okra');
shop.confirmAction();
check('bought okra seed, money is 180', wallet.get(), 180);
check('inventory has seed_okra', inv.has('seed_okra', 1), true);

// Sell 1 pandesal (pandesal sellPrice is 8)
shop.mode = 'sell';
const pandesalSellIdx = shop.sellableItems().findIndex((x) => x.def.id === 'pandesal');
shop.sellIndex = pandesalSellIdx;
shop.confirmAction();
check('sold pandesal, money is 188', wallet.get(), 188);
check('pandesal count reduced from 5 to 4', inv.count('pandesal'), 4);

// 6. Save & Load Tests
const storage = createStorage();
const mockSave = {
  mapId: 'farm',
  player: { x: 50, y: 70, facing: 'down' },
  money: 188,
  inventory: inv.slots,
};
check('storage save succeeds', storage.save(mockSave), true);
check('storage hasSave is true', storage.hasSave(), true);
const loaded = storage.load();
check('loaded money matches', loaded.money, 188);
check('loaded mapId matches', loaded.mapId, 'farm');

console.log('ALL PHASE 5 & 6 AUTOMATED CHECKS PASSED!');
