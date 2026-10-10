// Dialogue UI with English-first Taglish speech, Tagalog glossary tooltips, and interactive choices.
export function createDialogueBox(glossaryData, { width, height }) {
  const dlg = {
    isOpen: false,
    speaker: '',
    role: '',
    tier: '',
    hearts: 0,
    text: '',
    choices: [],
    selectedChoice: 0,
    onChoice: null,
    glossaryTerm: null,
  };

  // Scan text for known Tagalog terms to surface in the "Salita" footer
  function findGlossaryTerm(str) {
    const clean = str.toLowerCase().replace(/[^a-z\s]/g, ' ');
    for (const term in glossaryData) {
      if (clean.includes(term.toLowerCase())) {
        return { term, def: glossaryData[term] };
      }
    }
    return null;
  }

  dlg.open = function ({ speaker, role, tier = 'light', hearts = 0, text, choices = [], onChoice = null }) {
    dlg.isOpen = true;
    dlg.speaker = speaker;
    dlg.role = role || '';
    dlg.tier = tier;
    dlg.hearts = hearts;
    dlg.text = text;
    dlg.choices = choices;
    dlg.selectedChoice = 0;
    dlg.onChoice = onChoice;
    dlg.glossaryTerm = findGlossaryTerm(text);
  };

  dlg.close = function () {
    dlg.isOpen = false;
    dlg.choices = [];
    dlg.onChoice = null;
  };

  dlg.moveChoice = function (dy) {
    if (dlg.choices.length === 0) return;
    dlg.selectedChoice = (dlg.selectedChoice + dy + dlg.choices.length) % dlg.choices.length;
  };

  dlg.confirm = function () {
    if (dlg.choices.length > 0) {
      const choice = dlg.choices[dlg.selectedChoice];
      if (dlg.onChoice) dlg.onChoice(choice, dlg.selectedChoice);
    }
    dlg.close();
  };

  dlg.render = function (ctx) {
    if (!dlg.isOpen) return;

    const boxW = Math.min(440, width - 24);
    const boxH = dlg.choices.length > 0 ? 105 : 82;
    const boxX = Math.floor((width - boxW) / 2);
    const boxY = height - boxH - 8;

    // Dark brown wooden dialog box
    ctx.fillStyle = '#261b12';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#c9a66b';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX + 1, boxY + 1, boxW - 2, boxH - 2);

    // Speaker Name Plate
    const badgeW = ctx.measureText(dlg.speaker).width + 24;
    ctx.fillStyle = '#422818';
    ctx.fillRect(boxX + 8, boxY - 10, badgeW + 30, 14);
    ctx.strokeStyle = '#ffe08a';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX + 8, boxY - 10, badgeW + 30, 14);

    ctx.font = '8px monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffe08a';
    ctx.fillText(dlg.speaker, boxX + 14, boxY - 7);

    // Heart display for romance/core characters
    if (dlg.hearts > 0) {
      let heartStr = '♥'.repeat(dlg.hearts) + '♡'.repeat(10 - dlg.hearts);
      ctx.fillStyle = '#ff4081';
      ctx.textAlign = 'right';
      ctx.fillText(heartStr, boxX + boxW - 12, boxY + 6);
      ctx.textAlign = 'left';
    }

    // Role text
    if (dlg.role) {
      ctx.font = '7px monospace';
      ctx.fillStyle = '#bfa58a';
      ctx.fillText(`• ${dlg.role}`, boxX + 14 + ctx.measureText(dlg.speaker).width + 8, boxY - 6);
    }

    // Dialogue text wrapping
    ctx.font = '8px monospace';
    ctx.fillStyle = '#f5ede0';
    const words = dlg.text.split(' ');
    let line = '';
    let textY = boxY + 12;
    const maxTextW = boxW - 24;

    for (const w of words) {
      const test = line + w + ' ';
      if (ctx.measureText(test).width > maxTextW) {
        ctx.fillText(line, boxX + 12, textY);
        line = w + ' ';
        textY += 11;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, boxX + 12, textY);
      textY += 12;
    }

    // Interactive Choices (if present)
    if (dlg.choices.length > 0) {
      textY += 2;
      dlg.choices.forEach((c, idx) => {
        const isSel = idx === dlg.selectedChoice;
        ctx.fillStyle = isSel ? '#ffe08a' : '#aaa';
        const prefix = isSel ? '▶ ' : '  ';
        ctx.fillText(`${prefix}${c.text || c}`, boxX + 16, textY);
        textY += 10;
      });
    }

    // Salita Glossary Footer Note
    if (dlg.glossaryTerm) {
      ctx.fillStyle = '#17100b';
      ctx.fillRect(boxX + 6, boxY + boxH - 16, boxW - 12, 12);
      ctx.fillStyle = '#81d4fa';
      ctx.font = '7px monospace';
      const defLine = `📖 Salita [${dlg.glossaryTerm.term}]: ${dlg.glossaryTerm.def}`;
      ctx.fillText(defLine.slice(0, 75), boxX + 10, boxY + boxH - 14);
    }

    // Advance prompt
    ctx.font = '7px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#c9a66b';
    ctx.fillText('[Space/J] Next   [Esc/K] Close', boxX + boxW - 8, boxY + boxH - 18);
  };

  return dlg;
}
