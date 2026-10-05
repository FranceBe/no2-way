import { expect, test } from '@playwright/test'

const html = (page: import('@playwright/test').Page) => page.locator('html')
// Computed page background, to check the theme really applies
const background = (page: import('@playwright/test').Page) =>
    page.evaluate(() => getComputedStyle(document.body).backgroundColor)

test.describe('Theme toggle', () => {
    test.beforeEach(async ({ page }) => {
        // The widgets are not under test here: let their API calls fail fast
        await page.route('http://api.e2e.test/**', (route) => route.abort())
    })

    test('follows the OS by default', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'dark' })
        await page.goto('/')

        await expect(
            page.getByRole('button', { name: 'Auto' })
        ).toHaveAttribute('aria-pressed', 'true')
        await expect(html(page)).not.toHaveAttribute('data-theme')
        expect(await background(page)).toBe('rgb(11, 16, 32)')
    })

    test('forces a theme over the OS and remembers it after a reload', async ({
        page,
    }) => {
        await page.emulateMedia({ colorScheme: 'dark' })
        await page.goto('/')

        await page.getByRole('button', { name: 'Light' }).click()
        await expect(html(page)).toHaveAttribute('data-theme', 'light')
        expect(await background(page)).toBe('rgb(244, 246, 249)')

        await page.reload()
        await expect(html(page)).toHaveAttribute('data-theme', 'light')
        await expect(
            page.getByRole('button', { name: 'Light' })
        ).toHaveAttribute('aria-pressed', 'true')
    })
})
