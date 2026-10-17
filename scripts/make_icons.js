const fs = require('fs');
const sharp = require('sharp');

// 1. Settings Icon SVG (Bát Quái Kim Luân Cài Đặt)
const settingsSvg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="goldBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="70%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
    <radialGradient id="jadeGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#a7f3d0"/>
      <stop offset="40%" stop-color="#10b981"/>
      <stop offset="80%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <circle cx="64" cy="64" r="60" fill="url(#goldBg)" stroke="url(#goldGrad)" stroke-width="4"/>
  <circle cx="64" cy="64" r="53" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="6 4"/>
  <g stroke="url(#goldGrad)" stroke-width="4" stroke-linecap="round" opacity="0.9">
    <line x1="64" y1="10" x2="64" y2="22"/>
    <line x1="64" y1="106" x2="64" y2="118"/>
    <line x1="10" y1="64" x2="22" y2="64"/>
    <line x1="106" y1="64" x2="118" y2="64"/>
    <line x1="26" y1="26" x2="34" y2="34"/>
    <line x1="94" y1="94" x2="102" y2="102"/>
    <line x1="26" y1="102" x2="34" y2="94"/>
    <line x1="94" y1="34" x2="102" y2="26"/>
  </g>
  <polygon points="64,20 95,33 108,64 95,95 64,108 33,95 20,64 33,33" fill="none" stroke="url(#goldGrad)" stroke-width="2.5"/>
  <circle cx="64" cy="64" r="26" fill="url(#jadeGrad)" stroke="url(#goldGrad)" stroke-width="3" filter="url(#glow)"/>
  <path d="M64,38 A13,13 0 0,1 64,64 A13,13 0 0,0 64,90 A26,26 0 0,1 64,38" fill="#f8fafc"/>
  <path d="M64,38 A13,13 0 0,1 64,64 A13,13 0 0,0 64,90 A26,26 0 0,0 64,38" fill="#0f172a"/>
  <circle cx="64" cy="51" r="3.5" fill="#0f172a"/>
  <circle cx="64" cy="77" r="3.5" fill="#f8fafc"/>
  <circle cx="64" cy="6" r="2" fill="#34d399"/>
  <circle cx="64" cy="122" r="2" fill="#34d399"/>
  <circle cx="6" cy="64" r="2" fill="#34d399"/>
  <circle cx="122" cy="64" r="2" fill="#34d399"/>
</svg>`;

// 2. Bag Icon SVG (Túi Càn Khôn Đính Kim Ngọc)
const bagSvg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bagBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4c1d95"/>
      <stop offset="65%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#09090b"/>
    </radialGradient>
    <linearGradient id="bagCloth" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="25%" stop-color="#d97706"/>
      <stop offset="70%" stop-color="#92400e"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#f59e0b"/>
      <stop offset="80%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
    <radialGradient id="rubyGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fca5a5"/>
      <stop offset="40%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </radialGradient>
    <radialGradient id="cyanStone" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#a5f3fc"/>
      <stop offset="40%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#083344"/>
    </radialGradient>
  </defs>
  <circle cx="64" cy="64" r="60" fill="url(#bagBg)" stroke="url(#goldRim)" stroke-width="4"/>
  <circle cx="64" cy="64" r="53" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.7"/>
  <path d="M38,56 C38,44 48,34 64,34 C80,34 90,44 90,56 C90,58 98,68 100,86 C102,102 88,110 64,110 C40,110 26,102 28,86 C30,68 38,58 38,56 Z" fill="url(#bagCloth)" stroke="url(#goldRim)" stroke-width="2.5"/>
  <path d="M42,50 C46,38 52,36 64,36 C76,36 82,38 86,50 C78,54 72,52 64,52 C56,52 50,54 42,50 Z" fill="#fef08a" stroke="#b45309" stroke-width="2"/>
  <ellipse cx="64" cy="52" rx="16" ry="5" fill="none" stroke="#fde047" stroke-width="3.5"/>
  <circle cx="64" cy="52" r="7" fill="url(#rubyGrad)" stroke="url(#goldRim)" stroke-width="2"/>
  <path d="M58,54 C54,64 50,74 48,84" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>
  <path d="M70,54 C74,64 78,74 80,84" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>
  <circle cx="64" cy="82" r="16" fill="none" stroke="url(#goldRim)" stroke-width="2" stroke-dasharray="5 3"/>
  <path d="M58,78 L70,78 M64,74 L64,88 M59,88 L69,88 M58,84 L70,84" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round"/>
  <polygon points="26,42 32,36 38,42 32,48" fill="url(#cyanStone)" stroke="#a5f3fc" stroke-width="1.5"/>
  <polygon points="96,44 102,38 108,44 102,50" fill="url(#rubyGrad)" stroke="#fca5a5" stroke-width="1.5"/>
  <circle cx="32" cy="74" r="6" fill="#fde047" stroke="#b45309" stroke-width="1.5"/>
  <circle cx="96" cy="74" r="6" fill="#fde047" stroke="#b45309" stroke-width="1.5"/>
</svg>`;

// 3. Skills Icon SVG (Song Kiếm Hộ Thể Kỹ Năng)
const skillsSvg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="skillBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#082f49"/>
      <stop offset="65%" stop-color="#0c4a6e"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="swordBlade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#e0f2fe"/>
      <stop offset="70%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="goldBlade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <radialGradient id="thunderCore" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#1e40af"/>
    </radialGradient>
  </defs>
  <circle cx="64" cy="64" r="60" fill="url(#skillBg)" stroke="url(#goldBlade)" stroke-width="4"/>
  <circle cx="64" cy="64" r="53" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.7"/>
  <g transform="rotate(45 64 64)">
    <polygon points="61,16 67,16 67,82 64,106 61,82" fill="url(#swordBlade)" stroke="#ffffff" stroke-width="1.2"/>
    <line x1="64" y1="16" x2="64" y2="104" stroke="#ffffff" stroke-width="1.5"/>
    <rect x="52" y="82" width="24" height="5" rx="2.5" fill="url(#goldBlade)" stroke="#fef08a" stroke-width="1"/>
    <circle cx="64" cy="84.5" r="3" fill="#06b6d4"/>
    <rect x="61.5" y="87" width="5" height="16" rx="1" fill="#78350f" stroke="#f59e0b" stroke-width="1"/>
    <circle cx="64" cy="107" r="5" fill="url(#goldBlade)"/>
  </g>
  <g transform="rotate(-45 64 64)">
    <polygon points="61,16 67,16 67,82 64,106 61,82" fill="url(#swordBlade)" stroke="#ffffff" stroke-width="1.2"/>
    <line x1="64" y1="16" x2="64" y2="104" stroke="#ffffff" stroke-width="1.5"/>
    <rect x="52" y="82" width="24" height="5" rx="2.5" fill="url(#goldBlade)" stroke="#fef08a" stroke-width="1"/>
    <circle cx="64" cy="84.5" r="3" fill="#06b6d4"/>
    <rect x="61.5" y="87" width="5" height="16" rx="1" fill="#78350f" stroke="#f59e0b" stroke-width="1"/>
    <circle cx="64" cy="107" r="5" fill="url(#goldBlade)"/>
  </g>
  <circle cx="64" cy="64" r="14" fill="url(#thunderCore)" opacity="0.9"/>
  <polygon points="64,52 69,63 64,66 68,76 59,65 64,62" fill="#ffffff" stroke="#fef08a" stroke-width="0.8"/>
</svg>`;

async function run() {
  await sharp(Buffer.from(settingsSvg)).webp({ quality: 90 }).toFile('assets/ui/icon_settings.webp');
  await sharp(Buffer.from(bagSvg)).webp({ quality: 90 }).toFile('assets/ui/icon_bag.webp');
  await sharp(Buffer.from(skillsSvg)).webp({ quality: 90 }).toFile('assets/ui/icon_skills.webp');
  console.log('Successfully generated all 3 icons!');
}

run();
