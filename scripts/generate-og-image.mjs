import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto('file://' + process.cwd() + '/public/og-cover.svg', { waitUntil: 'load' });
await page.screenshot({ path: 'public/og-cover.png', type: 'png' });
await browser.close();
console.log('Generated public/og-cover.png');
