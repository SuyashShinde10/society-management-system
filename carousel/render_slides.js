const path = require('path');
const fs = require('fs');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  ({ chromium } = require(path.join(__dirname, '../frontend/node_modules/playwright')));
}

async function renderSlides() {
  console.log('🚀 Launching headless Chrome to render 12 carousel slides...');

  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=2']
  });

  const page = await browser.newPage({
    viewport: { width: 1080, height: 1080 },
    deviceScaleFactor: 2
  });

  const htmlPath = 'file://' + path.join(__dirname, 'index.html').replace(/\\/g, '/');
  console.log(`Loading HTML from: ${htmlPath}`);
  await page.goto(htmlPath, { waitUntil: 'networkidle' });

  // Wait for Google Fonts to be ready
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Wait for all images in the document to load
    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));
  });

  console.log('Fonts and images loaded successfully. Rendering slides...');

  const slideFiles = [];
  for (let i = 1; i <= 12; i++) {
    // Switch to slide i
    await page.evaluate((slideNum) => {
      window.showSlide(slideNum);
    }, i);

    await page.waitForTimeout(300); // allow transitions to complete

    const slideElement = await page.$(`#slide-${i}`);
    if (!slideElement) {
      console.error(`Slide #slide-${i} not found!`);
      continue;
    }

    const outputPath = path.join(assetsDir, `awaastech_slide_${String(i).padStart(2, '0')}.png`);
    await slideElement.screenshot({
      path: outputPath,
      type: 'png',
      omitBackground: false
    });

    slideFiles.push(outputPath);
    console.log(`✅ Rendered Slide ${i}/12 -> ${path.basename(outputPath)}`);
  }

  await browser.close();
  console.log(`\n🎉 Successfully rendered all ${slideFiles.length} slides to ${assetsDir}!`);
}

renderSlides().catch(err => {
  console.error('Fatal error during rendering:', err);
  process.exit(1);
});
