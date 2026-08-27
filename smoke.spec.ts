import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/app.page';

/**
 * Smoke suite (@smoke): verifies the critical paths are alive.
 * Maps to SMK-001..SMK-006 in test-strategy.md. If any of these fail, the
 * deployment is considered broken.
 */

test.describe('@smoke Smoke tests', () => {
  test('SMK-001 application loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('QA Platform')).toBeVisible();
  });

  test('SMK-002..006 full critical path: project -> test case -> execute -> bug -> dashboard', async ({
    page,
  }) => {
    const app = new AppPage(page);
    const projectName = `Smoke Project ${Date.now()}`;

    // Create project
    await app.gotoProjects();
    await app.createProject(projectName, 'smoke test project');
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();

    // Create test case
    await app.createTestCase('Smoke login test');
    await expect(app.testCaseRow('Smoke login test')).toBeVisible();

    // Execute it as Pass
    await app.executeTestCase('Smoke login test', 'Pass');
    await expect(page.getByText('Pass Rate')).toBeVisible();

    // Create a bug
    await app.gotoBugs();
    await app.createBug('Smoke bug report');
    await expect(page.locator('.list-row').filter({ hasText: 'Smoke bug report' })).toBeVisible();

    // Dashboard loads with metrics
    await app.gotoDashboard();
    await expect(page.getByText('Projects')).toBeVisible();
    await expect(page.getByText('Execution Results')).toBeVisible();
  });
});
