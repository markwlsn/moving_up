import { startLoop } from './loop.js';
import { createScreen } from './screen.js';
import { createClock } from './clock.js';
import { createPlayer } from './player.js';
import { createDebug } from './debug.js';
import { createMap } from './map.js';
import { createCamera } from './camera.js';
import { createEnergy } from './energy.js';
import { createHud } from './hud.js';
import { createSleep } from './sleep.js';
import { createFarm } from './farm.js';
import { createWeather } from './weather.js';
import { createToolbar } from './toolbar.js';
import { createToast } from './toast.js';
import { createInventory } from './inventory.js';
import { createShipping } from './shipping.js';
import { createShop } from './shop.js';
import { createStorage } from './storage.js';
import { createSpriteRenderer } from './sprites.js';
import { createNPCManager } from './npc.js';
import { createDialogueBox } from './dialogue.js';
import { createBayanihan } from './bayanihan.js';
import { createPet } from './pet.js';
import { createPhone } from './phone.js';
import { createRomanceManager } from './romance.js';
import { createEventManager } from './events.js';
import { createTitleScreen, renderControlsModal } from './title.js';
import { wasPressed, isDown, endTick } from './input.js';

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

async function boot() {
  const config = await loadJSON('data/config.json');
  const g = config.game;

  // Load all game data and maps
  const [
    tileDefs, calendar, crops, tools, items,
    glossary, npcsData, projectsData, fiestasData,
    farmData, houseData, villageData, storeData
  ] = await Promise.all([
    loadJSON('data/tiles.json'),
    loadJSON('data/calendar.json'),
    loadJSON('data/crops.json'),
    loadJSON('data/tools.json'),
    loadJSON('data/items.json'),
    loadJSON('data/glossary.json'),
    loadJSON('data/npcs.json'),
    loadJSON('data/projects.json'),
    loadJSON('data/fiestas.json'),
    loadJSON('data/maps/farm.json'),
    loadJSON('data/maps/house.json'),
    loadJSON('data/maps/village.json'),
    loadJSON('data/maps/store.json'),
  ]);

  const maps = {
    farm: createMap(farmData, tileDefs),
    house: createMap(houseData, tileDefs),
    village: createMap(villageData, tileDefs),
    store: createMap(storeData, tileDefs),
  };

  const W = g.internalWidth, H = g.internalHeight;
  const screen = createScreen(document.getElementById('game'), W, H, g.letterboxColor);
  let currentMap = maps[g.startMap || 'farm'];
  const camera = createCamera(W, H);
  const clock = createClock(config.clock, calendar);
  const energy = createEnergy(config.energy);
  const player = createPlayer(config.player, currentMap);
  player.placeAtTile(currentMap.spawn.tileX, currentMap.spawn.tileY);

  // Economy & Wallet
  let money = config.player.initialMoney || 300;
  const wallet = {
    get: () => money,
    set: (m) => { money = Math.max(0, m); },
    add: (n) => { money += n; },
    spend: (n) => { money = Math.max(0, money - n); },
  };

  // Engine systems
  const storage = createStorage();
  const sprites = createSpriteRenderer();
  const farm = createFarm(maps.farm, crops, config.farm);
  const weather = createWeather(config.weather, { width: W, height: H });
  const toolbar = createToolbar(tools, crops);
  const toast = createToast(config.hud, { width: W, height: H });

  const inventory = createInventory(items, [
    { id: 'seed_kamote', count: 5 },
    { id: 'seed_okra', count: 5 },
    { id: 'seed_talong', count: 5 },
    { id: 'pandesal', count: 3 },
  ]);

  const shipping = createShipping(inventory, items);
  const shop = createShop(items, inventory, wallet, toast);
  const npcManager = createNPCManager(npcsData);
  const romanceManager = createRomanceManager(npcsData, npcManager, toast);
  const dialogueBox = createDialogueBox(glossary, { width: W, height: H });
  const bayanihan = createBayanihan(projectsData, inventory, wallet, toast);
  const pet = createPet(config, toast);
  const phone = createPhone(npcsData, romanceManager, toast);
  const eventManager = createEventManager(fiestasData, dialogueBox, toast);
  const hud = createHud(config.hud, { width: W, height: H });
  const sleep = createSleep(config.sleep, { clock, energy, width: W, height: H, hud: config.hud });
  const debug = createDebug(config.debug);

  let gameTimeSec = 0;
  let playerAnimFrame = 0;

  // Warp transition state machine
  const warp = {
    state: 'idle',
    t: 0,
    duration: 0.25,
    cooldown: 0.3,
    target: null,
  };

  function triggerWarp(target) {
    warp.state = 'fadeOut';
    warp.t = 0;
    warp.target = target;
  }

  // Overnight sleep handling
  sleep.onOvernight = ({ passedOut }) => {
    const payout = shipping.payoutAndClear();
    if (payout.value > 0) wallet.add(payout.value);

    let penalty = 0;
    if (passedOut) {
      penalty = Math.round(wallet.get() * (config.sleep.passOutMoneyPenaltyPercent / 100));
      wallet.spend(penalty);
    }

    saveGame(false);
    return { earnings: payout.value, penalty };
  };

  sleep.onNewDay = () => {
    farm.advanceDay();
    weather.rollForDay(clock.date());
    if (weather.isRaining()) farm.waterAll();
    npcManager.onNewDay();
    pet.onNewDay();
    romanceManager.onNewDay(farm);
  };

  function serializeGameState() {
    return {
      mapId: currentMap.id,
      player: { x: player.x, y: player.y, facing: player.facing },
      money: wallet.get(),
      energy: energy.value,
      clock: { day: clock.day, minutes: clock.minutes },
      weather: weather.today,
      inventory: inventory.slots,
      shipping: shipping.bin,
      plots: Array.from(farm.plots.entries()),
      npcFriendships: npcManager.state,
      pet: { name: pet.name, affection: pet.affection, type: pet.type },
      bayanihan: bayanihan.projects,
      romance: { spouseId: romanceManager.spouseId, preference: romanceManager.preference, data: romanceManager.data },
    };
  }

  function saveGame(showToast = true) {
    const ok = storage.save(serializeGameState());
    if (showToast && ok) toast.show('Progress saved! [F5]');
  }

  function loadGame() {
    const data = storage.load();
    if (!data) {
      toast.show('No saved game found.');
      return;
    }
    if (maps[data.mapId]) {
      currentMap = maps[data.mapId];
      player.x = player.prevX = data.player.x;
      player.y = player.prevY = data.player.y;
      player.facing = data.player.facing || 'down';
    }
    wallet.set(data.money || 0);
    energy.value = data.energy !== undefined ? data.energy : energy.max;
    if (data.clock) {
      clock.day = data.clock.day;
      clock.minutes = data.clock.minutes;
    }
    if (data.weather) weather.today = data.weather;
    if (data.inventory) {
      data.inventory.forEach((s, i) => { inventory.slots[i] = s; });
    }
    if (data.shipping) {
      shipping.bin.length = 0;
      data.shipping.forEach((x) => shipping.bin.push(x));
    }
    if (data.plots) {
      farm.plots.clear();
      data.plots.forEach(([k, v]) => farm.plots.set(k, v));
    }
    if (data.npcFriendships) {
      Object.assign(npcManager.state, data.npcFriendships);
    }
    if (data.pet) {
      pet.name = data.pet.name;
      pet.affection = data.pet.affection;
      pet.type = data.pet.type;
    }
    if (data.romance) {
      romanceManager.spouseId = data.romance.spouseId;
      if (data.romance.preference) romanceManager.preference = data.romance.preference;
      if (data.romance.data) Object.assign(romanceManager.data, data.romance.data);
    }
    toast.show('Game Loaded! [F9]');
  }

  let inTitleScreen = true;
  let showingHelp = false;

  const titleScreen = createTitleScreen(
    storage,
    ({ isNew, preference }) => {
      if (!isNew) {
        loadGame();
      } else {
        if (preference) romanceManager.preference = preference;
        currentMap = maps[g.startMap || 'farm'];
        player.placeAtTile(currentMap.spawn.tileX, currentMap.spawn.tileY);
        player.facing = 'down';
        wallet.set(config.player.initialMoney || 300);
        energy.value = energy.max;
        clock.day = 1;
        clock.minutes = 240;
        weather.today = 'clear';
        farm.plots.clear();
        shipping.bin.length = 0;
        pet.adopted = false;
        pet.affection = 0;
        inventory.slots.fill(null);
        [
          { id: 'seed_kamote', count: 5 },
          { id: 'seed_okra', count: 5 },
          { id: 'seed_talong', count: 5 },
          { id: 'pandesal', count: 3 },
        ].forEach((it) => inventory.add(it.id, it.count));
        toast.show('Maligayang pagdating sa Bukid ni Lolo!');
      }
      inTitleScreen = false;
    },
    { width: W, height: H }
  );

  // Handle interaction with NPCs, tools, and world objects
  function interact() {
    const here = player.tile(), front = player.facingTile();

    // 1. Check Pet Interaction
    if (currentMap.id === pet.mapId) {
      const pDist = Math.hypot(player.x - pet.x, player.y - pet.y);
      if (pDist < 26) {
        pet.petAnimal();
        return;
      }
    }

    // 2. Check NPC Interaction at front tile
    const targetNPC = npcManager.findAtTile(currentMap.id, clock, front.x, front.y);
    if (targetNPC) {
      const npc = targetNPC.def;
      const talkResult = npcManager.talk(npc.id);

      // Branching dialogue choices: Chat, Give Gift, or Propose
      const choices = [
        { text: 'Chat (Kamusta po?)', action: 'chat' },
      ];

      // If player has items, allow gifting
      const giftableItem = inventory.selectedItem();
      if (giftableItem) {
        choices.push({ text: `Give Gift: ${giftableItem.def.name}`, action: 'gift' });
      }

      const matchesPreference = romanceManager.preference === 'both' ||
        (romanceManager.preference === 'male' && npc.gender === 'male') ||
        (romanceManager.preference === 'female' && npc.gender === 'female');
      if (npc.tier === 'romance' && matchesPreference && romanceManager.getHearts(npc.id) >= 10 && !romanceManager.spouseId) {
        choices.push({ text: 'Propose Marriage (Singsing)', action: 'propose' });
      }

      dialogueBox.open({
        speaker: npc.name,
        role: npc.role,
        tier: npc.tier,
        hearts: npcManager.getHearts(npc.id),
        text: npc.dialogue.intro || npc.dialogue.default,
        choices,
        onChoice: (choice) => {
          if (choice.action === 'gift' && giftableItem) {
            const res = npcManager.giveGift(npc.id, giftableItem.def.id, giftableItem.def);
            if (res.ok) {
              inventory.remove(giftableItem.def.id, 1);
              dialogueBox.open({
                speaker: npc.name,
                role: npc.role,
                tier: npc.tier,
                hearts: res.hearts,
                text: res.line,
              });
            } else {
              toast.show(res.msg);
            }
          } else if (choice.action === 'propose') {
            const hasUpgraded = bayanihan.isCompleted('farmhouse');
            if (romanceManager.propose(npc.id, hasUpgraded)) {
              eventManager.startWedding(npc, npcsData);
            }
          }
        }
      });
      return;
    }

    // 3. Tile actions (Sleep, Kaing, Shop, Bayanihan Board)
    const actionHere = currentMap.tileAction(here.x, here.y);
    const actionFront = currentMap.tileAction(front.x, front.y);
    const action = actionHere || actionFront;

    if (action === 'sleep') {
      sleep.askToSleep();
      return;
    }
    if (action === 'shipping') {
      shipping.open();
      return;
    }
    if (action === 'shop') {
      shop.open();
      return;
    }
    if (action === 'bayanihan') {
      bayanihan.open();
      return;
    }

    // 4. Farm interactions (only on Bukid ni Lolo)
    if (currentMap.id === 'farm') {
      const { x, y } = front;

      // Harvest ripe crop
      if (farm.isRipe(x, y)) {
        const c = farm.harvest(x, y);
        if (inventory.add(c.id, 1)) {
          toast.show(`+1 ${c.name} (${c.english})`);
        } else {
          toast.show('Puno na ang bag! (Inventory full)');
        }
        return;
      }

      // Use active tool
      const tool = toolbar.tool();
      if (tool.energyCost > 0 && energy.value < tool.energyCost) {
        toast.show("You're too tired. Get some rest.");
        return;
      }

      const d = clock.date();
      let result = { ok: false, msg: null };

      switch (tool.id) {
        case 'hoe':
          result = farm.till(x, y);
          break;
        case 'can':
          result = farm.water(x, y);
          break;
        case 'sickle':
          result = farm.clear(x, y);
          break;
        case 'seeds': {
          const selectedCrop = toolbar.seed();
          const seedItemId = `seed_${selectedCrop.id}`;
          if (!inventory.has(seedItemId, 1)) {
            result = { ok: false, msg: `No ${selectedCrop.name} seeds in your bag.` };
          } else {
            result = farm.plant(x, y, selectedCrop.id, d.part.id, d.part.name);
            if (result.ok) {
              inventory.remove(seedItemId, 1);
            }
          }
          break;
        }
      }

      if (result.ok) energy.spend(tool.energyCost);
      if (result.msg) toast.show(result.msg);
    }
  }

  function checkWarps(dt) {
    if (warp.state === 'cooldown') {
      warp.t += dt;
      if (warp.t >= warp.cooldown) warp.state = 'idle';
      return;
    }
    if (warp.state === 'fadeOut') {
      warp.t += dt;
      if (warp.t >= warp.duration) {
        const t = warp.target;
        if (maps[t.targetMap]) {
          currentMap = maps[t.targetMap];
          player.placeAtTile(t.targetTileX, t.targetTileY);
        }
        warp.state = 'fadeIn';
        warp.t = 0;
      }
      return;
    }
    if (warp.state === 'fadeIn') {
      warp.t += dt;
      if (warp.t >= warp.duration) {
        warp.state = 'cooldown';
        warp.t = 0;
      }
      return;
    }

    if (warp.state === 'idle') {
      const t = player.tile();
      const w = currentMap.warpAt(t.x, t.y);
      if (w) triggerWarp(w);
    }
  }

  startLoop({
    ticksPerSecond: g.ticksPerSecond,
    update(dt) {
      if (inTitleScreen) {
        titleScreen.update(wasPressed);
        endTick();
        return;
      }

      gameTimeSec += dt;
      if (wasPressed('debug')) debug.visible = !debug.visible;
      weather.update(dt);
      toast.update(dt);

      // Handle Modals
      if (showingHelp) {
        if (wasPressed('cancel') || wasPressed('interact') || wasPressed('help')) {
          showingHelp = false;
        }
      } else if (sleep.isBlocking()) {
        sleep.update(dt);
      } else if (dialogueBox.isOpen) {
        if (wasPressed('cancel')) dialogueBox.close();
        else if (wasPressed('up')) dialogueBox.moveChoice(-1);
        else if (wasPressed('down')) dialogueBox.moveChoice(1);
        else if (wasPressed('interact')) dialogueBox.confirm();
      } else if (phone.isOpen) {
        if (wasPressed('phone') || wasPressed('cancel')) {
          if (phone.activeChat) phone.backToContacts();
          else phone.close();
        } else if (wasPressed('up')) phone.moveContact(-1);
        else if (wasPressed('down')) phone.moveContact(1);
        else if (wasPressed('action1')) phone.askOnDate('Plaza Night Lights');
        else if (wasPressed('action2')) phone.askOnDate('Enzo’s Kapihan');
        else if (wasPressed('interact')) {
          if (!phone.activeChat) phone.selectContact();
          else romanceManager.defineRelationship(phone.activeChat.id);
        }
      } else if (bayanihan.isOpen) {
        if (wasPressed('cancel')) bayanihan.close();
        else if (wasPressed('up')) bayanihan.moveSelection(-1);
        else if (wasPressed('down')) bayanihan.moveSelection(1);
        else if (wasPressed('interact')) bayanihan.donateToSelected();
      } else if (inventory.isOpen) {
        if (wasPressed('inventory') || wasPressed('cancel')) inventory.close();
        else if (wasPressed('up')) inventory.moveSelection(0, -1);
        else if (wasPressed('down')) inventory.moveSelection(0, 1);
        else if (wasPressed('left')) inventory.moveSelection(-1, 0);
        else if (wasPressed('right')) inventory.moveSelection(1, 0);
        else if (wasPressed('interact')) {
          const sel = inventory.selectedItem();
          if (sel && sel.def.category === 'food' && sel.def.energy) {
            inventory.remove(sel.slot.id, 1);
            energy.restoreFraction(Math.min(1, (energy.value + sel.def.energy) / energy.max));
            toast.show(`Kinain mo ang ${sel.def.name}. (+${sel.def.energy} EN)`);
          }
        }
      } else if (shipping.isOpen) {
        if (wasPressed('cancel')) shipping.close();
        else if (wasPressed('up')) shipping.moveSelection(0, -1);
        else if (wasPressed('down')) shipping.moveSelection(0, 1);
        else if (wasPressed('left')) shipping.moveSelection(-1, 0);
        else if (wasPressed('right')) shipping.moveSelection(1, 0);
        else if (wasPressed('interact')) {
          const item = inventory.slots[shipping.selectedIndex];
          if (item) shipping.deposit(item.id, 1);
        }
      } else if (shop.isOpen) {
        if (wasPressed('cancel')) shop.close();
        else if (wasPressed('toolPrev') || wasPressed('toolNext')) shop.toggleMode();
        else if (wasPressed('up')) shop.moveSelection(-1);
        else if (wasPressed('down')) shop.moveSelection(1);
        else if (wasPressed('interact')) shop.confirmAction();
      } else {
        // Normal Gameplay Input
        if (wasPressed('help')) showingHelp = true;
        if (wasPressed('inventory')) inventory.toggle();
        if (wasPressed('phone')) phone.open();
        if (wasPressed('save')) saveGame();
        if (wasPressed('load')) loadGame();

        if (debug.visible) {
          if (wasPressed('debugSkipHour') && clock.addMinutes(60)) sleep.passOut();
          if (wasPressed('debugDrain')) energy.spend(config.debug.drainAmount);
          if (wasPressed('debugGrow') && currentMap.id === 'farm') {
            farm.waterAll(); farm.advanceDay(); toast.show('[debug] Crops grew 1 day');
          }
        }

        if (wasPressed('toolPrev')) toolbar.nextTool(-1);
        if (wasPressed('toolNext')) toolbar.nextTool(1);
        if (wasPressed('seedNext')) toolbar.nextSeed();
        if (wasPressed('interact')) interact();

        // Player & Pet Movement
        if (warp.state === 'idle' || warp.state === 'cooldown') {
          player.update(dt, energy.speedMultiplier());
          pet.update(dt, player, currentMap.id);
          checkWarps(dt);
        } else {
          checkWarps(dt);
        }

        if (clock.update(dt) === 'passout') sleep.passOut();
      }

      endTick();
    },

    render(alpha, fps) {
      if (inTitleScreen) {
        screen.begin();
        titleScreen.render(screen.ctx);
        screen.end();
        return;
      }

      screen.begin();
      const ctx = screen.ctx;
      ctx.fillStyle = g.letterboxColor;
      ctx.fillRect(0, 0, W, H);

      const pos = player.drawPos(alpha);
      camera.follow(Math.round(pos.x) + player.size / 2, Math.round(pos.y) + player.size / 2, currentMap);

      // 1. Draw Textured World Map Tiles
      const ts = currentMap.tileSize;
      const tx0 = Math.max(0, Math.floor(camera.x / ts));
      const ty0 = Math.max(0, Math.floor(camera.y / ts));
      const tx1 = Math.min(currentMap.width - 1, Math.floor((camera.x + camera.width) / ts));
      const ty1 = Math.min(currentMap.height - 1, Math.floor((camera.y + camera.height) / ts));

      for (let ty = ty0; ty <= ty1; ty++) {
        for (let tx = tx0; tx <= tx1; tx++) {
          const type = currentMap.tileAt(tx, ty);
          const px = tx * ts - camera.x;
          const py = ty * ts - camera.y;
          sprites.drawTile(ctx, px, py, type, tx, ty, gameTimeSec);
        }
      }

      // 2. Draw Farm Plots & Cursor if on Farm
      if (currentMap.id === 'farm') {
        farm.render(ctx, camera);
        const f = player.facingTile();
        ctx.strokeStyle = config.farm.cursorColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(f.x * ts - camera.x + 0.5, f.y * ts - camera.y + 0.5, ts - 1, ts - 1);
      }

      // 3. Draw NPCs present on this map
      const npcsHere = npcManager.getNPCsOnMap(currentMap.id, clock);
      for (const n of npcsHere) {
        sprites.drawNPC(ctx, n.tileX * ts - camera.x, n.tileY * ts - camera.y, n.def, 'down', gameTimeSec);
      }

      // 4. Draw Pet if on this map
      if (pet.adopted && pet.mapId === currentMap.id) {
        sprites.drawPet(ctx, pet.x - camera.x, pet.y - camera.y, pet.type, pet.facing, gameTimeSec);
      }

      // 5. Draw Chibi Player Character
      const isMoving = isDown('up') || isDown('down') || isDown('left') || isDown('right');
      if (isMoving) playerAnimFrame += 0.2;
      sprites.drawPlayer(ctx, Math.round(pos.x) - camera.x, Math.round(pos.y) - camera.y, player.size, player.facing, playerAnimFrame);

      // 6. Atmospheric Lighting Tint (Dawn, Noon, Dusk, Night)
      const curMins = clock.minutes; // 240 (4 AM) to 1560 (2 AM)
      let lightTint = null;
      if (curMins >= 240 && curMins < 360) {
        // Misty dawn (4:00 AM - 6:00 AM): soft indigo/pink tint
        lightTint = 'rgba(70, 50, 100, 0.18)';
      } else if (curMins >= 1020 && curMins < 1140) {
        // Golden hour / sunset (5:00 PM - 7:00 PM): warm amber tint
        lightTint = 'rgba(255, 140, 40, 0.15)';
      } else if (curMins >= 1140 || curMins < 240) {
        // Night (7:00 PM - 2:00 AM): deep blue moonlight
        lightTint = 'rgba(15, 20, 50, 0.32)';
      }
      if (lightTint && (currentMap.id === 'farm' || currentMap.id === 'village')) {
        ctx.fillStyle = lightTint;
        ctx.fillRect(0, 0, W, H);
      }

      // 7. Outdoors weather
      if (currentMap.id === 'farm' || currentMap.id === 'village') {
        weather.render(ctx);
      }

      // 8. HUD & Overlays
      const todayFiesta = eventManager.getTodayFiesta(clock.date());
      hud.render(ctx, { clock, energy, weather, toolbar, wallet, inventory, todayFiesta });
      debug.render(ctx, { fps, player, clock, camera, map: currentMap, energy });
      toast.render(ctx);

      // 9. Modals & Screens
      dialogueBox.render(ctx);
      phone.render(ctx, { width: W, height: H });
      bayanihan.render(ctx, { width: W, height: H });
      inventory.render(ctx, { width: W, height: H });
      shipping.render(ctx, { width: W, height: H });
      shop.render(ctx, { width: W, height: H });
      sleep.render(ctx);
      if (showingHelp) renderControlsModal(ctx, W, H);

      // 10. Warp Fade
      if (warp.state === 'fadeOut' || warp.state === 'fadeIn') {
        let a = warp.state === 'fadeOut' ? warp.t / warp.duration : 1 - warp.t / warp.duration;
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, Math.max(0, a))})`;
        ctx.fillRect(0, 0, W, H);
      }

      screen.end();
    },
  });
}

boot().catch((err) => {
  console.error(err);
  document.body.innerHTML =
    `<pre style="color:#fff;padding:16px">Could not start the game.\n${err.message}\n\n` +
    `Are you running a local server? Opening index.html directly (file://) will not work.\nSee README.md.</pre>`;
});
