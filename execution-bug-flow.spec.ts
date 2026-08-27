import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/app.page';

/**
 * E2E for the failed-execution -> bug creation flow (UC-001, TC-EX-002, TC-BG-002)
 * and execution result validation (TC-EX-004).
 */

test.describe('Execution and bug flow', () => {
  test('recording a failed execution prompts to create a bug (TC-EX-002)', async ({ page }) => {
    const app = new AppPage(page);
    const projectName = `Fail Flow ${Date.now()}`;

    await app.gotoProjects();
    await app.createProject(projectName);
    await app.createTestCase('Test that will fail');

    // Auto-accept the "create bug?" confirm dialog.
    page.on('dialog', (dialog) => dialog.accept());

    await app.executeTestCase('Test that will fail', 'Fail');

    // The bug form should open, pre-filled with the failed test title.
    await expect(page.getByRole('dialog', { name: 'New Bug' })).toBeVisible();
    await expect(page.getByLabel('Title *')).toHaveValue(/\[Failed\] Test that will fail/);
  });

  test('cannot save an execution without selecting a result (TC-EX-004)', async ({ page }) => {
    const app = new AppPage(page);
    const projectName = `No Result ${Date.now()}`;

    await app.gotoProjects();
    await app.createProject(projectName);
    await app.createTestCase('Result required test');

    await app.testCaseRow('Result required test').getByRole('button', { name: 'Execute' }).click();
    await page.getByRole('button', { name: 'Save Execution' }).click();
    await expect(page.getByText('Result is required')).toBeVisible();
  });
});
