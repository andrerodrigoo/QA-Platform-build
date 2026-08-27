import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/app.page';

/**
 * Regression suite — one test per fixed bug. Each test reproduces the original
 * defect and would FAIL against the buggy code, then PASS after the fix.
 * See docs/qa/bug-reports.md for the corresponding reports.
 */

test.describe('Regression', () => {
  // BUG-003: deleting a test case must update the "Test Cases" stat card.
  test('REG BUG-003: Test Cases stat updates immediately after deleting a test case', async ({
    page,
  }) => {
    const app = new AppPage(page);
    const projectName = `Reg BUG-003 ${Date.now()}`;

    await app.gotoProjects();
    await app.createProject(projectName);
    await app.createTestCase('TC to keep');
    await app.createTestCase('TC to delete');

    // Stat card should read 2.
    const statCard = page.locator('.card.stat').filter({ hasText: 'Test Cases' });
    await expect(statCard.locator('.value')).toHaveText('2');

    // Delete one test case (auto-accept the confirm dialog).
    page.on('dialog', (dialog) => dialog.accept());
    await app.testCaseRow('TC to delete').getByRole('button', { name: 'Delete' }).click();

    // The stat card must now read 1 WITHOUT a manual page reload.
    await expect(statCard.locator('.value')).toHaveText('1');
  });
});
