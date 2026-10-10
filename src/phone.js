// In-Game Smartphone (Modern Ligawan Messaging & Dates):
// Allows texting with romance candidates, banter replies, date invites, and DTR chats.
export function createPhone(npcsData, romanceManager, toast) {
  const getCandidates = () => {
    return npcsData.filter((n) => {
      if (n.tier !== 'romance') return false;
      if (romanceManager.preference === 'male') return n.gender === 'male';
      if (romanceManager.preference === 'female') return n.gender === 'female';
      return true;
    });
  };

  const phone = {
    isOpen: false,
    selectedCandidateIndex: 0,
    activeChat: null, // candidate currently chatting with
    messages: {}, // thread history per candidate id
  };

  // Initialize phone threads with initial welcome texts
  npcsData.filter((n) => n.tier === 'romance').forEach((c) => {
    phone.messages[c.id] = [
      { sender: c.name, text: `Hey! Saved your number. How's Bukid ni Lolo going?`, time: 'Yesterday' }
    ];
  });

  phone.open = () => { phone.isOpen = true; phone.activeChat = null; };
  phone.close = () => { phone.isOpen = false; phone.activeChat = null; };

  phone.moveContact = (dy) => {
    const list = getCandidates();
    if (!list.length) return;
    phone.selectedCandidateIndex = (phone.selectedCandidateIndex + dy + list.length) % list.length;
  };

  phone.selectContact = () => {
    const list = getCandidates();
    if (list[phone.selectedCandidateIndex]) {
      phone.activeChat = list[phone.selectedCandidateIndex];
    }
  };

  phone.backToContacts = () => {
    phone.activeChat = null;
  };

  phone.askOnDate = (spot) => {
    if (!phone.activeChat) return;
    const c = phone.activeChat;
    const hearts = romanceManager.getHearts(c.id);
    if (hearts < 3) {
      phone.messages[c.id].push({
        sender: c.name,
        text: `Haha medyo busy ako today, let's hang out more in the plaza first! (Needs 3+ Hearts)`,
        time: 'Just now'
      });
      toast.show(`${c.name} prefers to get to know you better first.`);
    } else {
      phone.messages[c.id].push({
        sender: 'You',
        text: `G ka ba to hang out at ${spot}?`,
        time: 'Just now'
      });
      phone.messages[c.id].push({
        sender: c.name,
        text: `Game! Meet you there tonight! Kinikilig ako haha.`,
        time: 'Just now'
      });
      romanceManager.addVibe(c.id, 25);
      toast.show(`Date confirmed with ${c.name}! (+25 Vibe Match)`);
    }
  };

  phone.render = function (ctx, { width, height }) {
    if (!phone.isOpen) return;

    // Phone casing (looks like a modern smartphone on right side of screen)
    const pw = 200, ph = 240;
    const px = width - pw - 16;
    const py = Math.floor((height - ph) / 2);

    // Outer Bezel
    ctx.fillStyle = '#1c1c1e';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#48484a';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, pw, ph);

    // Screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(px + 4, py + 14, pw - 8, ph - 28);

    // Status bar (clock & battery)
    ctx.font = '6px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('9:41 AM  •  5G', px + 8, py + 5);
    ctx.textAlign = 'right';
    ctx.fillText('100% 🔋', px + pw - 8, py + 5);

    if (!phone.activeChat) {
      // CONTACTS / MESSAGES LIST
      ctx.textAlign = 'left';
      ctx.font = '8px monospace';
      ctx.fillStyle = '#ffe08a';
      ctx.fillText('MESSAGES (Barkada)', px + 10, py + 20);

      const listY = py + 34;
      const list = getCandidates();
      list.slice(0, 8).forEach((c, idx) => {
        const isSel = idx === phone.selectedCandidateIndex;
        const cy = listY + idx * 23;

        ctx.fillStyle = isSel ? '#2c2c2e' : '#141416';
        ctx.fillRect(px + 6, cy, pw - 12, 21);

        // Avatar dot
        ctx.fillStyle = c.shirtColor || '#8bc34a';
        ctx.beginPath();
        ctx.arc(px + 16, cy + 10, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '7px monospace';
        ctx.fillStyle = isSel ? '#ffe08a' : '#fff';
        const hearts = romanceManager.getHearts(c.id);
        const heartTag = hearts > 0 ? ` [${hearts}♥]` : '';
        ctx.fillText(`${c.name}${heartTag}`, px + 26, cy + 4);

        ctx.font = '6px monospace';
        ctx.fillStyle = '#8e8e93';
        const stage = romanceManager.getStage(c.id);
        ctx.fillText(`Stage: ${stage}`, px + 26, cy + 12);
      });

      // Phone bottom instruction
      ctx.font = '6px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#8e8e93';
      ctx.fillText('[Up/Down] Pick  [Space] Chat  [P/Esc] Close', px + pw / 2, py + ph - 10);
    } else {
      // ACTIVE CHAT SCREEN
      const c = phone.activeChat;
      ctx.fillStyle = '#1c1c1e';
      ctx.fillRect(px + 4, py + 14, pw - 8, 20);

      ctx.font = '7px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#30d158';
      ctx.fillText(`• ${c.name} (Online)`, px + 10, py + 20);

      // Thread messages
      const msgs = phone.messages[c.id] || [];
      let my = py + 38;
      msgs.slice(-5).forEach((m) => {
        const isMe = m.sender === 'You';
        ctx.font = '6px monospace';
        ctx.fillStyle = isMe ? '#0a84ff' : '#2c2c2e';
        const mw = Math.min(130, ctx.measureText(m.text).width + 8);
        const mx = isMe ? px + pw - mw - 10 : px + 10;

        ctx.fillRect(mx, my, mw, 14);
        ctx.fillStyle = '#fff';
        ctx.fillText(m.text.slice(0, 24), mx + 4, my + 3);
        my += 18;
      });

      // Quick Actions at bottom of chat
      ctx.font = '6px monospace';
      ctx.fillStyle = '#ff9f0a';
      ctx.textAlign = 'center';
      ctx.fillText('[1] Ask to Plaza   [2] Ask to Kapehan', px + pw / 2, py + ph - 24);
      ctx.fillText('[Space] Define Relationship (DTR)  [Esc] Back', px + pw / 2, py + ph - 14);
    }
  };

  return phone;
}
