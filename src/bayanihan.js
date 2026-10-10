// Bayanihan Restoration Board System:
// Communal projects funded by player & neighbor donations to revive Barangay Maliwanag.
export function createBayanihan(projectsData, inventory, wallet, toast) {
  const projects = projectsData.map((p) => ({
    ...p,
    donatedItems: p.donatedItems || {},
    donatedCost: p.donatedCost || 0,
    completed: !!p.completed,
  }));

  const b = {
    isOpen: false,
    projects,
    selectedIndex: 0,
  };

  b.open = () => { b.isOpen = true; b.selectedIndex = 0; };
  b.close = () => { b.isOpen = false; };

  b.moveSelection = (dy) => {
    b.selectedIndex = (b.selectedIndex + dy + projects.length) % projects.length;
  };

  b.isCompleted = (id) => {
    const proj = projects.find((p) => p.id === id);
    return proj ? proj.completed : false;
  };

  b.donateToSelected = function () {
    const proj = projects[b.selectedIndex];
    if (!proj || proj.completed) return;

    let donatedAny = false;

    // 1. Donate items needed
    for (const req of proj.requiredItems) {
      const already = proj.donatedItems[req.id] || 0;
      const needed = req.count - already;
      if (needed > 0 && inventory.has(req.id, 1)) {
        const canGive = Math.min(needed, inventory.count(req.id));
        inventory.remove(req.id, canGive);
        proj.donatedItems[req.id] = already + canGive;
        toast.show(`Donated ${canGive}x ${req.name} to ${proj.name}`);
        donatedAny = true;
      }
    }

    // 2. Donate money needed (in increments of ₱100)
    const moneyNeeded = proj.cost - proj.donatedCost;
    if (moneyNeeded > 0 && wallet.get() >= 50) {
      const giveMoney = Math.min(moneyNeeded, Math.min(100, wallet.get()));
      wallet.spend(giveMoney);
      proj.donatedCost += giveMoney;
      toast.show(`Donated ₱${giveMoney} to ${proj.name}`);
      donatedAny = true;
    }

    // Check completion
    const itemsDone = proj.requiredItems.every((r) => (proj.donatedItems[r.id] || 0) >= r.count);
    const moneyDone = proj.donatedCost >= proj.cost;

    if (itemsDone && moneyDone && !proj.completed) {
      proj.completed = true;
      toast.show(`🎉 BAYANIHAN COMPLETE: ${proj.name}!`);
    } else if (!donatedAny) {
      toast.show("No matching materials or funds in bag to donate right now.");
    }
  };

  b.render = function (ctx, { width, height }) {
    if (!b.isOpen) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);

    const mw = 400, mh = 220;
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
    ctx.fillStyle = '#ffe08a';
    ctx.fillText('BAYANIHAN COMMUNITY PROJECTS', mx + mw / 2, my + 8);

    // Project List (left side)
    const listX = mx + 12, listY = my + 26, listW = 160, listH = 160;
    ctx.fillStyle = '#1e140d';
    ctx.fillRect(listX, listY, listW, listH);
    ctx.strokeStyle = '#4a3622';
    ctx.lineWidth = 1;
    ctx.strokeRect(listX, listY, listW, listH);

    ctx.textAlign = 'left';
    projects.forEach((proj, idx) => {
      const isSel = idx === b.selectedIndex;
      const py = listY + 6 + idx * 36;

      ctx.fillStyle = isSel ? '#5e432d' : '#2b1c11';
      ctx.fillRect(listX + 2, py - 2, listW - 4, 32);

      ctx.font = '7px monospace';
      ctx.fillStyle = proj.completed ? '#8bc34a' : isSel ? '#ffe08a' : '#ddd';
      const checkMark = proj.completed ? '✓ ' : '• ';
      ctx.fillText(`${checkMark}${proj.name.slice(0, 20)}`, listX + 6, py);

      // Progress bar
      ctx.fillStyle = '#444';
      ctx.fillRect(listX + 6, py + 12, 140, 5);
      const totalParts = proj.requiredItems.length + 1;
      let completedParts = (proj.donatedCost >= proj.cost ? 1 : proj.donatedCost / proj.cost);
      proj.requiredItems.forEach((r) => {
        completedParts += Math.min(1, (proj.donatedItems[r.id] || 0) / r.count);
      });
      const ratio = Math.min(1, completedParts / totalParts);
      ctx.fillStyle = proj.completed ? '#8bc34a' : '#ffb74d';
      ctx.fillRect(listX + 6, py + 12, Math.round(140 * ratio), 5);
    });

    // Details Panel (right side)
    const detX = listX + listW + 12;
    const detY = listY;
    const detW = mw - (detX - mx) - 12;
    const detH = listH;

    ctx.fillStyle = '#1e140d';
    ctx.fillRect(detX, detY, detW, detH);
    ctx.strokeStyle = '#4a3622';
    ctx.lineWidth = 1;
    ctx.strokeRect(detX, detY, detW, detH);

    const sel = projects[b.selectedIndex];
    if (sel) {
      ctx.font = '8px monospace';
      ctx.fillStyle = sel.completed ? '#8bc34a' : '#ffe08a';
      ctx.fillText(sel.name, detX + 6, detY + 6);

      ctx.font = '7px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`Lead: ${sel.lead}`, detX + 6, detY + 18);

      ctx.fillStyle = '#ddd';
      ctx.fillText(`Funding: ₱${sel.donatedCost} / ₱${sel.cost}`, detX + 6, detY + 32);

      let reqY = detY + 46;
      ctx.fillStyle = '#c9a66b';
      ctx.fillText('Required Materials:', detX + 6, reqY);
      reqY += 10;

      sel.requiredItems.forEach((req) => {
        const done = sel.donatedItems[req.id] || 0;
        ctx.fillStyle = done >= req.count ? '#8bc34a' : '#fff';
        ctx.fillText(`- ${req.name}: ${done}/${req.count} (In bag: ${inventory.count(req.id)})`, detX + 8, reqY);
        reqY += 10;
      });

      reqY += 6;
      ctx.fillStyle = '#81d4fa';
      ctx.fillText('Community Impact:', detX + 6, reqY);
      reqY += 10;
      ctx.fillStyle = '#ccc';
      ctx.fillText(sel.reward.slice(0, 32), detX + 6, reqY);
      ctx.fillText(sel.reward.slice(32, 64), detX + 6, reqY + 9);
    }

    // Footer instruction
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c9a66b';
    ctx.fillText('[Up/Down] Select   [Space/J] Donate Resources   [Esc/K] Close', mx + mw / 2, my + mh - 12);
  };

  return b;
}
