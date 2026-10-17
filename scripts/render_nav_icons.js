const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../assets/ui');

// ==========================================
// 1. NHÂN VẬT (Character Avatar - Enhanced RPG Hero)
// ==========================================
const avatarSvg = `
<svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Circle Gradients -->
    <radialGradient id="avBg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#0e2852"/>
      <stop offset="70%" stop-color="#061328"/>
      <stop offset="100%" stop-color="#020814"/>
    </radialGradient>
    <linearGradient id="avRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f2b66"/>
    </linearGradient>
    <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff1e6"/>
      <stop offset="70%" stop-color="#fed7aa"/>
      <stop offset="100%" stop-color="#fba86d"/>
    </linearGradient>
    <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a16207"/>
      <stop offset="35%" stop-color="#854d0e"/>
      <stop offset="75%" stop-color="#54300a"/>
      <stop offset="100%" stop-color="#351a03"/>
    </linearGradient>
    <linearGradient id="hairHi" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
    <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
    <clipPath id="circleClip">
      <circle cx="80" cy="80" r="51"/>
    </clipPath>
  </defs>

  <!-- Base Circle Frame -->
  <circle cx="80" cy="80" r="54" fill="none" stroke="url(#avRim)" stroke-width="2" opacity="0.6"/>
  <circle cx="80" cy="80" r="51" fill="url(#avBg)" stroke="#1e3a6a" stroke-width="2.5"/>

  <!-- Content Clipped inside Circle -->
  <g clip-path="url(#circleClip)">
    <!-- Adventurer Armor / Collar (Bottom) -->
    <path d="M 38 144 L 38 118 Q 58 110 80 110 Q 102 110 122 118 L 122 144 Z" fill="url(#shirtGrad)"/>
    <path d="M 66 110 L 80 123 L 94 110 Z" fill="#ffffff" opacity="0.95"/>
    <path d="M 76 120 L 80 138 L 84 120 Z" fill="#dc2626"/>

    <!-- Neck -->
    <rect x="73" y="102" width="14" height="14" rx="2" fill="#fed7aa"/>

    <!-- Ears -->
    <circle cx="53" cy="88" r="7" fill="#fed7aa"/>
    <circle cx="107" cy="88" r="7" fill="#fed7aa"/>

    <!-- Face Base -->
    <path d="M 55 74 Q 55 106 80 111 Q 105 106 105 74 Q 105 62 80 62 Q 55 62 55 74 Z" fill="url(#skinGrad)"/>

    <!-- Cute Blush -->
    <ellipse cx="65" cy="92" rx="4.5" ry="2.2" fill="#fb7185" opacity="0.5"/>
    <ellipse cx="95" cy="92" rx="4.5" ry="2.2" fill="#fb7185" opacity="0.5"/>

    <!-- Eyes (Sharp Anime Style) -->
    <!-- Left Eye -->
    <ellipse cx="68" cy="85" rx="5" ry="7" fill="#0c4a6e"/>
    <ellipse cx="68" cy="86" rx="4" ry="6" fill="#0284c7"/>
    <circle cx="69" cy="84" r="2.2" fill="#38bdf8"/>
    <circle cx="67" cy="83" r="2" fill="#ffffff"/>
    <circle cx="69.5" cy="88" r="1.2" fill="#ffffff"/>
    <!-- Left Eyebrow -->
    <path d="M 62 76 Q 68 73 74 76" fill="none" stroke="#451a03" stroke-width="2.2" stroke-linecap="round"/>

    <!-- Right Eye -->
    <ellipse cx="92" cy="85" rx="5" ry="7" fill="#0c4a6e"/>
    <ellipse cx="92" cy="86" rx="4" ry="6" fill="#0284c7"/>
    <circle cx="93" cy="84" r="2.2" fill="#38bdf8"/>
    <circle cx="91" cy="83" r="2" fill="#ffffff"/>
    <circle cx="93.5" cy="88" r="1.2" fill="#ffffff"/>
    <!-- Right Eyebrow -->
    <path d="M 98 76 Q 92 73 86 76" fill="none" stroke="#451a03" stroke-width="2.2" stroke-linecap="round"/>

    <!-- Nose & Confident Smile -->
    <circle cx="80" cy="91" r="1.2" fill="#ea580c"/>
    <path d="M 75 97 Q 80 102 85 97" fill="none" stroke="#991b1b" stroke-width="2" stroke-linecap="round"/>

    <!-- Back Hair Volume -->
    <path d="M 48 80 
             C 40 64, 46 44, 62 36 
             C 74 30, 92 30, 104 36 
             C 120 44, 122 66, 112 82 
             C 118 70, 122 54, 114 42 
             C 106 28, 86 24, 70 26 
             C 52 28, 38 40, 42 62 
             C 44 72, 46 78, 48 80 Z" fill="#241002"/>

    <!-- Main Spiky Anime Bangs & Hair -->
    <path d="M 48 72 
             C 44 54, 58 38, 76 36 
             C 90 34, 104 40, 112 54 
             C 116 66, 114 78, 112 82 
             C 110 76, 106 68, 102 72 
             C 98 80, 96 86, 94 88 
             C 93 81, 92 72, 87 75 
             C 83 82, 81 87, 79 90 
             C 78 82, 75 73, 70 76 
             C 65 82, 63 87, 61 89 
             C 60 81, 57 72, 53 78 
             C 51 80, 48 76, 48 72 Z" fill="url(#hairGrad)"/>

    <!-- Hair Highlights -->
    <path d="M 58 46 Q 74 38 94 42 Q 82 44 68 50 Z" fill="url(#hairHi)" opacity="0.95"/>
    <path d="M 72 48 Q 84 42 98 46 Q 88 48 80 52 Z" fill="#fef08a" opacity="0.6"/>
  </g>

  <!-- Subtle Inner Arc Highlight (Bottom Rim only) -->
  <path d="M 40 92 A 44 44 0 0 0 120 92" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.45" stroke-linecap="round"/>
</svg>
`;

// ==========================================
// 2. TÚI ĐỒ (Backpack - ACTIVE WITH GLOWING HALO)
// ==========================================
const bagSvg = `
<svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Circle Gradients -->
    <radialGradient id="bagBg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#142647"/>
      <stop offset="70%" stop-color="#08152b"/>
      <stop offset="100%" stop-color="#030a16"/>
    </radialGradient>
    
    <!-- Radiant Golden Halo Gradient -->
    <linearGradient id="goldHalo" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="85%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>

    <radialGradient id="haloGlow" cx="50%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.85"/>
      <stop offset="60%" stop-color="#d97706" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#b45309" stop-opacity="0"/>
    </radialGradient>

    <!-- Backpack Red Leather Gradients -->
    <radialGradient id="bagRed" cx="45%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="45%" stop-color="#dc2626"/>
      <stop offset="80%" stop-color="#991b1b"/>
      <stop offset="100%" stop-color="#691010"/>
    </radialGradient>

    <linearGradient id="bagFlap" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="50%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>

    <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>

    <!-- Drop Shadows / Glows -->
    <filter id="goldAuraGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.7"/>
    </filter>
  </defs>

  <!-- 1. Ambient Golden Halo Flare (Behind Button) -->
  <circle cx="80" cy="80" r="66" fill="url(#haloGlow)" filter="url(#goldAuraGlow)"/>

  <!-- 2. Arched Radiant Golden Halo Crown (Top Crescent Ring) -->
  <path d="M 32 88 A 54 54 0 0 1 128 88" fill="none" stroke="#f59e0b" stroke-width="7" opacity="0.45" stroke-linecap="round" filter="url(#goldAuraGlow)"/>
  <path d="M 36 84 A 50 50 0 0 1 124 84" fill="none" stroke="url(#goldHalo)" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M 46 72 A 46 46 0 0 1 114 72" fill="none" stroke="#fef08a" stroke-width="1.8" stroke-linecap="round" opacity="0.9"/>

  <!-- 3. Base Circle Button -->
  <circle cx="80" cy="80" r="50" fill="url(#bagBg)" stroke="url(#goldTrim)" stroke-width="2.5" filter="url(#softShadow)"/>

  <!-- Inner Subtle Rim -->
  <circle cx="80" cy="80" r="46" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.4"/>

  <!-- 4. RED LEATHER ADVENTURER'S BACKPACK (Centered) -->
  <g filter="url(#softShadow)">
    <ellipse cx="80" cy="116" rx="26" ry="6" fill="#000000" opacity="0.5"/>

    <!-- Side Pockets -->
    <ellipse cx="61" cy="98" rx="8" ry="14" fill="#991b1b" stroke="#581010" stroke-width="1.2"/>
    <ellipse cx="99" cy="98" rx="8" ry="14" fill="#991b1b" stroke="#581010" stroke-width="1.2"/>
    <rect x="58" y="94" width="6" height="10" rx="1.5" fill="url(#goldTrim)"/>
    <rect x="96" y="94" width="6" height="10" rx="1.5" fill="url(#goldTrim)"/>

    <!-- Main Backpack Body -->
    <path d="M 59 86 
             C 57 74, 66 66, 80 66 
             C 94 66, 103 74, 101 86 
             C 103 98, 102 114, 80 115 
             C 58 114, 57 98, 59 86 Z" 
          fill="url(#bagRed)" stroke="#450a0a" stroke-width="1.5"/>

    <!-- Seams -->
    <path d="M 64 88 Q 80 94 96 88" fill="none" stroke="#7f1d1d" stroke-width="2" opacity="0.6"/>
    <path d="M 66 102 Q 80 108 94 102" fill="none" stroke="#7f1d1d" stroke-width="2" opacity="0.6"/>

    <!-- Backpack Top Flap -->
    <path d="M 63 70 
             C 67 66, 73 64, 80 64 
             C 87 64, 93 66, 97 70 
             C 98 76, 96 85, 80 87 
             C 64 85, 62 76, 63 70 Z" 
          fill="url(#bagFlap)" stroke="url(#goldTrim)" stroke-width="1.5"/>

    <!-- Gold Stitched Seam on Flap Edge -->
    <path d="M 66 73 Q 80 77 94 73" fill="none" stroke="#fef08a" stroke-width="1.2" stroke-dasharray="2,2"/>

    <!-- Central Vertical Leather Strap -->
    <rect x="76.5" y="68" width="7" height="38" rx="2" fill="#7f1d1d" stroke="url(#goldTrim)" stroke-width="1.2"/>

    <!-- Golden Buckle / Clasp -->
    <rect x="74" y="86" width="12" height="12" rx="3" fill="url(#goldTrim)" stroke="#78350f" stroke-width="1.2"/>
    <rect x="77" y="89" width="6" height="6" rx="1" fill="#451a03"/>
    <circle cx="80" cy="92" r="1.8" fill="#fef08a"/>

    <!-- Golden Drawstring Bow / Loops at Top -->
    <path d="M 74 69 Q 70 63 75 62 Q 80 64 78 69" fill="none" stroke="url(#goldTrim)" stroke-width="2"/>
    <path d="M 86 69 Q 90 63 85 62 Q 80 64 82 69" fill="none" stroke="url(#goldTrim)" stroke-width="2"/>
    <circle cx="80" cy="67" r="3" fill="url(#goldTrim)"/>

    <!-- Top Handle / Carry Loop -->
    <path d="M 74 64 C 74 56, 86 56, 86 64" fill="none" stroke="#7f1d1d" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>
`;

// ==========================================
// 3. KỸ NĂNG (Crossed Swords)
// ==========================================
const skillsSvg = `
<svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="skBg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#0e2852"/>
      <stop offset="70%" stop-color="#061328"/>
      <stop offset="100%" stop-color="#020815"/>
    </radialGradient>

    <linearGradient id="skRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f2b66"/>
    </linearGradient>

    <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#e0f2fe"/>
      <stop offset="70%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>

    <linearGradient id="bladeEdge" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#7dd3fc"/>
    </linearGradient>

    <linearGradient id="skGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>

    <radialGradient id="skGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#0284c7" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0369a1" stop-opacity="0"/>
    </radialGradient>

    <filter id="skShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.75"/>
    </filter>
    <filter id="sparkleGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Base Circle Frame -->
  <circle cx="80" cy="80" r="54" fill="none" stroke="url(#skRim)" stroke-width="2" opacity="0.6"/>
  <circle cx="80" cy="80" r="51" fill="url(#skBg)" stroke="#1e3a6a" stroke-width="2.5"/>

  <!-- Subtle Inner Arc Highlight -->
  <path d="M 40 92 A 44 44 0 0 0 120 92" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.45" stroke-linecap="round"/>

  <!-- Energy Burst Center -->
  <circle cx="80" cy="80" r="32" fill="url(#skGlow)"/>

  <!-- SWORD 1: Top-Left to Bottom-Right (-45 deg) -->
  <g transform="rotate(-45 80 80)" filter="url(#skShadow)">
    <path d="M 77 80 L 77 42 L 80 34 L 80 80 Z" fill="url(#bladeEdge)"/>
    <path d="M 80 80 L 80 34 L 83 42 L 83 80 Z" fill="url(#bladeGrad)"/>
    <line x1="80" y1="36" x2="80" y2="80" stroke="#ffffff" stroke-width="1" opacity="0.9"/>

    <path d="M 68 83 C 74 80, 77 82, 80 84 C 83 82, 86 80, 92 83 C 94 85, 91 88, 80 87 C 69 88, 66 85, 68 83 Z" fill="url(#skGold)" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="80" cy="85" r="2.2" fill="#38bdf8" stroke="#ffffff" stroke-width="0.6"/>

    <rect x="78" y="87" width="4" height="18" rx="1" fill="#1e3a8a" stroke="url(#skGold)" stroke-width="0.8"/>
    <line x1="78" y1="91" x2="82" y2="93" stroke="url(#skGold)" stroke-width="0.8"/>
    <line x1="78" y1="96" x2="82" y2="98" stroke="url(#skGold)" stroke-width="0.8"/>
    <line x1="78" y1="101" x2="82" y2="103" stroke="url(#skGold)" stroke-width="0.8"/>

    <circle cx="80" cy="107" r="4" fill="url(#skGold)" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="80" cy="107" r="1.5" fill="#38bdf8"/>
  </g>

  <!-- SWORD 2: Top-Right to Bottom-Left (+45 deg) -->
  <g transform="rotate(45 80 80)" filter="url(#skShadow)">
    <path d="M 77 80 L 77 42 L 80 34 L 80 80 Z" fill="url(#bladeEdge)"/>
    <path d="M 80 80 L 80 34 L 83 42 L 83 80 Z" fill="url(#bladeGrad)"/>
    <line x1="80" y1="36" x2="80" y2="80" stroke="#ffffff" stroke-width="1" opacity="0.9"/>

    <path d="M 68 83 C 74 80, 77 82, 80 84 C 83 82, 86 80, 92 83 C 94 85, 91 88, 80 87 C 69 88, 66 85, 68 83 Z" fill="url(#skGold)" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="80" cy="85" r="2.2" fill="#38bdf8" stroke="#ffffff" stroke-width="0.6"/>

    <rect x="78" y="87" width="4" height="18" rx="1" fill="#1e3a8a" stroke="url(#skGold)" stroke-width="0.8"/>
    <line x1="78" y1="91" x2="82" y2="93" stroke="url(#skGold)" stroke-width="0.8"/>
    <line x1="78" y1="96" x2="82" y2="98" stroke="url(#skGold)" stroke-width="0.8"/>
    <line x1="78" y1="101" x2="82" y2="103" stroke="url(#skGold)" stroke-width="0.8"/>

    <circle cx="80" cy="107" r="4" fill="url(#skGold)" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="80" cy="107" r="1.5" fill="#38bdf8"/>
  </g>

  <!-- Central Clash Radiant Star Sparkle -->
  <g filter="url(#sparkleGlow)">
    <polygon points="80,68 83,77 92,80 83,83 80,92 77,83 68,80 77,77" fill="#ffffff"/>
    <circle cx="80" cy="80" r="3" fill="#67e8f9"/>
    <circle cx="80" cy="80" r="1.5" fill="#ffffff"/>
  </g>
</svg>
`;

// ==========================================
// 4. NHIỆM VỤ (Quest Star & Crossed Scrolls)
// ==========================================
const questSvg = `
<svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="qstBg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#0e2852"/>
      <stop offset="70%" stop-color="#061328"/>
      <stop offset="100%" stop-color="#020815"/>
    </radialGradient>

    <linearGradient id="qstRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f2b66"/>
    </linearGradient>

    <radialGradient id="qstAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.8"/>
      <stop offset="55%" stop-color="#d97706" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#b45309" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>

    <linearGradient id="goldMid" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>

    <linearGradient id="goldDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="60%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>

    <linearGradient id="batonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>

    <filter id="qstShadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.75"/>
    </filter>
    <filter id="starGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Base Circle Frame -->
  <circle cx="80" cy="80" r="54" fill="none" stroke="url(#qstRim)" stroke-width="2" opacity="0.6"/>
  <circle cx="80" cy="80" r="51" fill="url(#qstBg)" stroke="#1e3a6a" stroke-width="2.5"/>

  <!-- Subtle Inner Arc Highlight -->
  <path d="M 40 92 A 44 44 0 0 0 120 92" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.45" stroke-linecap="round"/>

  <!-- Golden Aura Behind Star -->
  <circle cx="80" cy="80" r="36" fill="url(#qstAura)"/>

  <!-- Crossed Golden Batons behind the Star -->
  <g filter="url(#qstShadow)">
    <g transform="rotate(-35 80 80)">
      <rect x="77.5" y="44" width="5" height="72" rx="2.5" fill="url(#batonGrad)" stroke="#78350f" stroke-width="0.8"/>
      <circle cx="80" cy="44" r="4.5" fill="url(#goldLight)" stroke="#78350f" stroke-width="0.8"/>
      <circle cx="80" cy="116" r="4.5" fill="url(#goldLight)" stroke="#78350f" stroke-width="0.8"/>
      <circle cx="80" cy="44" r="2" fill="#38bdf8"/>
    </g>

    <g transform="rotate(35 80 80)">
      <rect x="77.5" y="44" width="5" height="72" rx="2.5" fill="url(#batonGrad)" stroke="#78350f" stroke-width="0.8"/>
      <circle cx="80" cy="44" r="4.5" fill="url(#goldLight)" stroke="#78350f" stroke-width="0.8"/>
      <circle cx="80" cy="116" r="4.5" fill="url(#goldLight)" stroke="#78350f" stroke-width="0.8"/>
      <circle cx="80" cy="44" r="2" fill="#38bdf8"/>
    </g>
  </g>

  <!-- 4-POINTED FACETED 3D GOLDEN COMPASS STAR -->
  <g filter="url(#qstShadow)">
    <polygon points="80,80 80,50 88,72" fill="url(#goldLight)"/>
    <polygon points="80,80 80,50 72,72" fill="url(#goldDark)"/>

    <polygon points="80,80 80,110 72,88" fill="url(#goldMid)"/>
    <polygon points="80,80 80,110 88,88" fill="url(#goldDark)"/>

    <polygon points="80,80 110,80 88,72" fill="url(#goldLight)"/>
    <polygon points="80,80 110,80 88,88" fill="url(#goldDark)"/>

    <polygon points="80,80 50,80 72,88" fill="url(#goldMid)"/>
    <polygon points="80,80 50,80 72,72" fill="url(#goldDark)"/>

    <!-- Corner Points -->
    <polygon points="80,80 98,62 88,72" fill="url(#goldLight)"/>
    <polygon points="80,80 98,62 88,80" fill="url(#goldMid)"/>
    <polygon points="80,80 98,98 88,88" fill="url(#goldMid)"/>
    <polygon points="80,80 98,98 80,88" fill="url(#goldDark)"/>
    <polygon points="80,80 62,98 72,88" fill="url(#goldDark)"/>
    <polygon points="80,80 62,98 72,80" fill="url(#goldMid)"/>
    <polygon points="80,80 62,62 72,72" fill="url(#goldMid)"/>
    <polygon points="80,80 62,62 80,72" fill="url(#goldLight)"/>

    <polygon points="80,72 88,80 80,88 72,80" fill="url(#goldLight)" stroke="#78350f" stroke-width="1"/>
    <circle cx="80" cy="80" r="4" fill="#ffffff" filter="url(#starGlow)"/>
    <circle cx="80" cy="80" r="2.5" fill="#fef08a"/>
  </g>
</svg>
`;

// ==========================================
// 5. CÀI ĐẶT (Settings Chrome Gear)
// ==========================================
const settingsSvg = `
<svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="setBg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#0e2852"/>
      <stop offset="70%" stop-color="#061328"/>
      <stop offset="100%" stop-color="#020815"/>
    </radialGradient>

    <linearGradient id="setRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f2b66"/>
    </linearGradient>

    <linearGradient id="gearFace" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#e2e8f0"/>
      <stop offset="50%" stop-color="#94a3b8"/>
      <stop offset="75%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>

    <linearGradient id="gearBevel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>

    <radialGradient id="gearDepth" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="70%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </radialGradient>

    <linearGradient id="innerRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>

    <filter id="gearShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.75"/>
    </filter>
  </defs>

  <!-- Base Circle Frame -->
  <circle cx="80" cy="80" r="54" fill="none" stroke="url(#setRim)" stroke-width="2" opacity="0.6"/>
  <circle cx="80" cy="80" r="51" fill="url(#setBg)" stroke="#1e3a6a" stroke-width="2.5"/>

  <!-- Subtle Inner Arc Highlight -->
  <path d="M 40 92 A 44 44 0 0 0 120 92" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.45" stroke-linecap="round"/>

  <!-- MECHANICAL 8-TOOTHED CHROME GEAR -->
  <g filter="url(#gearShadow)">
    <g fill="url(#gearFace)" stroke="#1e293b" stroke-width="1.2">
      <path d="M 74 48 L 75 56 L 85 56 L 86 48 Z"/>
      <path d="M 74 48 L 75 56 L 85 56 L 86 48 Z" transform="rotate(45 80 80)"/>
      <path d="M 74 48 L 75 56 L 85 56 L 86 48 Z" transform="rotate(90 80 80)"/>
      <path d="M 74 48 L 75 56 L 85 56 L 86 48 Z" transform="rotate(135 80 80)"/>
      <path d="M 74 48 L 75 56 L 85 56 L 86 48 Z" transform="rotate(180 80 80)"/>
      <path d="M 74 48 L 75 56 L 85 56 L 86 48 Z" transform="rotate(225 80 80)"/>
      <path d="M 74 48 L 75 56 L 85 56 L 86 48 Z" transform="rotate(270 80 80)"/>
      <path d="M 74 48 L 75 56 L 85 56 L 86 48 Z" transform="rotate(315 80 80)"/>
    </g>

    <circle cx="80" cy="80" r="26" fill="url(#gearFace)" stroke="#1e293b" stroke-width="1.5"/>
    <circle cx="80" cy="80" r="22" fill="none" stroke="url(#innerRim)" stroke-width="2"/>
    <circle cx="80" cy="80" r="17" fill="url(#gearDepth)" stroke="#0f172a" stroke-width="1.5"/>
    <circle cx="80" cy="80" r="11" fill="url(#gearBevel)" stroke="#334155" stroke-width="1"/>
    <circle cx="80" cy="80" r="6.5" fill="#020617" stroke="#475569" stroke-width="1"/>
    <path d="M 64 68 A 20 20 0 0 1 96 68" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>
  </g>
</svg>
`;

async function render() {
  const icons = [
    { name: 'nav_avatar_btn.png', svg: avatarSvg },
    { name: 'nav_bag_btn.png', svg: bagSvg },
    { name: 'nav_skills_btn.png', svg: skillsSvg },
    { name: 'nav_quest_btn.png', svg: questSvg },
    { name: 'nav_settings_btn.png', svg: settingsSvg }
  ];

  for (const icon of icons) {
    const dest = path.join(outDir, icon.name);
    await sharp(Buffer.from(icon.svg))
      .resize(160, 160)
      .png()
      .toFile(dest);
    console.log('Successfully rendered:', icon.name);
  }
}

render().catch(console.error);
