const sharp = require('sharp');
const fs = require('fs');

async function createIcon(name, svg) {
  const buf = await sharp(Buffer.from(svg)).webp({ quality: 90 }).toBuffer();
  fs.writeFileSync('assets/items/' + name + '.webp', buf);
  console.log('Created assets/items/' + name + '.webp');
}

// 1. Áo Giáp (item_armor)
const armorSvg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="70%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="plate" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#67e8f9"/>
      <stop offset="50%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="16" fill="url(#bg)" stroke="url(#gold)" stroke-width="4"/>
  <path d="M24,42 Q40,30 64,36 Q88,30 104,42 Q108,58 98,68 Q90,54 64,54 Q38,54 30,68 Q20,58 24,42 Z" fill="url(#gold)"/>
  <path d="M38,50 L90,50 L84,94 L64,106 L44,94 Z" fill="url(#plate)" stroke="url(#gold)" stroke-width="2.5"/>
  <polygon points="64,62 73,72 64,82 55,72" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
  <line x1="64" y1="36" x2="64" y2="50" stroke="url(#gold)" stroke-width="2"/>
  <path d="M48,60 L56,76 L48,88" stroke="url(#gold)" stroke-width="2" fill="none"/>
  <path d="M80,60 L72,76 L80,88" stroke="url(#gold)" stroke-width="2" fill="none"/>
</svg>`;

// 2. Mũ Quan (item_helmet)
const helmetSvg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="hbg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#581c87"/>
      <stop offset="70%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="hgold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="16" fill="url(#hbg)" stroke="url(#hgold)" stroke-width="4"/>
  <path d="M34,80 C34,42 94,42 94,80 C94,92 84,98 64,98 C44,98 34,92 34,80 Z" fill="#7c3aed" stroke="url(#hgold)" stroke-width="2.5"/>
  <path d="M22,58 Q34,46 44,52 Q40,66 30,76 Z" fill="url(#hgold)"/>
  <path d="M106,58 Q94,46 84,52 Q88,66 98,76 Z" fill="url(#hgold)"/>
  <path d="M58,40 Q64,20 70,40 Q64,36 58,40 Z" fill="url(#hgold)"/>
  <circle cx="64" cy="46" r="6" fill="#a855f7" stroke="#fef08a" stroke-width="2"/>
  <circle cx="64" cy="72" r="8" fill="#c084fc" stroke="#fef08a" stroke-width="2"/>
  <path d="M42,86 Q64,92 86,86" stroke="url(#hgold)" stroke-width="3" fill="none"/>
</svg>`;

// 3. Giày Hài (item_boots)
const bootsSvg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bbg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#065f46"/>
      <stop offset="70%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="bgold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="16" fill="url(#bbg)" stroke="url(#bgold)" stroke-width="4"/>
  <path d="M36,36 L52,36 L52,72 L66,80 L66,94 L32,94 L32,74 L36,70 Z" fill="#059669" stroke="url(#bgold)" stroke-width="2.5"/>
  <path d="M62,32 L78,32 L78,68 L96,76 L96,90 L58,90 L58,70 L62,66 Z" fill="#10b981" stroke="url(#bgold)" stroke-width="2.5"/>
  <path d="M78,44 Q92,40 86,54 Z" fill="url(#bgold)"/>
  <path d="M52,48 Q66,44 60,58 Z" fill="url(#bgold)"/>
  <rect x="32" y="92" width="34" height="5" rx="2" fill="url(#bgold)"/>
  <rect x="58" y="88" width="38" height="5" rx="2" fill="url(#bgold)"/>
</svg>`;

// 4. Nhẫn Giới Chỉ (item_ring)
const ringSvg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="rbg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#831843"/>
      <stop offset="70%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="rgold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="16" fill="url(#rbg)" stroke="url(#rgold)" stroke-width="4"/>
  <ellipse cx="64" cy="74" rx="34" ry="22" fill="none" stroke="url(#rgold)" stroke-width="9"/>
  <ellipse cx="64" cy="74" rx="34" ry="22" fill="none" stroke="#451a03" stroke-width="2"/>
  <polygon points="64,30 82,46 64,58 46,46" fill="#f43f5e" stroke="#ffffff" stroke-width="2"/>
  <polygon points="64,34 76,46 64,54 52,46" fill="#fb7185"/>
  <circle cx="46" cy="46" r="3.5" fill="url(#rgold)"/>
  <circle cx="82" cy="46" r="3.5" fill="url(#rgold)"/>
  <circle cx="64" cy="30" r="3.5" fill="url(#rgold)"/>
  <circle cx="64" cy="58" r="3.5" fill="url(#rgold)"/>
</svg>`;

// 5. Ngọc Bội (item_amulet)
const amuletSvg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="abg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#047857"/>
      <stop offset="70%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <radialGradient id="jade" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#6ee7b7"/>
      <stop offset="40%" stop-color="#10b981"/>
      <stop offset="80%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </radialGradient>
    <linearGradient id="agold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="16" fill="url(#abg)" stroke="url(#agold)" stroke-width="4"/>
  <path d="M64,18 L64,36" stroke="#ef4444" stroke-width="3.5"/>
  <circle cx="64" cy="38" r="5" fill="#dc2626" stroke="url(#agold)" stroke-width="1.5"/>
  <circle cx="64" cy="66" r="26" fill="url(#jade)" stroke="url(#agold)" stroke-width="3"/>
  <circle cx="64" cy="66" r="9" fill="#047857" stroke="url(#agold)" stroke-width="2"/>
  <path d="M48,46 Q64,54 80,46" stroke="url(#agold)" stroke-width="3" fill="none"/>
  <path d="M60,92 L56,112 M64,94 L64,116 M68,92 L72,112" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

// 6. Đá Cường Hóa (item_enhance_stone)
const stoneSvg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="sbg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#701a75"/>
      <stop offset="70%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="sgold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="16" fill="url(#sbg)" stroke="url(#sgold)" stroke-width="4"/>
  <polygon points="64,22 84,60 64,106 44,60" fill="#d946ef" stroke="#fdf4ff" stroke-width="2"/>
  <polygon points="64,22 84,60 64,106" fill="#c026d3"/>
  <polygon points="76,46 102,68 86,94 68,82" fill="#e879f9" stroke="#fdf4ff" stroke-width="1.5"/>
  <polygon points="52,46 26,68 42,94 60,82" fill="#a21caf" stroke="#fdf4ff" stroke-width="1.5"/>
  <polygon points="64,14 66,20 72,22 66,24 64,30 62,24 56,22 62,20" fill="#ffffff"/>
  <circle cx="96" cy="40" r="2.5" fill="#ffffff"/>
  <circle cx="32" cy="44" r="2.5" fill="#ffffff"/>
</svg>`;

(async () => {
  await createIcon('item_armor', armorSvg);
  await createIcon('item_helmet', helmetSvg);
  await createIcon('item_boots', bootsSvg);
  await createIcon('item_ring', ringSvg);
  await createIcon('item_amulet', amuletSvg);
  await createIcon('item_enhance_stone', stoneSvg);
  console.log('All icons generated successfully!');
})();
