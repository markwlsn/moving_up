// Pet System (Aso o Pusa):
// Adopt, name, pet daily, follow the player on Bukid ni Lolo, and build affection.
export function createPet(config, toast) {
  const pet = {
    adopted: true,
    type: 'dog', // 'dog' or 'cat'
    name: 'Tagpi',
    affection: 120, // 0-1000 pts (100 = 1 heart)
    pettedToday: false,
    mapId: 'farm',
    x: 6 * 16,
    y: 8 * 16,
    targetX: 6 * 16,
    targetY: 8 * 16,
    facing: 'down',
  };

  pet.hearts = () => Math.min(10, Math.floor(pet.affection / 100));

  pet.petAnimal = () => {
    if (pet.pettedToday) {
      toast.show(`${pet.name} is napping happily.`);
      return false;
    }
    pet.pettedToday = true;
    pet.affection = Math.min(1000, pet.affection + 30);
    const sound = pet.type === 'dog' ? 'Arf! *wags tail*' : 'Meow! *purrs softly*';
    toast.show(`Petted ${pet.name}! ♥ ${sound}`);
    return true;
  };

  pet.update = function (dt, player, currentMapId) {
    if (!pet.adopted || pet.mapId !== currentMapId) return;

    // Follow player if further than 32 pixels
    const dx = player.x - pet.x;
    const dy = player.y - pet.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 36) {
      const speed = 65;
      const moveX = (dx / dist) * speed * dt;
      const moveY = (dy / dist) * speed * dt;
      pet.x += moveX;
      pet.y += moveY;

      if (Math.abs(dx) > Math.abs(dy)) {
        pet.facing = dx > 0 ? 'right' : 'left';
      } else {
        pet.facing = dy > 0 ? 'down' : 'up';
      }
    }
  };

  pet.onNewDay = () => {
    pet.pettedToday = false;
  };

  return pet;
}
