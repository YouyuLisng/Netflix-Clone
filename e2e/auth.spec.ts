import { test, expect } from '@playwright/test';

// Session strategy is JWT (see pages/api/auth/[...nextauth].ts), so these
// checks never touch the database -- safe to run without a real
// DATABASE_URL/Mongo instance.

test('unauthenticated visit to / redirects to /auth', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/auth$/);
});

test('unauthenticated visit to /profiles redirects to /auth', async ({ page }) => {
    await page.goto('/profiles');

    await expect(page).toHaveURL(/\/auth$/);
});

test('the auth page toggles between login and register', async ({ page }) => {
    await page.goto('/auth');

    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByLabel('Username')).not.toBeVisible();

    await page.getByText('Create an account').click();

    await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
});

test('an unknown route renders the not-found page instead of crashing', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');

    expect(response?.status()).toBe(404);
});
