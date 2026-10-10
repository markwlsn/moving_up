// Sari-sari Store UI (Tindahan ni Aling Nena):
// Supports Buy & Sell modes, wallet transactions, inventory updates, and cozy Taglish shop banter.
export function createShop(itemsData, inventory, wallet, toast) {
  const itemById = Object.fromEntries(itemsData.map((it) => [it.id, it]));

  // Store stock: all seeds and food items
  const catalog = itemsData.filter((it) => it.buyPrice !== null);

  const shop = {
    isOpen: false,
    mode: 'buy', // 'buy' or 'sell'
    buyIndex: 0,
    sellIndex: 0,
    greeting: 'Magandang araw! Bili na kayo ng pananim at meryenda!',
  };

  shop.open = () => {
    shop.isOpen = true;
    shop.buyIndex = 0;
    shop.sellIndex = 0;
  };
  shop.close = () => { shop.isOpen = false; };

  shop.toggleMode = () => {
    shop.mode = shop.mode === 'buy' ? 'sell' : 'buy';
  };

  shop.moveSelection = (dy) => {
    if (shop.mode === 'buy') {
      shop.buyIndex = (shop.buyIndex + dy + catalog.length) % catalog.length;
    } else {
      const sellables = shop.sellableItems();
      if (sellables.length > 0) {
        shop.sellIndex = (shop.sellIndex + dy + sellables.length) % sellables.length;
      }
    }
  };

  shop.sellableItems = () => {
    return inventory.slots
      .filter((s) => s && itemById[s.id] && itemById[s.id].sellPrice)
      .map((s) => ({ slot: s, def: itemById[s.id] }));
  };

  shop.confirmAction = () => {
    if (shop.mode === 'buy') {
      const item = catalog[shop.buyIndex];
      if (!item) return;
      if (wallet.get() < item.buyPrice) {
        toast.show("Kulang ang pera mo! (Not enough money)");
        return;
      }
      if (inventory.add(item.id, 1)) {
        wallet.spend(item.buyPrice);
        toast.show(`Bought 1 ${item.name} (-₱${item.buyPrice})`);
      } else {
        toast.show("Puno na ang bag mo! (Inventory full)");
      }
    } else {
      const sellables = shop.sellableItems();
      const entry = sellables[shop.sellIndex];
      if (!entry) return;
      const { slot, def } = entry;
      if (inventory.remove(slot.id, 1)) {
        wallet.add(def.sellPrice);
        toast.show(`Sold 1 ${def.name} (+₱${def.sellPrice})`);
        if (shop.sellIndex >= shop.sellableItems().length) {
          shop.sellIndex = Math.max(0, shop.sellableItems().length - 1);
        }
      }
    }
  };

  shop.render = function (ctx, { width, height }) {
    if (!shop.isOpen) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);

    const mw = 380, mh = 220;
    const mx = Math.floor((width - mw) / 2);
    const my = Math.floor((height - mh) / 2);

    // Dialog background
    ctx.fillStyle = '#261b12';
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = '#c9a66b';
    ctx.lineWidth = 2;
    ctx.strokeRect(mx + 1, my + 1, mw - 2, mh - 2);

    // Header & Greeting
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#ffe08a';
    ctx.fillText('TINDAHAN NI ALING NENA (Sari-Sari Store)', mx + 12, my + 8);

    ctx.font = '7px monospace';
    ctx.fillStyle = '#bfa58a';
    ctx.fillText(shop.greeting, mx + 12, my + 20);

    // Player Money Display
    ctx.font = '8px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#8bc34a';
    ctx.fillText(`Money: ₱${wallet.get()}`, mx + mw - 14, my + 8);

    // Tabs: BUY / SELL
    const tabY = my + 32;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';

    // Buy Tab
    ctx.fillStyle = shop.mode === 'buy' ? '#5e432d' : '#38281b';
    ctx.fillRect(mx + 12, tabY, 80, 16);
    ctx.fillStyle = shop.mode === 'buy' ? '#fff' : '#aaa';
    ctx.fillText('BUY [Q]', mx + 52, tabY + 4);

    // Sell Tab
    ctx.fillStyle = shop.mode === 'sell' ? '#5e432d' : '#38281b';
    ctx.fillRect(mx + 96, tabY, 80, 16);
    ctx.fillStyle = shop.mode === 'sell' ? '#fff' : '#aaa';
    ctx.fillText('SELL [E]', mx + 136, tabY + 4);

    // Items List Box
    const listX = mx + 12, listY = tabY + 20, listW = 200, listH = 135;
    ctx.fillStyle = '#1e140d';
    ctx.fillRect(listX, listY, listW, listH);
    ctx.strokeStyle = '#4a3622';
    ctx.lineWidth = 1;
    ctx.strokeRect(listX, listY, listW, listH);

    ctx.textAlign = 'left';
    let selItem = null;

    if (shop.mode === 'buy') {
      const visibleCount = 8;
      const start = Math.max(0, Math.min(catalog.length - visibleCount, shop.buyIndex - 3));
      for (let i = 0; i < visibleCount; i++) {
        const idx = start + i;
        if (idx >= catalog.length) break;
        const it = catalog[idx];
        const iy = listY + 4 + i * 16;
        const isSel = idx === shop.buyIndex;

        if (isSel) {
          selItem = it;
          ctx.fillStyle = '#5e432d';
          ctx.fillRect(listX + 2, iy - 2, listW - 4, 15);
        }

        ctx.fillStyle = it.color || '#fff';
        ctx.fillRect(listX + 6, iy + 1, 8, 8);

        ctx.font = '7px monospace';
        ctx.fillStyle = isSel ? '#ffe08a' : '#ddd';
        ctx.fillText(it.name, listX + 18, iy + 1);

        ctx.fillStyle = '#8bc34a';
        ctx.textAlign = 'right';
        ctx.fillText(`₱${it.buyPrice}`, listX + listW - 8, iy + 1);
        ctx.textAlign = 'left';
      }
    } else {
      const sellables = shop.sellableItems();
      if (sellables.length === 0) {
        ctx.font = '7px monospace';
        ctx.fillStyle = '#888';
        ctx.fillText('Walang maibebenta. (No items to sell)', listX + 8, listY + 12);
      } else {
        const visibleCount = 8;
        const start = Math.max(0, Math.min(sellables.length - visibleCount, shop.sellIndex - 3));
        for (let i = 0; i < visibleCount; i++) {
          const idx = start + i;
          if (idx >= sellables.length) break;
          const { slot, def } = sellables[idx];
          const iy = listY + 4 + i * 16;
          const isSel = idx === shop.sellIndex;

          if (isSel) {
            selItem = def;
            ctx.fillStyle = '#5e432d';
            ctx.fillRect(listX + 2, iy - 2, listW - 4, 15);
          }

          ctx.fillStyle = def.color || '#fff';
          ctx.fillRect(listX + 6, iy + 1, 8, 8);

          ctx.font = '7px monospace';
          ctx.fillStyle = isSel ? '#ffe08a' : '#ddd';
          ctx.fillText(`${def.name} x${slot.count}`, listX + 18, iy + 1);

          ctx.fillStyle = '#8bc34a';
          ctx.textAlign = 'right';
          ctx.fillText(`+₱${def.sellPrice}`, listX + listW - 8, iy + 1);
          ctx.textAlign = 'left';
        }
      }
    }

    // Detail Panel (right side)
    const detX = listX + listW + 10;
    const detY = listY;
    const detW = mw - (detX - mx) - 12;
    const detH = listH;

    ctx.fillStyle = '#1e140d';
    ctx.fillRect(detX, detY, detW, detH);
    ctx.strokeStyle = '#4a3622';
    ctx.lineWidth = 1;
    ctx.strokeRect(detX, detY, detW, detH);

    if (selItem) {
      ctx.font = '8px monospace';
      ctx.fillStyle = '#ffe08a';
      ctx.fillText(selItem.name, detX + 6, detY + 6);

      ctx.font = '7px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(selItem.english, detX + 6, detY + 18);

      ctx.fillStyle = '#8bc34a';
      let priceTxt = shop.mode === 'buy' ? `Price: ₱${selItem.buyPrice}` : `Sell: ₱${selItem.sellPrice}`;
      if (selItem.energy) priceTxt += ` | +${selItem.energy} EN`;
      ctx.fillText(priceTxt, detX + 6, detY + 30);

      // Description wrap
      ctx.fillStyle = '#ddd';
      const words = selItem.desc.split(' ');
      let line = '';
      let ly = detY + 46;
      for (const w of words) {
        const test = line + w + ' ';
        if (ctx.measureText(test).width > detW - 12) {
          ctx.fillText(line, detX + 6, ly);
          line = w + ' ';
          ly += 10;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, detX + 6, ly);
    }

    // Footer instruction
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c9a66b';
    ctx.fillText('[Up/Down] Select   [Space/J] ' + (shop.mode === 'buy' ? 'Buy 1' : 'Sell 1') + '   [Esc/K] Leave', mx + mw / 2, my + mh - 12);
  };

  return shop;
}
