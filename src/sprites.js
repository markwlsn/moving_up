// Procedural pixel-art sprite and tile renderer for Ani sa Nayon.
// Turns basic geometry into cozy 16-bit retro farm aesthetics without external image assets.

export function createSpriteRenderer() {
  const sr = {};

  // 1. CHIBI FARMER SPRITE (Player)
  sr.drawPlayer = function (ctx, x, y, size, facing, animFrame = 0) {
    const px = Math.round(x);
    const py = Math.round(y);
    const step = Math.sin(animFrame * 8) > 0 ? 1 : 0;

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(px + 7, py + 14, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body / Overalls
    ctx.fillStyle = '#2c4d75'; // Blue denim overalls
    ctx.fillRect(px + 3, py + 7, 8, 6);

    // Legs / Boots
    ctx.fillStyle = '#4a3319'; // Brown boots
    if (facing === 'left' || facing === 'right') {
      ctx.fillRect(px + 4 + (step ? 2 : 0), py + 12, 3, 3);
      ctx.fillRect(px + 7 - (step ? 2 : 0), py + 12, 3, 3);
    } else {
      ctx.fillRect(px + 3 + (step ? 1 : 0), py + 12, 3, 3);
      ctx.fillRect(px + 8 - (step ? 1 : 0), py + 12, 3, 3);
    }

    // Shirt / Sleeves
    ctx.fillStyle = '#f5e6ca'; // Cream farmer shirt
    ctx.fillRect(px + 4, py + 6, 6, 3);

    // Head / Skin
    ctx.fillStyle = '#d49b6a'; // Warm Filipino skin tone
    ctx.fillRect(px + 4, py + 2, 6, 5);

    // Face details
    if (facing !== 'up') {
      ctx.fillStyle = '#222'; // Eyes
      if (facing === 'down') {
        ctx.fillRect(px + 5, py + 4, 1, 2);
        ctx.fillRect(px + 8, py + 4, 1, 2);
        // Rosy blush
        ctx.fillStyle = '#e57373';
        ctx.fillRect(px + 4, py + 5, 1, 1);
        ctx.fillRect(px + 9, py + 5, 1, 1);
      } else if (facing === 'left') {
        ctx.fillRect(px + 4, py + 4, 1, 2);
      } else if (facing === 'right') {
        ctx.fillRect(px + 9, py + 4, 1, 2);
      }
    }

    // Salakot (Traditional Philippine conical straw hat)
    ctx.fillStyle = '#bfa15f'; // Straw hat top
    ctx.beginPath();
    ctx.moveTo(px + 7, py - 3);
    ctx.lineTo(px - 1, py + 3);
    ctx.lineTo(px + 15, py + 3);
    ctx.closePath();
    ctx.fill();

    // Hat brim & trim
    ctx.fillStyle = '#8f7236';
    ctx.fillRect(px - 1, py + 3, 16, 1.5);
    ctx.fillStyle = '#dfc482'; // Highlight peak
    ctx.fillRect(px + 6, py - 2, 2, 2);
  };

  // 2. VILLAGER SPRITE
  sr.drawNPC = function (ctx, x, y, npc, facing = 'down', time = 0) {
    const px = Math.round(x);
    const py = Math.round(y);
    const bob = Math.sin(time * 3 + px) > 0.8 ? 1 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(px + 7, py + 14, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Clothes (Shirt / Dress)
    ctx.fillStyle = npc.shirtColor || npc.color || '#3f51b5';
    ctx.fillRect(px + 3, py + 6 - bob, 8, 7);

    // Pants / Skirt
    ctx.fillStyle = npc.color || '#333';
    ctx.fillRect(px + 4, py + 11 - bob, 6, 3);

    // Shoes
    ctx.fillStyle = '#2b1d0c';
    ctx.fillRect(px + 3, py + 13, 3, 2);
    ctx.fillRect(px + 8, py + 13, 3, 2);

    // Head / Skin
    ctx.fillStyle = '#d9a377';
    ctx.fillRect(px + 4, py + 2 - bob, 6, 5);

    // Hair
    ctx.fillStyle = npc.gender === 'female' ? '#211710' : '#1a1a1a';
    if (npc.gender === 'female') {
      ctx.fillRect(px + 3, py + 1 - bob, 8, 3);
      ctx.fillRect(px + 2, py + 3 - bob, 2, 5);
      ctx.fillRect(px + 10, py + 3 - bob, 2, 5);
    } else {
      ctx.fillRect(px + 3, py + 1 - bob, 8, 3);
    }

    // Eyes
    if (facing !== 'up') {
      ctx.fillStyle = '#222';
      ctx.fillRect(px + 5, py + 4 - bob, 1, 2);
      ctx.fillRect(px + 8, py + 4 - bob, 1, 2);
    }

    // Friendly Nametag Pill above NPC
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    const tag = npc.name;
    const tw = ctx.measureText(tag).width + 6;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(px + 7 - tw / 2, py - 9, tw, 8);
    ctx.fillStyle = npc.tier === 'romance' ? '#ff80ab' : '#fff';
    ctx.fillText(tag, px + 7, py - 3);
  };

  // 3. PET SPRITES (Dog & Cat)
  sr.drawPet = function (ctx, x, y, type = 'dog', facing = 'down', time = 0) {
    const px = Math.round(x);
    const py = Math.round(y);
    const wag = Math.sin(time * 10) * 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(px + 6, py + 12, 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'dog') {
      // Golden Brown Aspin Dog
      ctx.fillStyle = '#b27a3c'; // Body
      ctx.fillRect(px + 2, py + 4, 8, 7);
      ctx.fillStyle = '#d69e5e'; // Belly
      ctx.fillRect(px + 4, py + 7, 4, 3);
      // Head
      ctx.fillStyle = '#b27a3c';
      ctx.fillRect(px + 4, py + 1, 6, 5);
      // Floppy Ears
      ctx.fillStyle = '#825220';
      ctx.fillRect(px + 3, py + 2, 2, 3);
      ctx.fillRect(px + 9, py + 2, 2, 3);
      // Eyes & Snout
      ctx.fillStyle = '#222';
      ctx.fillRect(px + 5, py + 3, 1, 1);
      ctx.fillRect(px + 8, py + 3, 1, 1);
      ctx.fillRect(px + 6, py + 4, 2, 1);
      // Wagging tail
      ctx.fillStyle = '#b27a3c';
      ctx.fillRect(px + 1 + wag, py + 4, 2, 2);
      // Paws
      ctx.fillStyle = '#825220';
      ctx.fillRect(px + 3, py + 10, 2, 2);
      ctx.fillRect(px + 7, py + 10, 2, 2);
    } else {
      // Calico Pusapin Cat
      ctx.fillStyle = '#e8974d'; // Orange/ginger fur
      ctx.fillRect(px + 3, py + 5, 7, 6);
      ctx.fillStyle = '#ffffff'; // White patch
      ctx.fillRect(px + 5, py + 7, 3, 3);
      // Head
      ctx.fillStyle = '#e8974d';
      ctx.fillRect(px + 4, py + 2, 6, 5);
      // Pointed Ears
      ctx.fillStyle = '#bd6a20';
      ctx.fillRect(px + 4, py, 2, 2);
      ctx.fillRect(px + 8, py, 2, 2);
      // Eyes
      ctx.fillStyle = '#76ff03'; // Emerald eyes
      ctx.fillRect(px + 5, py + 4, 1, 1);
      ctx.fillRect(px + 8, py + 4, 1, 1);
      // Curled Tail
      ctx.fillStyle = '#2c2523'; // Calico black tail
      ctx.fillRect(px + 1, py + 4 + wag * 0.5, 2, 4);
      // Paws
      ctx.fillStyle = '#fff';
      ctx.fillRect(px + 4, py + 10, 2, 2);
      ctx.fillRect(px + 7, py + 10, 2, 2);
    }
  };

  // 4. RICH TEXTURED TILES & OBJECTS
  sr.drawTile = function (ctx, x, y, type, tx, ty, time = 0) {
    const ts = 16;
    switch (type) {
      case 'grass': {
        ctx.fillStyle = (tx + ty) % 2 ? '#74a851' : '#6ba047';
        ctx.fillRect(x, y, ts, ts);
        // Soft grass blades
        ctx.fillStyle = '#82b55b';
        ctx.fillRect(x + ((tx * 7 + ty * 3) % 11) + 2, y + 3, 1, 3);
        ctx.fillRect(x + ((tx * 5 + ty * 11) % 9) + 4, y + 9, 1, 2);
        // Rare wild flower
        if ((tx * 13 + ty * 7) % 23 === 0) {
          ctx.fillStyle = '#fff9c4';
          ctx.fillRect(x + 7, y + 6, 2, 2);
          ctx.fillStyle = '#fbc02d';
          ctx.fillRect(x + 7.5, y + 6.5, 1, 1);
        }
        break;
      }
      case 'water': {
        // Shimmering river/pond
        ctx.fillStyle = '#3a7bd5';
        ctx.fillRect(x, y, ts, ts);
        const wave = Math.sin(time * 3 + tx * 0.8 + ty * 0.5);
        ctx.fillStyle = wave > 0 ? '#5495ea' : '#2d68b8';
        ctx.fillRect(x + 2, y + 4 + Math.round(wave * 2), 7, 2);
        ctx.fillRect(x + 8, y + 10 - Math.round(wave * 2), 6, 1.5);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(x + 4, y + 5, 2, 1);
        break;
      }
      case 'soil': {
        ctx.fillStyle = '#825226';
        ctx.fillRect(x, y, ts, ts);
        ctx.fillStyle = '#6d431d';
        ctx.fillRect(x + 2, y + 3, 3, 2);
        ctx.fillRect(x + 9, y + 8, 3, 2);
        ctx.fillRect(x + 4, y + 12, 2, 2);
        break;
      }
      case 'path': {
        ctx.fillStyle = '#c9a66b';
        ctx.fillRect(x, y, ts, ts);
        ctx.fillStyle = '#b59257';
        ctx.fillRect(x + ((tx * 3) % 9) + 2, y + ((ty * 5) % 9) + 2, 3, 2);
        break;
      }
      case 'tree': {
        // Mango / Narra Tree Canopy
        ctx.fillStyle = '#1e521e';
        ctx.fillRect(x, y, ts, ts);
        ctx.fillStyle = '#276827';
        ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);
        ctx.fillStyle = '#327d32';
        ctx.fillRect(x + 3, y + 3, ts - 6, ts - 6);
        ctx.fillStyle = '#409c40';
        ctx.fillRect(x + 4, y + 4, 3, 3);
        break;
      }
      case 'house': {
        // Bahay Kubo Thatched Roof & Bamboo Walls
        ctx.fillStyle = '#a6723b'; // Thatch shingle
        ctx.fillRect(x, y, ts, ts);
        ctx.fillStyle = '#875624';
        ctx.fillRect(x, y + 4, ts, 1);
        ctx.fillRect(x, y + 9, ts, 1);
        ctx.fillRect(x, y + 14, ts, 1);
        break;
      }
      case 'door': {
        ctx.fillStyle = '#54381e';
        ctx.fillRect(x, y, ts, ts);
        ctx.fillStyle = '#d79948'; // Warm inner door light
        ctx.fillRect(x + 3, y + 2, ts - 6, ts - 4);
        ctx.fillStyle = '#8f5c2a';
        ctx.fillRect(x + 10, y + 8, 2, 2);
        break;
      }
      case 'kaing': {
        // Traditional woven bamboo/rattan shipping basket
        ctx.fillStyle = '#8f5926';
        ctx.beginPath();
        ctx.arc(x + 8, y + 8, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ba8247';
        ctx.fillRect(x + 3, y + 5, 10, 6);
        // Weave crossbars
        ctx.strokeStyle = '#5a3511';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 3.5, y + 5.5, 9, 5);
        ctx.beginPath();
        ctx.moveTo(x + 3, y + 8);
        ctx.lineTo(x + 13, y + 8);
        ctx.stroke();
        break;
      }
      case 'bed': {
        // Wooden bed frame with white sheets and pillow
        ctx.fillStyle = '#6d4520';
        ctx.fillRect(x, y, ts, ts);
        ctx.fillStyle = '#a63836'; // Red woven blanket
        ctx.fillRect(x + 2, y + 4, ts - 4, ts - 6);
        ctx.fillStyle = '#f4ede2'; // Pillow
        ctx.fillRect(x + 3, y + 2, ts - 6, 3);
        break;
      }
      case 'counter': {
        ctx.fillStyle = '#7a481c';
        ctx.fillRect(x, y, ts, ts);
        ctx.fillStyle = '#a1642c';
        ctx.fillRect(x + 1, y + 1, ts - 2, 4);
        break;
      }
      case 'floor': {
        ctx.fillStyle = (tx + ty) % 2 ? '#d09c63' : '#c39058';
        ctx.fillRect(x, y, ts, ts);
        ctx.strokeStyle = '#a67742';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, ts, ts);
        break;
      }
      case 'wall': {
        ctx.fillStyle = '#4a301c';
        ctx.fillRect(x, y, ts, ts);
        ctx.fillStyle = '#362112';
        ctx.fillRect(x + 2, y + 2, ts - 4, ts - 4);
        break;
      }
      default: {
        ctx.fillStyle = '#7cae5a';
        ctx.fillRect(x, y, ts, ts);
      }
    }
  };

  return sr;
}
