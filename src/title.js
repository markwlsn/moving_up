// Title Screen & Opening Prologue System for Ani sa Nayon.
// Features Title Menu, Controls Guide, New Game with Lolo's Letter prologue, and Romance preference setup.
export function createTitleScreen(storage, onStartGame, { width, height }) {
  const ts = {
    state: 'title', // 'title', 'intro', 'controls', 'preference'
    selectedIndex: 0,
    hasSave: storage.hasSave(),
    introStep: 0,
    preference: 'both', // 'male', 'female', 'both'
  };

  const menuOptions = ts.hasSave
    ? ['Continue Game', 'New Game (Bukid ni Lolo)', 'Controls & Guide']
    : ['Start New Game', 'Controls & Guide'];

  const introPages = [
    {
      title: "LIPAT-BAHAY MULA MAYNILA",
      text: "After years working in the relentless concrete traffic of Manila, you receive a weathered envelope tied with abaca string from Barangay Maliwanag...",
      sub: "A handwritten letter from your late grandfather, Lolo."
    },
    {
      title: "ANG LIHAM NI LOLO",
      text: "\"Apo, when you tire of the city's noise, come home. The land has always waited for you. Love the soil, help your neighbors through bayanihan, and the barrio will love you back. Bukid ni Lolo is yours now.\"",
      sub: "You packed a single bag and caught the first bus north."
    },
    {
      title: "MALIGAYANG PAGDATING!",
      text: "As dawn breaks over the emerald valley, the rooster crows and mist rolls across the rice fields. Fresh morning air fills your lungs. You are finally home.",
      sub: "Press [Space/J] to begin your new life."
    }
  ];

  ts.update = function (wasPressed) {
    if (ts.state === 'title') {
      if (wasPressed('up')) {
        ts.selectedIndex = (ts.selectedIndex - 1 + menuOptions.length) % menuOptions.length;
      } else if (wasPressed('down')) {
        ts.selectedIndex = (ts.selectedIndex + 1) % menuOptions.length;
      } else if (wasPressed('interact')) {
        const choice = menuOptions[ts.selectedIndex];
        if (choice === 'Continue Game') {
          onStartGame({ isNew: false });
        } else if (choice.includes('New Game') || choice === 'Start New Game') {
          ts.state = 'preference';
          ts.selectedIndex = 0;
        } else if (choice === 'Controls & Guide') {
          ts.state = 'controls';
        }
      }
    } else if (ts.state === 'preference') {
      const prefs = ['both', 'female', 'male'];
      if (wasPressed('up') || wasPressed('left')) {
        ts.selectedIndex = (ts.selectedIndex - 1 + 3) % 3;
      } else if (wasPressed('down') || wasPressed('right')) {
        ts.selectedIndex = (ts.selectedIndex + 1) % 3;
      } else if (wasPressed('interact')) {
        ts.preference = prefs[ts.selectedIndex];
        ts.state = 'intro';
        ts.introStep = 0;
      }
    } else if (ts.state === 'controls') {
      if (wasPressed('cancel') || wasPressed('interact')) {
        ts.state = 'title';
      }
    } else if (ts.state === 'intro') {
      if (wasPressed('interact') || wasPressed('cancel')) {
        ts.introStep++;
        if (ts.introStep >= introPages.length) {
          onStartGame({ isNew: true, preference: ts.preference });
        }
      }
    }
  };

  ts.render = function (ctx) {
    // 1. Cozy Rural Sunset Background
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#2d1b4e'); // Twilight violet
    grad.addColorStop(0.45, '#c05c46'); // Sunset coral
    grad.addColorStop(0.75, '#e8974d'); // Golden horizon
    grad.addColorStop(1, '#3e6328'); // Deep green fields
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Distant mountain silhouette
    ctx.fillStyle = '#2b3320';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.72);
    ctx.lineTo(width * 0.25, height * 0.58);
    ctx.lineTo(width * 0.55, height * 0.65);
    ctx.lineTo(width * 0.85, height * 0.54);
    ctx.lineTo(width, height * 0.68);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();

    // Silhouetted nipa hut and coconut palms
    ctx.fillStyle = '#182012';
    ctx.fillRect(width * 0.12, height * 0.66, 32, 22);
    ctx.beginPath();
    ctx.moveTo(width * 0.12 - 4, height * 0.66);
    ctx.lineTo(width * 0.12 + 16, height * 0.56);
    ctx.lineTo(width * 0.12 + 36, height * 0.66);
    ctx.fill();

    if (ts.state === 'title') {
      // Game Title
      ctx.font = '22px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#1a0d06';
      ctx.fillText('ANI SA NAYON', width / 2 + 1, 39);
      ctx.fillStyle = '#ffd54f';
      ctx.fillText('ANI SA NAYON', width / 2, 38);

      ctx.font = '8px monospace';
      ctx.fillStyle = '#fff3e0';
      ctx.fillText('A Cozy Farming Life in Barangay Maliwanag', width / 2, 66);

      // Menu Options
      const menuY = 120;
      menuOptions.forEach((opt, idx) => {
        const isSel = idx === ts.selectedIndex;
        const y = menuY + idx * 26;

        ctx.fillStyle = isSel ? 'rgba(40, 20, 10, 0.8)' : 'rgba(20, 10, 5, 0.5)';
        ctx.fillRect(width / 2 - 110, y - 4, 220, 20);
        ctx.strokeStyle = isSel ? '#ffd54f' : '#6b4f35';
        ctx.lineWidth = isSel ? 1.5 : 1;
        ctx.strokeRect(width / 2 - 110, y - 4, 220, 20);

        ctx.font = '9px monospace';
        ctx.fillStyle = isSel ? '#ffd54f' : '#ddd';
        const prefix = isSel ? '▶ ' : '  ';
        ctx.fillText(`${prefix}${opt}`, width / 2, y + 2);
      });

      // Footer
      ctx.font = '7px monospace';
      ctx.fillStyle = '#ffe0b2';
      ctx.fillText('[Up/Down] Navigate   [Space/J] Select', width / 2, height - 16);

    } else if (ts.state === 'preference') {
      // Romance Preference Selection Modal
      const boxW = 340, boxH = 170;
      const bx = Math.floor((width - boxW) / 2), by = Math.floor((height - boxH) / 2);

      ctx.fillStyle = '#261b12';
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.strokeStyle = '#c9a66b';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx + 1, by + 1, boxW - 2, boxH - 2);

      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffe08a';
      ctx.fillText('DATING PREFERENCE (Modern Ligawan)', width / 2, by + 12);

      ctx.font = '7px monospace';
      ctx.fillStyle = '#ddd';
      ctx.fillText('Who are you interested in meeting in Barangay Maliwanag?', width / 2, by + 30);
      ctx.fillText('(You can still build friendships with all 30 villagers!)', width / 2, by + 42);

      const prefOptions = [
        { label: 'Everyone (Boys & Girls)', sub: 'Open to all 10 romance candidates' },
        { label: 'Girls Only', sub: 'Maya, Bianca, Tala, Nicole, Andrea' },
        { label: 'Boys Only', sub: 'Jericho, Miguel, Joshua, Rafael, Enzo' },
      ];

      prefOptions.forEach((p, idx) => {
        const isSel = idx === ts.selectedIndex;
        const py = by + 60 + idx * 30;

        ctx.fillStyle = isSel ? '#5e432d' : '#332115';
        ctx.fillRect(bx + 20, py, boxW - 40, 24);
        ctx.strokeStyle = isSel ? '#ffd54f' : '#553620';
        ctx.lineWidth = isSel ? 1.5 : 1;
        ctx.strokeRect(bx + 20, py, boxW - 40, 24);

        ctx.font = '8px monospace';
        ctx.fillStyle = isSel ? '#ffd54f' : '#fff';
        ctx.fillText(`${isSel ? '▶ ' : ''}${p.label}`, width / 2, py + 4);
        ctx.font = '6px monospace';
        ctx.fillStyle = '#aaa';
        ctx.fillText(p.sub, width / 2, py + 14);
      });

      ctx.font = '7px monospace';
      ctx.fillStyle = '#c9a66b';
      ctx.fillText('[Up/Down] Pick   [Space/J] Confirm', width / 2, by + boxH - 12);

    } else if (ts.state === 'controls') {
      renderControlsModal(ctx, width, height);
    } else if (ts.state === 'intro') {
      // Prologue Narrative Modal
      const page = introPages[ts.introStep];
      const boxW = 390, boxH = 180;
      const bx = Math.floor((width - boxW) / 2), by = Math.floor((height - boxH) / 2);

      ctx.fillStyle = 'rgba(25, 15, 8, 0.94)';
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.strokeStyle = '#c9a66b';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx + 1, by + 1, boxW - 2, boxH - 2);

      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd54f';
      ctx.fillText(page.title, width / 2, by + 16);

      // Wrapped narrative text
      ctx.font = '8px monospace';
      ctx.fillStyle = '#f5ede0';
      const words = page.text.split(' ');
      let line = '';
      let textY = by + 42;
      for (const w of words) {
        const test = line + w + ' ';
        if (ctx.measureText(test).width > boxW - 40) {
          ctx.fillText(line, width / 2, textY);
          line = w + ' ';
          textY += 14;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, width / 2, textY);

      ctx.font = '7px monospace';
      ctx.fillStyle = '#81d4fa';
      ctx.fillText(page.sub, width / 2, by + boxH - 34);

      ctx.font = '7px monospace';
      ctx.fillStyle = '#c9a66b';
      const cont = ts.introStep === introPages.length - 1 ? '[Space/J] Enter Bukid ni Lolo ▶' : `[Space/J] Next (${ts.introStep + 1}/${introPages.length}) ▶`;
      ctx.fillText(cont, width / 2, by + boxH - 14);
    }
  };

  return ts;
}

export function renderControlsModal(ctx, width, height) {
  const boxW = 380, boxH = 210;
  const bx = Math.floor((width - boxW) / 2), by = Math.floor((height - boxH) / 2);

  ctx.fillStyle = '#261b12';
  ctx.fillRect(bx, by, boxW, boxH);
  ctx.strokeStyle = '#c9a66b';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx + 1, by + 1, boxW - 2, boxH - 2);

  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe08a';
  ctx.fillText('HOW TO PLAY (Gabay sa Nayon)', width / 2, by + 10);

  ctx.font = '7px monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#eee';
  const guideLines = [
    "• Movement: Arrow Keys or WASD",
    "• Interact / Use Tool / Harvest / Talk / Pet: Space or J",
    "• Open / Close Bag: I or Tab (eat snacks to recover Energy)",
    "• Open / Close Phone: P (text candidates, ask on dates)",
    "• Cycle Tools: Q / E    Cycle Seeds: R",
    "• Shipping: Kaing basket beside the farm path pays overnight",
    "• Sleeping: Sleep in bed at Lolo's House (4 AM wake up)",
    "• Bayanihan: Donate at the plaza board to rebuild the barrio!",
    "• Tindahan: Buy seeds and meryenda at Tindahan ni Aling Nena",
    "• Quick Save: F5    Quick Load: F9    Toggle Debug: F3"
  ];
  guideLines.forEach((l, i) => {
    ctx.fillText(l, bx + 16, by + 28 + i * 15);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd54f';
  ctx.fillText('[Space / Esc / J / H] Close Guide', width / 2, by + boxH - 12);
}
