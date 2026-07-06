const { chromium } = require('playwright');

(async () => {
  console.log('Starting Playwright browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture browser logs
  page.on('console', msg => console.log(`BROWSER LOG: [${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => {
    console.error('BROWSER RUNTIME ERROR:', err.message);
    console.error(err.stack);
  });

  try {
    console.log('Navigating to docent-suite-gamma.vercel.app...');
    await page.goto('https://docent-suite-gamma.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('Looking for Google Drive Link input field...');
    const linkInput = page.locator('input[placeholder*="Pega el enlace"], input[placeholder*="Paste Google Drive"]');
    await linkInput.waitFor({ state: 'visible', timeout: 10000 });
    
    console.log('Typing Google Drive test URL...');
    const testUrl = 'https://drive.google.com/file/d/1ZwiCw_1LtZzBQ-LQvUvT9FyTSLY1MSKb/view?usp=sharing';
    await linkInput.fill(testUrl);
    
    // Check validation feedback
    console.log('Waiting for validation status...');
    await page.waitForTimeout(2000); // Wait for state updates
    
    const isValidVisible = await page.locator('text=/validado correctamente|validated successfully/i').isVisible();
    console.log(`Is validation message showing: ${isValidVisible}`);

    console.log('Filling Teacher and Subject fields...');
    const inputs = page.locator('input[type="text"]');
    
    // The link is the first one, teacher is second, subject is third
    await inputs.nth(1).fill('Dr. Albert Einstein');
    await inputs.nth(2).fill('Relativity Theory');
    
    console.log('Clicking "Generate & Copy Student Link" button...');
    const generateBtn = page.locator('button:has-text("Generar y Copiar"), button:has-text("Generate & Copy")');
    await generateBtn.click();
    
    console.log('Waiting for Preview Modal to pop up...');
    const modalTitle = page.locator('text=/Configurar Acceso|Configure Access/i');
    await modalTitle.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Modal found successfully! Toggle checkboxes visible.');
    
    console.log('Clicking "Confirmar y Generar Enlace" inside modal...');
    const confirmBtn = page.locator('button:has-text("Confirmar y Generar"), button:has-text("Confirm and Generate")');
    await confirmBtn.click();
    
    console.log('Checking if final generated student link is displayed...');
    const resultBox = page.locator('p.font-mono.text-indigo-300');
    await resultBox.waitFor({ state: 'visible', timeout: 5000 });
    const generatedUrl = await resultBox.innerText();
    console.log(`Success! Generated URL is: ${generatedUrl}`);
    
    if (generatedUrl.includes('#student-class=')) {
      console.log('--- TEST PASSED SUCCESSFULLY ---');
    } else {
      throw new Error('Generated URL format is invalid');
    }
  } catch (err) {
    console.error('--- TEST FAILED ---');
    console.error(err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
