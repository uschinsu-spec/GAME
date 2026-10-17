const sharp = require('sharp');
const path = require('path');

const brainDir = 'C:\\Users\\nguye\\.gemini\\antigravity-ide\\brain\\67387d9c-c22c-4cc8-ab1b-e5a6ad2058a7';
const outDir = path.join(__dirname, '../assets/ui');

const items = [
  { src: 'icon_nav_avatar_3d_1792229964905.jpg', out: 'nav_avatar_btn.png' },
  { src: 'icon_nav_bag_3d_1792229988808.jpg', out: 'nav_bag_btn.png' },
  { src: 'icon_nav_skills_3d_1792230007541.jpg', out: 'nav_skills_btn.png' },
  { src: 'icon_nav_menu_3d_1792230027097.jpg', out: 'nav_menu_btn.png' },
  { src: 'icon_nav_settings_3d_1792230047736.jpg', out: 'nav_settings_btn.png' }
];

async function processAll() {
  const size = 160;
  // In the generated image, the round medallion is centered and has some margin.
  // Let's create a circular mask
  const maskSvg = Buffer.from(`
    <svg width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="white" />
    </svg>
  `);

  for (let it of items) {
    const srcPath = path.join(brainDir, it.src);
    const dstPath = path.join(outDir, it.out);
    console.log('Processing:', it.src, '->', it.out);

    // Crop tight to the circular medallion border:
    // In 1024x1024, let's find the circle diameter or extract centered square
    // The medallion occupies roughly ~92% of the 1024 width/height.
    await sharp(srcPath)
      .extract({ left: 35, top: 35, width: 954, height: 954 })
      .resize(size, size, { fit: 'cover' })
      .composite([{
        input: maskSvg,
        blend: 'dest-in'
      }])
      .png({ compressionLevel: 9 })
      .toFile(dstPath);

    console.log('Successfully created:', dstPath);
  }
}

processAll().then(() => console.log('All 5 icons successfully processed!')).catch(console.error);
