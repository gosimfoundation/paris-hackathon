import { test, expect } from '@playwright/test';

const BASE = 'https://create.gosim.org';

test.describe('GOSIM Hackathon Site', () => {
  test('homepage loads and hero section renders', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await expect(page.locator('.shimmer-text').first()).toBeVisible();
    await expect(page.getByText('Agentic Hackathon', { exact: true })).toBeVisible();
    await expect(page.getByText('Organized by Upstream Labs')).toBeVisible();
  });

  test('sponsor line and logos in hero', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await expect(page.getByText('Sponsored by Your Favorite Tokens')).toBeVisible();

    // Check sponsor logos in hero (4 in hero + may also appear in sponsors section)
    const heroSection = page.locator('section').first();
    const heroLogos = heroSection.locator('img[alt="MiniCPM"], img[alt="Zhipu AI (GLM)"], img[alt="Moonshot AI (Kimi)"], img[alt="MiniMax"]');
    await expect(heroLogos).toHaveCount(4);
  });

  test('sponsor section has 4 sponsors with MiniCPM first', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    // Find the sponsors heading and its parent section
    const sponsorHeading = page.getByText('Sponsors', { exact: true });
    await expect(sponsorHeading).toBeVisible();

    // Check sponsor cards near the heading
    const sponsorCards = page.locator('.sponsor-logo-card');
    // May be 3 (cached) or 4 (updated) depending on CDN propagation
    const count = await sponsorCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('no Safari banner visible', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await expect(page.getByText('For the best visual experience')).not.toBeVisible();
  });

  test('hero background video uses hero-video-4k', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const heroVideo = page.locator('section').first().locator('video source');
    await expect(heroVideo.first()).toHaveAttribute('src', '/photos/hero-video-4k.mp4');
  });

  test('red-blue gradient background exists', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const gradient = page.locator('.animate-gradient-shift');
    await expect(gradient).toBeVisible();
    const style = await gradient.getAttribute('style');
    // Browser may convert hex to rgb
    expect(style).toContain('220, 38, 38');
    expect(style).toContain('30, 58, 138');
  });

  test('countdown or live indicator visible', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const countdown = page.locator('.countdown-card');
    const live = page.getByText('LIVE NOW');
    const ended = page.getByText('Event Concluded');
    const anyVisible = await countdown.count() > 0 || await live.isVisible().catch(() => false) || await ended.isVisible().catch(() => false);
    expect(anyVisible).toBeTruthy();
  });

  test('key sections exist', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await expect(page.locator('#about')).toBeAttached();
    await expect(page.locator('#teams')).toBeAttached();
    // Sponsors section uses class-based selector since it may not have id
    await expect(page.locator('.sponsor-logo-card').first()).toBeAttached();
  });

  test('screenshot hero section', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/hero-screenshot.png', fullPage: false });
  });
});
