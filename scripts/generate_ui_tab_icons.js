const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, '../assets/ui');

// 1. NAV MENU BUTTON (160x160) - Replacing Quest button on bottom nav
const navMenuSvg = `
<svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="menuBg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#0e2852"/>
      <stop offset="70%" stop-color="#061328"/>
      <stop offset="100%" stop-color="#020815"/>
    </radialGradient>
    <linearGradient id="menuRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f2b66"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fef08a"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <radialGradient id="gemGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#a7f3d0"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#047857"/>
    </radialGradient>
    <filter id="menuShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Frame Circle -->
  <circle cx="80" cy="80" r="54" fill="none" stroke="url(#menuRim)" stroke-width="2" opacity="0.6"/>
  <circle cx="80" cy="80" r="51" fill="url(#menuBg)" stroke="#1e3a6a" stroke-width="2.5"/>
  <path d="M 40 92 A 44 44 0 0 0 120 92" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.45" stroke-linecap="round"/>

  <!-- Ornate Golden 4-Tile / Grid Menu Emblem -->
  <g filter="url(#menuShadow)">
    <!-- 4 Rounded Diamond Tiles in Cross Formation -->
    <!-- Top Tile -->
    <rect x="73" y="47" width="14" height="14" rx="3" fill="url(#goldGrad)" stroke="#78350f" stroke-width="1" transform="rotate(45 80 54)"/>
    <!-- Bottom Tile -->
    <rect x="73" y="93" width="14" height="14" rx="3" fill="url(#goldGrad)" stroke="#78350f" stroke-width="1" transform="rotate(45 80 100)"/>
    <!-- Left Tile -->
    <rect x="50" y="70" width="14" height="14" rx="3" fill="url(#goldGrad)" stroke="#78350f" stroke-width="1" transform="rotate(45 57 77)"/>
    <!-- Right Tile -->
    <rect x="96" y="70" width="14" height="14" rx="3" fill="url(#goldGrad)" stroke="#78350f" stroke-width="1" transform="rotate(45 103 77)"/>

    <!-- Connecting Golden Rings / Filigree -->
    <circle cx="80" cy="80" r="24" fill="none" stroke="url(#goldGrad)" stroke-width="2" stroke-dasharray="8,4"/>

    <!-- Central Golden Medallion -->
    <circle cx="80" cy="80" r="16" fill="url(#goldGrad)" stroke="#78350f" stroke-width="1.5"/>
    <circle cx="80" cy="80" r="12" fill="#020815"/>
    <!-- Central Emerald Jewel -->
    <circle cx="80" cy="80" r="8" fill="url(#gemGrad)" stroke="#ffffff" stroke-width="1"/>
    <circle cx="78" cy="78" r="2.5" fill="#ffffff" opacity="0.8"/>
  </g>
</svg>
`;

// Helper for 96x96 menu icons
function createIconSvg(content) {
  return `
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="iconBg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#142c54"/>
      <stop offset="80%" stop-color="#08152e"/>
      <stop offset="100%" stop-color="#020817"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="b"/>
      <feComposite in="SourceGraphic" in2="b" operator="over"/>
    </filter>
  </defs>
  <rect x="4" y="4" width="88" height="88" rx="16" fill="url(#iconBg)" stroke="url(#gold)" stroke-width="2"/>
  <rect x="8" y="8" width="80" height="80" rx="12" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.4"/>
  ${content}
</svg>`;
}

// 2. Menu Feature Icons
const menuIcons = {
  // Quests (Scroll & Quill)
  'menu_quest_icon.png': createIconSvg(`
    <g filter="url(#glow)">
      <!-- Scroll parchment -->
      <path d="M 28 32 C 28 26, 68 26, 68 32 L 68 64 C 68 70, 28 70, 28 64 Z" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
      <path d="M 24 30 C 24 24, 32 24, 32 30 L 32 64 C 32 70, 24 70, 24 64 Z" fill="#fde68a" stroke="#b45309" stroke-width="1.5"/>
      <line x1="36" y1="38" x2="60" y2="38" stroke="#b45309" stroke-width="2" stroke-linecap="round"/>
      <line x1="36" y1="46" x2="56" y2="46" stroke="#b45309" stroke-width="2" stroke-linecap="round"/>
      <line x1="36" y1="54" x2="48" y2="54" stroke="#b45309" stroke-width="2" stroke-linecap="round"/>
      <!-- Golden Wax Seal -->
      <circle cx="62" cy="58" r="8" fill="#dc2626" stroke="#fef08a" stroke-width="1.5"/>
      <circle cx="62" cy="58" r="4" fill="#991b1b"/>
      <!-- Golden Star Accent -->
      <polygon points="48,18 51,24 57,25 52,29 54,35 48,31 42,35 44,29 39,25 45,24" fill="url(#gold)"/>
    </g>
  `),

  // Dungeons (Ancient Stone Gate with glowing portal)
  'menu_dungeon_icon.png': createIconSvg(`
    <g filter="url(#glow)">
      <!-- Dungeon Pillars -->
      <rect x="22" y="28" width="12" height="46" rx="2" fill="url(#silver)" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="62" y="28" width="12" height="46" rx="2" fill="url(#silver)" stroke="#1e293b" stroke-width="1.5"/>
      <!-- Gate Arch -->
      <path d="M 20 28 Q 48 16 76 28 L 76 34 Q 48 24 20 34 Z" fill="url(#gold)" stroke="#78350f" stroke-width="1.5"/>
      <!-- Glowing Portal Vortex -->
      <ellipse cx="48" cy="50" rx="14" ry="20" fill="#a855f7" stroke="#c084fc" stroke-width="2"/>
      <ellipse cx="48" cy="50" rx="8" ry="12" fill="#38bdf8"/>
      <circle cx="48" cy="50" r="3" fill="#ffffff"/>
      <!-- Base Stone Steps -->
      <rect x="18" y="72" width="60" height="8" rx="2" fill="url(#silver)" stroke="#1e293b" stroke-width="1.5"/>
    </g>
  `),

  // Ranking / Leaderboard (Golden Trophy / Crown)
  'menu_rank_icon.png': createIconSvg(`
    <g filter="url(#glow)">
      <!-- Golden Trophy Cup -->
      <path d="M 30 26 L 66 26 L 62 48 Q 48 60 48 64 L 48 70 L 36 70 L 36 74 L 60 74 L 60 70 L 48 70" fill="url(#gold)" stroke="#78350f" stroke-width="1.5"/>
      <!-- Trophy Handles -->
      <path d="M 30 30 C 20 32, 20 46, 32 46" fill="none" stroke="url(#gold)" stroke-width="3" stroke-linecap="round"/>
      <path d="M 66 30 C 76 32, 76 46, 64 46" fill="none" stroke="url(#gold)" stroke-width="3" stroke-linecap="round"/>
      <!-- Pedestal -->
      <rect x="32" y="72" width="32" height="8" rx="2" fill="#78350f" stroke="url(#gold)" stroke-width="1.5"/>
      <!-- #1 Emblem on Cup -->
      <circle cx="48" cy="38" r="7" fill="#dc2626" stroke="#fef08a" stroke-width="1"/>
      <text x="48" y="42" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">1</text>
    </g>
  `),

  // Mail / Inbox (Golden Winged Envelope)
  'menu_mail_icon.png': createIconSvg(`
    <g filter="url(#glow)">
      <!-- Left Wing -->
      <path d="M 28 42 C 16 34, 18 24, 28 26 C 20 34, 24 44, 34 46 Z" fill="#93c5fd" opacity="0.8"/>
      <!-- Right Wing -->
      <path d="M 68 42 C 80 34, 78 24, 68 26 C 76 34, 72 44, 62 46 Z" fill="#93c5fd" opacity="0.8"/>
      <!-- Envelope Body -->
      <rect x="22" y="34" width="52" height="34" rx="4" fill="#f8fafc" stroke="#1e293b" stroke-width="1.5"/>
      <!-- Flap Lines -->
      <polygon points="22,34 48,54 74,34" fill="#e2e8f0" stroke="#1e293b" stroke-width="1.5"/>
      <line x1="22" y1="68" x2="42" y2="48" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="74" y1="68" x2="54" y2="48" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- Red Notification Badge / Heart Stamp -->
      <circle cx="48" cy="50" r="6" fill="#ef4444" stroke="#ffffff" stroke-width="1.2"/>
      <circle cx="48" cy="50" r="2.5" fill="#fef08a"/>
    </g>
  `),

  // Achievements (Gold Star Medal)
  'menu_achievement_icon.png': createIconSvg(`
    <g filter="url(#glow)">
      <!-- Ribbons -->
      <polygon points="40,46 32,74 44,66 48,74 48,50" fill="#2563eb" stroke="#1d4ed8" stroke-width="1"/>
      <polygon points="56,46 64,74 52,66 48,74 48,50" fill="#dc2626" stroke="#b91c1c" stroke-width="1"/>
      <!-- Gold Medal Outer Rim -->
      <circle cx="48" cy="40" r="20" fill="url(#gold)" stroke="#78350f" stroke-width="2"/>
      <!-- Inner Blue Ring -->
      <circle cx="48" cy="40" r="15" fill="#1e3a8a"/>
      <!-- Central Star -->
      <polygon points="48,28 51,36 59,37 53,42 55,50 48,46 41,50 43,42 37,37 45,36" fill="url(#gold)"/>
    </g>
  `),

  // Daily Check-in (Calendar with Gold Coin)
  'menu_daily_icon.png': createIconSvg(`
    <g filter="url(#glow)">
      <!-- Calendar Back -->
      <rect x="22" y="24" width="52" height="50" rx="6" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>
      <!-- Calendar Header -->
      <path d="M 22 28 C 22 24, 26 24, 26 24 L 70 24 C 70 24, 74 24, 74 28 L 74 38 L 22 38 Z" fill="#ef4444"/>
      <!-- Binder Rings -->
      <rect x="32" y="20" width="4" height="8" rx="2" fill="url(#silver)" stroke="#0f172a" stroke-width="1"/>
      <rect x="60" y="20" width="4" height="8" rx="2" fill="url(#silver)" stroke="#0f172a" stroke-width="1"/>
      <!-- Calendar Grid / Checkmark -->
      <path d="M 32 54 L 42 64 L 64 44" fill="none" stroke="#10b981" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Sparkling Gold Coin on top -->
      <circle cx="64" cy="62" r="10" fill="url(#gold)" stroke="#78350f" stroke-width="1.5"/>
      <text x="64" y="66" font-size="11" font-weight="900" fill="#78350f" text-anchor="middle">★</text>
    </g>
  `),

  // Giftcode (Present / Treasure Gift Box)
  'menu_giftcode_icon.png': createIconSvg(`
    <g filter="url(#glow)">
      <!-- Box Body -->
      <rect x="24" y="40" width="48" height="34" rx="3" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.5"/>
      <!-- Box Lid -->
      <rect x="20" y="32" width="56" height="12" rx="2" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.5"/>
      <!-- Golden Ribbon Wrap -->
      <rect x="44" y="32" width="8" height="42" fill="url(#gold)"/>
      <!-- Golden Ribbon Bow -->
      <path d="M 48 32 C 38 22, 34 26, 46 30 Z" fill="url(#gold)" stroke="#78350f" stroke-width="1"/>
      <path d="M 48 32 C 58 22, 62 26, 50 30 Z" fill="url(#gold)" stroke="#78350f" stroke-width="1"/>
      <circle cx="48" cy="32" r="3.5" fill="url(#gold)"/>
      <!-- Sparkles -->
      <polygon points="28,24 30,28 34,29 31,32 32,36 28,34 24,36 25,32 22,29 26,28" fill="#fef08a"/>
    </g>
  `),

  // Guide / Help (Enchanted Book of Wisdom)
  'menu_guide_icon.png': createIconSvg(`
    <g filter="url(#glow)">
      <!-- Open Book -->
      <path d="M 48 32 C 34 28, 20 30, 18 32 L 18 68 C 20 66, 34 64, 48 68 C 62 64, 76 66, 78 68 L 78 32 C 76 30, 62 28, 48 32 Z" fill="#3b82f6" stroke="#1e3a8a" stroke-width="2"/>
      <!-- Book Pages -->
      <path d="M 48 34 C 36 30, 24 32, 22 34 L 22 66 C 24 64, 36 62, 48 66 Z" fill="#f8fafc"/>
      <path d="M 48 34 C 60 30, 72 32, 74 34 L 74 66 C 72 64, 60 62, 48 66 Z" fill="#f1f5f9"/>
      <!-- Text lines -->
      <line x1="26" y1="42" x2="44" y2="40" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="26" y1="48" x2="44" y2="46" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="26" y1="54" x2="40" y2="52" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="52" y1="40" x2="70" y2="42" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="52" y1="46" x2="70" y2="48" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- Magic Bookmark ribbon -->
      <path d="M 48 32 L 48 72 L 52 68 L 56 72 L 56 34" fill="#ef4444"/>
    </g>
  `)
};

// 3. Stat Icons for Character Tab (64x64)
const statIcons = {
  'stat_hp.png': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="hpRed" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="50%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </radialGradient>
    <filter id="hpGlow">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#ef4444" flood-opacity="0.6"/>
    </filter>
  </defs>
  <path d="M 32 54 C 20 42, 10 32, 10 22 C 10 14, 16 8, 24 8 C 28 8, 31 10, 32 14 C 33 10, 36 8, 40 8 C 48 8, 54 14, 54 22 C 54 32, 44 42, 32 54 Z" fill="url(#hpRed)" stroke="#ffffff" stroke-width="2" filter="url(#hpGlow)"/>
</svg>
`,
  'stat_mp.png': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mpBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#38bdf8"/>
      <stop offset="70%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
    <filter id="mpGlow">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0284c7" flood-opacity="0.8"/>
    </filter>
  </defs>
  <!-- Mana Crystal -->
  <polygon points="32,8 52,24 44,54 32,60 20,54 12,24" fill="url(#mpBlue)" stroke="#e0f2fe" stroke-width="2" filter="url(#mpGlow)"/>
  <polygon points="32,8 44,54 32,60 20,54" fill="#38bdf8" opacity="0.6"/>
</svg>
`,
  'stat_atk.png': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="atkBlade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <!-- Crossed Swords -->
  <g transform="rotate(-45 32 32)">
    <rect x="30" y="8" width="4" height="42" fill="url(#atkBlade)" stroke="#78350f" stroke-width="1"/>
    <rect x="24" y="44" width="16" height="4" rx="1" fill="#f59e0b" stroke="#78350f" stroke-width="1"/>
    <circle cx="32" cy="53" r="3" fill="#f59e0b"/>
  </g>
  <g transform="rotate(45 32 32)">
    <rect x="30" y="8" width="4" height="42" fill="url(#atkBlade)" stroke="#78350f" stroke-width="1"/>
    <rect x="24" y="44" width="16" height="4" rx="1" fill="#f59e0b" stroke="#78350f" stroke-width="1"/>
    <circle cx="32" cy="53" r="3" fill="#f59e0b"/>
  </g>
</svg>
`,
  'stat_def.png': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="defShield" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="50%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
    <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <!-- Shield Body -->
  <path d="M 14 14 L 50 14 C 50 36, 44 48, 32 58 C 20 48, 14 36, 14 14 Z" fill="url(#defShield)" stroke="url(#goldRim)" stroke-width="3"/>
  <path d="M 22 20 L 42 20 C 42 34, 38 42, 32 50 C 26 42, 22 34, 22 20 Z" fill="#1e40af" opacity="0.6"/>
  <polygon points="32,24 38,34 32,44 26,34" fill="url(#goldRim)"/>
</svg>
`,
  'stat_crit.png': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="critBolt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
  </defs>
  <!-- Lightning Bolt -->
  <polygon points="36,6 16,34 30,34 26,58 48,26 34,26" fill="url(#critBolt)" stroke="#78350f" stroke-width="2"/>
</svg>
`,
  'stat_speed.png': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="speedWing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>
  <!-- Wing Feather -->
  <path d="M 12 44 C 20 40, 28 34, 48 14 C 44 26, 40 32, 54 28 C 48 38, 42 42, 52 42 C 40 48, 32 50, 12 44 Z" fill="url(#speedWing)" stroke="#ffffff" stroke-width="1.8"/>
</svg>
`
};

async function renderAll() {
  // Render nav menu button
  await sharp(Buffer.from(navMenuSvg))
    .resize(160, 160)
    .png()
    .toFile(path.join(outDir, 'nav_menu_btn.png'));
  console.log('Rendered nav_menu_btn.png');

  // Render menu feature icons
  for (const [filename, svg] of Object.entries(menuIcons)) {
    await sharp(Buffer.from(svg))
      .resize(96, 96)
      .png()
      .toFile(path.join(outDir, filename));
    console.log('Rendered menu icon:', filename);
  }

  // Render stat icons
  for (const [filename, svg] of Object.entries(statIcons)) {
    await sharp(Buffer.from(svg))
      .resize(64, 64)
      .png()
      .toFile(path.join(outDir, filename));
    console.log('Rendered stat icon:', filename);
  }
}

renderAll().catch(console.error);
