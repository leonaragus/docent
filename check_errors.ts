import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  console.log('Navigating to https://docent-suite-gamma.vercel.app ...');
  try {
    await page.goto('https://docent-suite-gamma.vercel.app', { waitUntil: 'networkidle' });
    console.log('Page loaded successfully. Checking for errors...');
    await page.waitForTimeout(2000); // Wait 2 seconds
  } catch (e) {
    console.log('Navigation failed:', e);
  }

  await browser.close();
})();
