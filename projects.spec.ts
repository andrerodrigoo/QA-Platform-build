import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/app.page';

/**
 * E2E tests for project management, including negative scenarios.
 */

test.describe('Project management', () => {
  test('creates a project with valid data (TC-PM-001)', async ({ page }) => {
    const app = new AppPage(page);
    const name = `Valid Project ${Date.now()}`;
    await app.gotoProjects();
    await app.createProject(name);
    await expect(page.getByRole('heading', { name })).toBeVisible();
  });

  test('shows an error when submitting an empty name (TC-PM-002)', async ({ page }) => {
    const app = new AppPage(page);
    await app.gotoProjects();
    await page.getByRole('button', { name: '+ New Project' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Project name is required')).toBeVisible();
  });

  test('shows an error when creating a duplicate project (TC-PM-006)', async ({ page }) => {
    const app = new AppPage(page);
    const name = `Dup Project ${Date.now()}`;
    await app.gotoProjects();
    await app.createProject(name);

    await app.gotoProjects();
    await page.getByRole('button', { name: '+ New Project' }).click();
    await page.getByLabel('Name *').fill(name);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('A project with this name already exists')).toBeVisible();
  });

  test('shows empty state for a search with no matches (TC-TC-014)', async ({ page }) => {
    const app = new AppPage(page);
    const name = `Empty Search Project ${Date.now()}`;
    await app.gotoProjects();
    await app.createProject(name);
    await app.createTestCase('Some test case');
    await page.getByLabel('Search').fill('zzz-no-match-zzz');
    await expect(page.getByText('No test cases found')).toBeVisible();
  });
});
