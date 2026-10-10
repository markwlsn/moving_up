// Events & Fiesta Festival System:
// Handles the 4 seasonal fiestas, festival plaza celebrations, cutscene dialogs, and wedding ceremonies.
export function createEventManager(fiestasData, dialogBox, toast) {
  const fiestaByPart = Object.fromEntries(fiestasData.map((f) => [f.seasonPart, f]));

  const ev = {};

  ev.getTodayFiesta = (clockDate) => {
    const f = fiestaByPart[clockDate.part.id];
    if (f && clockDate.dayOfPart === f.day) {
      return f;
    }
    return null;
  };

  ev.startFiesta = (fiesta, npcs) => {
    dialogBox.open({
      speaker: 'Kapitan Dan',
      role: 'Barangay Captain',
      tier: 'core',
      text: `Maligayang ${fiesta.name}! The whole barrio has gathered at the plaza for ${fiesta.theme}! Kain tayo at magdiwang!`,
      choices: [
        { text: 'Celebrate with the villagers (+50 Friendship to all)' },
        { text: 'Sample traditional fiesta kakanin (+50 Energy)' }
      ],
      onChoice: (choice, idx) => {
        if (idx === 0) {
          toast.show(`🎉 Celebrated ${fiesta.name}! Everyone felt the warmth of bayanihan!`);
        } else {
          toast.show(`Delicious fiesta feast! Restored full energy!`);
        }
      }
    });
  };

  ev.startWedding = (spouse, villagers) => {
    dialogBox.open({
      speaker: 'Lola Remedios',
      role: 'Barrio Elder & Matron',
      tier: 'core',
      text: `Sa ngalan ng buong Barangay Maliwanag, binabati namin kayo! May your love flourish like fertile soil and gentle rain! Mabuhay ang bagong kasal!`,
      choices: [
        { text: 'Kiss your spouse and thank the barrio!' }
      ],
      onChoice: () => {
        toast.show(`💒💍 Married to ${spouse.name}! The plaza erupts in cheer!`);
      }
    });
  };

  return ev;
}
