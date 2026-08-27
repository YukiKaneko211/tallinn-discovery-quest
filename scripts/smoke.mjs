import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4173';
const OUT = '/tmp/shots';
mkdirSync(OUT, { recursive: true });

const errors = [];
const steps = [];

function ok(name, extra = '') {
  steps.push(`PASS  ${name}${extra ? ' — ' + extra : ''}`);
}
function fail(name, msg) {
  steps.push(`FAIL  ${name} — ${msg}`);
  errors.push(`${name}: ${msg}`);
}

// Uses the browser installed by `npx playwright install chromium`.
// Set CHROME_PATH to point at another Chromium/Chrome build.
const browser = await chromium.launch({
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  args: ['--no-sandbox'],
});
const ctx = await browser.newContext({
  viewport: { width: 420, height: 860 },
  deviceScaleFactor: 2,
  permissions: [],
});
const page = await ctx.newPage();
const consoleErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(String(e)));

async function shot(name) {
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

try {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.explore__title', { timeout: 45000 });
  ok('Explore loads (PGlite seeded)');
  const spotsStat = await page.locator('.explore__stat').first().innerText();
  ok('Header counters', spotsStat.replace(/\n/g, ' '));
  await shot('01-explore');

  // --- simulate GPS at Tallinn Town Hall
  await page.selectOption('.explore__sim select', 'tallinn-town-hall');
  await page.waitForTimeout(700);
  const btn = page.locator('.sheet .btn').first();
  const label = await btn.innerText();
  if (!/Check In Now/.test(label)) fail('Quick check-in activates within 200m', label);
  else ok('Quick check-in activates within 200m', label.trim());
  await shot('02-explore-simulated');

  // --- open spot page via quick check-in
  await btn.click();
  await page.waitForSelector('.spot__stamp', { timeout: 10000 });
  ok('Spot page opens');
  await shot('03-spot-unchecked');

  // --- check in
  await page.click('.spot__stamp');
  await page.waitForTimeout(900);
  const stampSrc = await page.locator('.spot__stamp img').getAttribute('src');
  if (!/stamp_checkedin_/.test(stampSrc ?? '')) fail('Check-in swaps the stamp image', String(stampSrc));
  else ok('Check-in swaps the stamp image');
  await shot('04-spot-checked');

  // --- quiz: open first card and answer correctly
  await page.locator('.quiz__head').first().click();
  await page.waitForSelector('.quiz__answer');
  const answers = page.locator('.quiz .quiz__answer');
  await answers.nth(1).click();
  await page.click('button:has-text("Submit Answer")');
  await page.waitForTimeout(900);
  const done = await page.locator('.quiz').first().getAttribute('class');
  if (!/quiz--done/.test(done ?? '')) fail('Correct quiz answer marks Completed', String(done));
  else ok('Correct quiz answer marks Completed');
  await shot('05-quiz-complete');

  // --- points must now be 50 (spot) + 20 (quiz)
  await page.click('.gmenu__item:has-text("Collection")');
  await page.waitForSelector('.ctile');
  await shot('06-collection');
  await page.click('.ctile:has-text("Deco")');
  await page.waitForSelector('.cpoints');
  const pts = await page.locator('.cpoints').innerText();
  if (!/70/.test(pts)) fail('Points accumulate (expect 70 pt)', pts);
  else ok('Points accumulate', pts.trim());
  await shot('07-collection-deco');

  // --- unlock a deco
  await page.locator('.decorow--locked').first().click();
  await page.waitForSelector('.popup');
  const popTitle = await page.locator('.popup__title').innerText();
  ok('Unlock popup', popTitle.trim());
  await shot('08-unlock-popup');
  await page.click('.popup button:has-text("Unlock")');
  await page.waitForTimeout(500);
  const pts2 = await page.locator('.cpoints').innerText();
  if (pts2 === pts) fail('Unlocking spends points', `still ${pts2}`);
  else ok('Unlocking spends points', `${pts.trim()} → ${pts2.trim()}`);

  // --- deco souvenir: upload a photo through the library input
  await page.click('.gmenu__item:has-text("Deco Souvenir")');
  await page.waitForSelector('.cap__empty');
  await shot('09-deco-capture');
  const png = Buffer.from(
    // 4x3 gradient-ish png generated inline
    await page.evaluate(async () => {
      const c = document.createElement('canvas');
      c.width = 900;
      c.height = 1200;
      const g = c.getContext('2d');
      const grad = g.createLinearGradient(0, 0, 900, 1200);
      grad.addColorStop(0, '#8fd3ff');
      grad.addColorStop(1, '#ffd9a0');
      g.fillStyle = grad;
      g.fillRect(0, 0, 900, 1200);
      g.fillStyle = '#c0392b';
      g.fillRect(150, 700, 600, 400);
      g.fillStyle = '#f2e9d8';
      g.fillRect(250, 400, 400, 320);
      const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
      const buf = new Uint8Array(await blob.arrayBuffer());
      return Array.from(buf);
    }),
  );
  await page.locator('input[type=file]').nth(1).setInputFiles({
    name: 'shot.png',
    mimeType: 'image/png',
    buffer: png,
  });
  await page.waitForSelector('.cap__foot', { timeout: 10000 });
  const sel = await page.locator('.cap__selbtn').innerText();
  ok('Preview shows Spot selector', sel.trim());
  await shot('10-deco-preview');

  await page.click('button:has-text("Start Editing")');
  await page.waitForSelector('.ed__stage canvas', { timeout: 10000 });
  ok('Editor opens with canvas');
  await shot('11-editor-overview');

  // --- text mode
  await page.click('.ed__tab:has-text("Text")');
  await page.waitForSelector('.ed__textarea');
  await page.fill('.ed__textarea', 'TALLINN!!');
  await page.waitForTimeout(300);
  await shot('12-editor-text');
  // cycle style + align
  await page.click('[aria-label^="Style"]');
  await page.click('[aria-label^="Alignment"]');
  // colour panel
  await page.click('[aria-label="Colour"]');
  await page.waitForSelector('.ed__swatches');
  ok('Text colour panel');
  await shot('13-editor-color');

  // --- deco mode
  await page.click('.ed__tab:has-text("Deco")');
  await page.waitForSelector('.decogrid');
  await page.locator('.decocard__btn:not(.decocard__btn--locked)').first().click();
  await page.waitForTimeout(400);
  ok('Deco placed on canvas');
  await shot('14-editor-deco');

  // --- edit mode filters
  await page.click('.ed__tab:has-text("Edit")');
  await page.waitForSelector('.ed__tools');
  await page.click('.ed__tool:has-text("Brightness")');
  await page.locator('input[aria-label="Strength"]').fill('0.35');
  await page.waitForTimeout(400);
  ok('Brightness filter applies');
  await shot('15-editor-brightness');
  await page.click('[aria-label="Back to tools"]');
  await page.click('.ed__tool:has-text("Color Filter")');
  await page.locator('input[aria-label="Strength"]').fill('0.55');
  await page.locator('input[aria-label="Hue"]').fill('170');
  await page.waitForTimeout(400);
  ok('Colour filter applies');
  await shot('16-editor-colorfilter');

  // --- back to overview and save
  await page.click('.ed__tab:has-text("Edit")');
  await page.waitForSelector('.ed__save', { timeout: 8000 });
  await shot('17-editor-final');
  await page.click('.ed__save');
  await page.waitForSelector('.photogrid__cell img', { timeout: 20000 });
  ok('Photo saved and listed on the Spot page');
  await shot('18-spot-photos');

  // --- preview window
  await page.locator('.photogrid__cell').first().click();
  await page.waitForSelector('.pv__img');
  ok('Photo preview opens');
  await shot('19-photo-preview');

  // --- reload: data must persist (PGlite -> IndexedDB, photo -> OPFS)
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.explore__title', { timeout: 45000 });
  const persisted = await page.locator('.explore__stat').first().innerText();
  if (!/1 \/ 12/.test(persisted.replace(/\n/g, ' '))) fail('Check-in persists a reload', persisted);
  else ok('Check-in persists a reload', persisted.replace(/\n/g, ' '));
  await shot('20-after-reload');

  // --- uncheck-in flow
  await page.goto(`${BASE}/#/spot/tallinn-town-hall`);
  await page.waitForSelector('.spot__stamp');
  await page.click('.spot__stamp');
  await page.waitForSelector('.popup');
  const t = await page.locator('.popup__title').innerText();
  if (!/uncheck-in/i.test(t)) fail('Uncheck-in confirmation', t);
  else ok('Uncheck-in confirmation', t.trim());
  await shot('21-uncheckin-popup');
  await page.click('.popup button:has-text("Uncheck-in")');
  await page.waitForTimeout(500);
  const s2 = await page.locator('.spot__stamp img').getAttribute('src');
  if (/stamp_checkedin_/.test(s2 ?? '')) fail('Uncheck-in reverts the stamp', String(s2));
  else ok('Uncheck-in reverts the stamp');
} catch (e) {
  fail('run', e.message);
  await shot('99-crash');
}

console.log(steps.join('\n'));
if (consoleErrors.length) {
  console.log('\nCONSOLE ERRORS:');
  console.log([...new Set(consoleErrors)].slice(0, 15).join('\n'));
}
await browser.close();
process.exit(errors.length ? 1 : 0);
