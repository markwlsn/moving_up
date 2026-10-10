// Inventory system: 16 slots, items with stacks, consumption, and full UI modal.
export function createInventory(itemsData, initialItems = []) {
  const itemById = Object.fromEntries(itemsData.map((it) => [it.id, it]));
  const SLOTS_COUNT = 16;
  const slots = Array.from({ length: SLOTS_COUNT }, () => null);

  const inv = {
    slots,
    itemById,
    isOpen: false,
    selectedIndex: 0,
    cols: 4,
    rows: 4,
  };

  inv.add = function (itemId, count = 1) {
    const def = itemById[itemId];
    if (!def) return false;
    // Try to stack into existing slot first
    for (let i = 0; i < SLOTS_COUNT; i++) {
      if (slots[i] && slots[i].id === itemId) {
        slots[i].count += count;
        return true;
      }
    }
    // Find empty slot
    for (let i = 0; i < SLOTS_COUNT; i++) {
      if (!slots[i]) {
        slots[i] = { id: itemId, count };
        return true;
      }
    }
    return false; // full
  };

  inv.remove = function (itemId, count = 1) {
    for (let i = 0; i < SLOTS_COUNT; i++) {
      if (slots[i] && slots[i].id === itemId) {
        if (slots[i].count > count) {
          slots[i].count -= count;
          return true;
        } else if (slots[i].count === count) {
          slots[i] = null;
          return true;
        }
        return false;
      }
    }
    return false;
  };

  inv.count = function (itemId) {
    let total = 0;
    for (const s of slots) {
      if (s && s.id === itemId) total += s.count;
    }
    return total;
  };

  inv.has = function (itemId, count = 1) {
    return inv.count(itemId) >= count;
  };

  inv.selectedItem = function () {
    const s = slots[inv.selectedIndex];
    return s ? { slot: s, def: itemById[s.id] } : null;
  };

  // Populate initial items
  initialItems.forEach(({ id, count }) => inv.add(id, count));

  inv.toggle = () => { inv.isOpen = !inv.isOpen; };
  inv.close = () => { inv.isOpen = false; };

  inv.moveSelection = function (dx, dy) {
    let col = inv.selectedIndex % inv.cols;
    let row = Math.floor(inv.selectedIndex / inv.cols);
    col = (col + dx + inv.cols) % inv.cols;
    row = (row + dy + inv.rows) % inv.rows;
    inv.selectedIndex = row * inv.cols + col;
  };

  inv.render = function (ctx, { width, height }) {
    if (!inv.isOpen) return;

    // Dark backdrop overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, width, height);

    // Dialog Box
    const mw = 340, mh = 210;
    const mx = Math.floor((width - mw) / 2);
    const my = Math.floor((height - mh) / 2);

    ctx.fillStyle = '#261b12';
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = '#c9a66b';
    ctx.lineWidth = 2;
    ctx.strokeRect(mx + 1, my + 1, mw - 2, mh - 2);

    // Title
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#f8e3b6';
    ctx.fillText('INVENTORY (Bag)', mx + mw / 2, my + 8);

    // 4x4 Grid of Slots (left side)
    const slotSize = 26;
    const pad = 6;
    const gridX = mx + 16;
    const gridY = my + 26;

    for (let r = 0; r < inv.rows; r++) {
      for (let c = 0; c < inv.cols; c++) {
        const idx = r * inv.cols + c;
        const sx = gridX + c * (slotSize + pad);
        const sy = gridY + r * (slotSize + pad);
        const item = slots[idx];
        const isSel = idx === inv.selectedIndex;

        // Slot Background
        ctx.fillStyle = isSel ? '#5e432d' : '#38281b';
        ctx.fillRect(sx, sy, slotSize, slotSize);
        ctx.strokeStyle = isSel ? '#ffe08a' : '#6b4f35';
        ctx.lineWidth = isSel ? 2 : 1;
        ctx.strokeRect(sx, sy, slotSize, slotSize);

        if (item) {
          const def = itemById[item.id];
          // Item placeholder color swatch
          ctx.fillStyle = def ? def.color : '#fff';
          ctx.fillRect(sx + 5, sy + 5, slotSize - 10, slotSize - 10);

          // Count badge
          if (item.count > 1) {
            ctx.font = '7px monospace';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = '#000';
            ctx.fillText(item.count, sx + slotSize - 1, sy + slotSize);
            ctx.fillStyle = '#fff';
            ctx.fillText(item.count, sx + slotSize - 2, sy + slotSize - 1);
          }
        }
      }
    }

    // Item Details Panel (right side)
    const infoX = gridX + inv.cols * (slotSize + pad) + 12;
    const infoY = gridY;
    const infoW = mw - (infoX - mx) - 16;
    const sel = inv.selectedItem();

    ctx.fillStyle = '#1e140d';
    ctx.fillRect(infoX, infoY, infoW, 122);
    ctx.strokeStyle = '#4a3622';
    ctx.lineWidth = 1;
    ctx.strokeRect(infoX, infoY, infoW, 122);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    if (sel) {
      const { def, slot } = sel;
      ctx.font = '8px monospace';
      ctx.fillStyle = '#ffe08a';
      ctx.fillText(def.name, infoX + 6, infoY + 6);

      ctx.font = '7px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${def.english} [x${slot.count}]`, infoX + 6, infoY + 18);

      ctx.fillStyle = '#8bc34a';
      let tag = def.category.toUpperCase();
      if (def.sellPrice) tag += ` | Sell: ₱${def.sellPrice}`;
      if (def.energy) tag += ` | +${def.energy} EN`;
      ctx.fillText(tag, infoX + 6, infoY + 30);

      // Description (wrapped)
      ctx.fillStyle = '#ddd';
      const words = def.desc.split(' ');
      let line = '';
      let ly = infoY + 46;
      for (const w of words) {
        const test = line + w + ' ';
        if (ctx.measureText(test).width > infoW - 12) {
          ctx.fillText(line, infoX + 6, ly);
          line = w + ' ';
          ly += 10;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, infoX + 6, ly);

      if (def.category === 'food') {
        ctx.fillStyle = '#7ed957';
        ctx.fillText('[Space/J] Eat food', infoX + 6, infoY + 104);
      }
    } else {
      ctx.font = '8px monospace';
      ctx.fillStyle = '#666';
      ctx.fillText('Empty slot', infoX + 6, infoY + 6);
    }

    // Footer instruction bar
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c9a66b';
    ctx.fillText('[Arrows/WASD] Move   [I / Tab / Esc] Close', mx + mw / 2, my + mh - 16);
  };

  return inv;
}
