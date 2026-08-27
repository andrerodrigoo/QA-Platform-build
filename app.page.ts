import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model helpers for the QA Platform UI.
 * Encapsulating selectors here keeps the test specs readable and resilient.
 */
export class AppPage {
  constructor(private readonly page: Page) {}

  async gotoDashboard(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  async gotoProjects(): Promise<void> {
    await this.page.goto('/projects');
  }

  async gotoBugs(): Promise<void> {
    await this.page.goto('/bugs');
  }

  // ----- Projects -----

  async createProject(name: string, description = ''): Promise<void> {
    await this.page.getByRole('button', { name: '+ New Project' }).click();
    await this.page.getByLabel('Name *').fill(name);
    if (description) await this.page.getByLabel('Description').fill(description);
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  projectCard(name: string): Locator {
    return this.page.getByRole('link').filter({ hasText: name });
  }

  async openProject(name: string): Promise<void> {
    await this.projectCard(name).click();
  }

  // ----- Test cases -----

  async createTestCase(title: string, steps = 'step 1', expected = 'expected'): Promise<void> {
    await this.page.getByRole('button', { name: '+ New Test Case' }).click();
    await this.page.getByLabel('Title *').fill(title);
    await this.page.getByLabel('Steps *').fill(steps);
    await this.page.getByLabel('Expected Result *').fill(expected);
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  testCaseRow(title: string): Locator {
    return this.page.locator('.list-row').filter({ hasText: title });
  }

  async executeTestCase(title: string, result: 'Pass' | 'Fail' | 'Blocked'): Promise<void> {
    await this.testCaseRow(title).getByRole('button', { name: 'Execute' }).click();
    await this.page.getByLabel('Result *').selectOption(result);
    await this.page.getByRole('button', { name: 'Save Execution' }).click();
  }

  // ----- Bugs -----

  async createBug(title: string, severity = 'High'): Promise<void> {
    await this.page.getByRole('button', { name: '+ New Bug' }).click();
    await this.page.getByLabel('Title *').fill(title);
    await this.page.getByLabel('Severity').selectOption(severity);
    await this.page.getByRole('button', { name: 'Save' }).click();
  }
}
