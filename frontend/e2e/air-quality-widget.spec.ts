import { expect, test, type Page } from '@playwright/test'

const API = 'http://api.e2e.test'
const CORS = { 'Access-Control-Allow-Origin': '*' }

const locations = [
    { id: 'camden', name: 'Camden', lat: 51.539, lon: -0.142, corridor: 'a1' },
    {
        id: 'hackney',
        name: 'Hackney',
        lat: 51.545,
        lon: -0.055,
        corridor: 'a10',
    },
]

// Hourly readings ending now; one hour in the "Very poor" band
const readings = (hours: number) => {
    const end = new Date()
    end.setUTCMinutes(0, 0, 0)
    return Array.from({ length: hours + 1 }, (_, i) => ({
        ts: new Date(end.getTime() - (hours - i) * 3600e3)
            .toISOString()
            .slice(0, 16),
        grid: '51.50,-0.10',
        pm2_5: 8,
        pm10: 14,
        nitrogen_dioxide: 30,
        ozone: 40,
        european_aqi: i === hours - 3 ? 85 : 25,
    }))
}

// Stubs the API and records every /air request as "location:hours"
const stubApi = async (page: Page) => {
    const airRequests: string[] = []
    await page.route(`${API}/weather?*`, (route) =>
        route.fulfill({ status: 404, headers: CORS })
    )
    await page.route(`${API}/locations`, (route) =>
        route.fulfill({ json: locations, headers: CORS })
    )
    await page.route(`${API}/air?*`, (route) => {
        const params = new URL(route.request().url()).searchParams
        const hours = Number(params.get('hours'))
        airRequests.push(`${params.get('location')}:${hours}`)
        return route.fulfill({ json: readings(hours), headers: CORS })
    })
    return airRequests
}

test.describe('Air quality widget', () => {
    test('shows the summary and the AQI chart', async ({ page }) => {
        await stubApi(page)
        await page.goto('/')

        const panel = page.getByRole('region', { name: 'Air quality' })
        await expect(
            panel.getByText('Camden · European AQI, hourly')
        ).toBeVisible()
        await expect(
            panel.locator('.aq-stat', { hasText: 'Peak (48h)' })
        ).toContainText('85Very poor')
        await expect(
            panel.locator('.aq-stat', { hasText: 'Poor or worse' })
        ).toContainText('1 h')
        await expect(
            panel.locator('.aq-panel__chart .recharts-line')
        ).toBeVisible()
        await expect(panel.getByRole('figure')).toHaveCount(4)
    })

    test('shows the values of an hour on hover', async ({ page }) => {
        await stubApi(page)
        await page.goto('/')

        const chart = page.locator('.aq-panel__chart .recharts-surface')
        await expect(chart).toBeVisible()
        const box = (await chart.boundingBox())!
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)

        const tooltip = page.locator('.aq-tooltip')
        await expect(tooltip).toBeVisible()
        await expect(tooltip).toContainText('AQI 25')
        await expect(tooltip).toContainText('NO₂30 µg/m³')
    })

    test('reloads the data when the range or the neighbourhood changes', async ({
        page,
    }) => {
        const airRequests = await stubApi(page)
        await page.goto('/')
        const panel = page.getByRole('region', { name: 'Air quality' })
        await expect(panel.getByText('Peak (48h)')).toBeVisible()

        await panel.getByRole('button', { name: '7d' }).click()
        await expect(panel.getByText('Peak (7d)')).toBeVisible()

        // The neighbourhood is picked in the header, for the whole app
        await page
            .getByRole('combobox', { name: 'Neighbourhood' })
            .selectOption('hackney')
        await expect(
            panel.getByText('Hackney · European AQI, hourly')
        ).toBeVisible()
        await expect(page).toHaveURL(/\/air-quality\?location=hackney$/)

        // StrictMode can replay the first request in dev: check which requests happened, not how many
        await expect
            .poll(() => [...new Set(airRequests)])
            .toEqual(['camden:48', 'camden:168', 'hackney:168'])
    })
})
