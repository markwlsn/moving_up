// NPC Manager & Friendship System:
// Tracks 30 villagers, daily schedules, friendship hearts (0-10), daily talks, and gifting.
export function createNPCManager(npcsData) {
  const npcById = Object.fromEntries(npcsData.map((n) => [n.id, n]));

  // Friendship state per NPC: { points, hearts, talkedToday, giftedToday, stage }
  const state = {};
  npcsData.forEach((n) => {
    state[n.id] = {
      points: 0,
      hearts: 0,
      talkedToday: false,
      giftedToday: false,
      stage: n.tier === 'romance' ? 'crush_stage_0' : 'acquaintance',
      vibeScore: 0, // Vibe Match for romance candidates
    };
  });

  const mgr = {
    npcs: npcsData,
    npcById,
    state,
  };

  mgr.getHearts = (id) => Math.min(10, Math.floor((state[id]?.points || 0) / 100));

  mgr.timePeriod = function (clock) {
    const mins = clock.minutes; // e.g. 240 = 4:00 AM
    if (mins < 720) return 'morning'; // 4:00 AM - 11:59 AM
    if (mins < 1080) return 'afternoon'; // 12:00 PM - 5:59 PM
    return 'evening'; // 6:00 PM - 2:00 AM
  };

  // Returns array of NPCs currently located on the given map
  mgr.getNPCsOnMap = function (mapId, clock) {
    const period = mgr.timePeriod(clock);
    const list = [];
    for (const npc of npcsData) {
      const loc = npc.schedule[period];
      if (loc && loc.map === mapId) {
        list.push({
          def: npc,
          state: state[npc.id],
          tileX: loc.x,
          tileY: loc.y,
          action: loc.action || '',
        });
      }
    }
    return list;
  };

  // Find NPC at or adjacent to tile
  mgr.findAtTile = function (mapId, clock, tx, ty) {
    const list = mgr.getNPCsOnMap(mapId, clock);
    return list.find((item) => item.tileX === tx && item.tileY === ty) || null;
  };

  mgr.talk = function (npcId) {
    const st = state[npcId];
    if (!st) return { firstTimeToday: false, points: 0 };
    let firstTime = false;
    if (!st.talkedToday) {
      st.talkedToday = true;
      st.points += 20;
      st.hearts = mgr.getHearts(npcId);
      firstTime = true;
    }
    return { firstTimeToday: firstTime, hearts: st.hearts };
  };

  mgr.giveGift = function (npcId, itemId, itemDef) {
    const npc = npcById[npcId];
    const st = state[npcId];
    if (!npc || !st) return { ok: false, msg: 'Unknown person.' };
    if (st.giftedToday) {
      return { ok: false, msg: `${npc.name} already received a gift from you today.` };
    }

    st.giftedToday = true;
    let delta = 25;
    let type = 'neutral';
    let line = "Salamat sa regalong ito! (Thank you for this gift!)";

    if (npc.favoriteGift === itemId) {
      delta = 80;
      type = 'favorite';
      line = npc.dialogue.gift_fav || "Maraming salamat! Paborito ko ito!";
    } else if (npc.likedGifts && npc.likedGifts.includes(itemId)) {
      delta = 50;
      type = 'liked';
      line = npc.dialogue.gift_like || "Salamat! Gustung-gusto ko ito!";
    } else if (npc.dislikedGifts && npc.dislikedGifts.includes(itemId)) {
      delta = -15;
      type = 'disliked';
      line = npc.dialogue.gift_dislike || "Salamat... pero hindi ko ito paborito.";
    }

    st.points = Math.max(0, Math.min(1000, st.points + delta));
    st.hearts = mgr.getHearts(npcId);

    return {
      ok: true,
      delta,
      type,
      line,
      hearts: st.hearts,
      name: npc.name,
    };
  };

  // Overnight reset of daily talk and gift flags
  mgr.onNewDay = function () {
    for (const id in state) {
      state[id].talkedToday = false;
      state[id].giftedToday = false;
    }
  };

  return mgr;
}
