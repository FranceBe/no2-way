import { expect, test, type Page } from '@playwright/test'

const weather = {
    time: '2026-10-05T14:00',
    temperature: 17.6,
    feelsLike: 16.2,
    weatherCode: 2,
    isDay: true,
    precipitation: 0,
    windSpeed: 12.5,
}

// The app runs on another origin than the API, so stubbed responses need CORS headers
const CORS = { 'Access-Control-Allow-Origin': '*' }

const locations = [
    { id: 'camden', name: 'Camden', lat: 51.539, lon: -0.142, corridor: 'a1' },
]

const stubWeather = async (page: Page, status: number, body: unknown) => {
    await page.route('http://api.e2e.test/locations', (route) =>
        route.fulfill({ json: locations, headers: CORS })
    )
    await page.route('http://api.e2e.test/weather?*', (route) =>
        route.fulfill({ status, json: body, headers: CORS })
    )
}

test.describe('Weather widget', () => {
    test('shows the current weather in the top right corner', async ({
        page,
    }) => {
        await stubWeather(page, 200, weather)
        const request = page.waitForRequest('http://api.e2e.test/weather?*')

        await page.goto('/')

        expect(
            new URL((await request).url()).searchParams.get('location')
        ).toBe('camden')

        // The name from /locations, not the id
        const widget = page.getByRole('region', { name: 'Weather in Camden' })
        await expect(widget).toBeVisible()
        await expect(
            widget.getByRole('img', { name: 'Partly cloudy' })
        ).toBeVisible()
        await expect(widget.getByText('18°C', { exact: true })).toBeVisible()
        await expect(widget.getByTitle('Feels like')).toHaveText('16°C')
        await expect(widget.getByTitle('Wind speed')).toHaveText('13 km/h')
        await expect(widget.getByTitle('Precipitation')).toHaveText('0 mm')

        // Top right: in the upper part of the page, right edge close to the app column's edge
        const box = (await widget.boundingBox())!
        const column = (await page.locator('#root').boundingBox())!
        expect(box.y).toBeLessThan(100)
        expect(column.x + column.width - (box.x + box.width)).toBeLessThan(40)
    })

    test('shows the API error message when the request fails', async ({
        page,
    }) => {
        // 4xx is not retried by the query client, so the error shows up immediately
        await stubWeather(page, 400, { error: 'Unknown or missing location' })

        await page.goto('/')

        await expect(
            page.getByText('Weather unavailable (Unknown or missing location)')
        ).toBeVisible()
        await expect(
            page.getByRole('region', { name: /^Weather in/ })
        ).toHaveCount(0)
    })

    test('shows a loading state until the API answers', async ({ page }) => {
        // Hold the response until the loading state has been checked
        let release!: () => void
        const released = new Promise<void>((resolve) => (release = resolve))
        await stubWeather(page, 200, weather)
        await page.route('http://api.e2e.test/weather?*', async (route) => {
            await released
            await route.fulfill({ json: weather, headers: CORS })
        })

        await page.goto('/')

        await expect(page.getByText('Loading weather…')).toBeVisible()
        release()
        await expect(
            page.getByRole('region', { name: 'Weather in Camden' })
        ).toBeVisible()
        await expect(page.getByText('Loading weather…')).toBeHidden()
    })
})
