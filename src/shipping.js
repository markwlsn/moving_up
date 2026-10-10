// Shipping system (Kaing - traditional woven basket):
// Players deposit items into the basket; overnight they are sold and payout is awarded.
export function createShipping(inventory, itemsData) {
  const itemById = Object.fromEntries(itemsData.map((it) => [it.id, it]));
  const bin = []; // array of { id, count }
  const s = {
    isOpen: false,
    selectedIndex: 0,
    bin,
  };

  s.deposit = function (itemId, count = 1) {
    const def = itemById[itemId];
    if (!def || !def.sellPrice) return false;
    if (!inventory.remove(itemId, count)) return false;

    const existing = bin.find((x) => x.id === itemId);
    if (existing) existing.count += count;
    else bin.push({ id: itemId, count });
    return true;
  };

  s.totalValue = function () {
    return bin.reduce((sum, entry) => {
      const def = itemById[entry.id];
      return sum + (def ? def.sellPrice * entry.count : 0);
    }, 0);
  };

  s.payoutAndClear = function () {
    const val = s.totalValue();
    const count = bin.reduce((acc, x) => acc + x.count, 0);
    bin.length = 0; // empty
    return { value: val, count };
  };

  s.open = () => { s.isOpen = true; s.selectedIndex = 0; };
  s.close = () => { s.isOpen = false; };

  s.moveSelection = (dx, dy) => {
    let col = s.selectedIndex % inventory.cols;
    let row = Math.floor(s.selectedIndex / inventory.cols);
    col = (col + dx + inventory.cols) % inventory.cols;
    row = (row + dy + inventory.rows) % inventory.rows;
    s.selectedIndex = row * inventory.cols + col;
  };

  s.render = function (ctx, { width, height }) {
    if (!s.isOpen) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, width, height);

    const mw = 360, mh = 210;
    const mx = Math.floor((width - mw) / 2);
    const my = Math.floor((height - mh) / 2);

    ctx.fillStyle = '#261b12';
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = '#c9a66b';
    ctx.lineWidth = 2;
    ctx.strokeRect(mx + 1, my + 1, mw - 2, mh - 2);

    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#f8e3b6';
    ctx.fillText('KAING (Shipping Basket)', mx + mw / 2, my + 8);

    // Left side: Player Inventory
    const slotSize = 24, pad = 5;
    const gridX = mx + 14, gridY = my + 26;

    ctx.font = '7px monospace';
    ctx.fillStyle = '#c9a66b';
    ctx.textAlign = 'left';
    ctx.fillText('Select item to ship:', gridX, gridY - 9);

    for (let r = 0; r < inventory.rows; r++) {
      for (let c = 0; c < inventory.cols; c++) {
        const idx = r * inventory.cols + c;
        const sx = gridX + c * (slotSize + pad);
        const sy = gridY + r * (slotSize + pad);
        const item = inventory.slots[idx];
        const isSel = idx === s.selectedIndex;

        ctx.fillStyle = isSel ? '#5e432d' : '#38281b';
        ctx.fillRect(sx, sy, slotSize, slotSize);
        ctx.strokeStyle = isSel ? '#ffe08a' : '#6b4f35';
        ctx.lineWidth = isSel ? 2 : 1;
        ctx.strokeRect(sx, sy, slotSize, slotSize);

        if (item) {
          const def = itemById[item.id];
          ctx.fillStyle = def ? def.color : '#fff';
          ctx.fillRect(sx + 4, sy + 4, slotSize - 8, slotSize - 8);

          if (item.count > 1) {
            ctx.font = '7px monospace';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = '#fff';
            ctx.fillText(item.count, sx + slotSize - 2, sy + slotSize - 1);
          }
        }
      }
    }

    // Right side: Shipping Summary & Shipped Bin
    const infoX = gridX + inventory.cols * (slotSize + pad) + 12;
    const infoY = gridY;
    const infoW = mw - (infoX - mx) - 14;

    ctx.fillStyle = '#1e140d';
    ctx.fillRect(infoX, infoY, infoW, 122);
    ctx.strokeStyle = '#4a3622';
    ctx.lineWidth = 1;
    ctx.strokeRect(infoX, infoY, infoW, 122);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = '8px monospace';
    ctx.fillStyle = '#ffe08a';
    ctx.fillText('Basket Contents:', infoX + 6, infoY + 6);

    let ly = infoY + 20;
    if (bin.length === 0) {
      ctx.fillStyle = '#777';
      ctx.fillText('(Empty)', infoX + 6, ly);
    } else {
      bin.slice(0, 7).forEach((entry) => {
        const def = itemById[entry.id];
        ctx.fillStyle = '#ddd';
        const line = `${def ? def.name : entry.id} x${entry.count} (+₱${(def ? def.sellPrice : 0) * entry.count})`;
        ctx.fillText(line, infoX + 6, ly);
        ly += 12;
      });
      if (bin.length > 7) {
        ctx.fillStyle = '#888';
        ctx.fillText(`+ ${bin.length - 7} more items...`, infoX + 6, ly);
      }
    }

    // Total value
    ctx.font = '8px monospace';
    ctx.fillStyle = '#8bc34a';
    ctx.fillText(`Total Payout: ₱${s.totalValue()}`, infoX + 6, infoY + 104);

    // Footer instruction
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c9a66b';
    ctx.fillText('[Space/J] Ship 1 Item   [Esc/K] Close Basket', mx + mw / 2, my + mh - 16);
  };

  return s;
}
