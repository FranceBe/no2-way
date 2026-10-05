import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    getResolvedTheme,
    getThemePreference,
    readTokens,
    setThemePreference,
    THEME_STORAGE_KEY,
} from './theme'

// jsdom has no matchMedia: stub the OS colour scheme
const mockOsDark = (dark: boolean) =>
    vi.stubGlobal('matchMedia', (query: string) => ({
        matches: dark && query === '(prefers-color-scheme: dark)',
        addEventListener: () => {},
        removeEventListener: () => {},
    }))

afterEach(() => {
    setThemePreference('system')
    vi.unstubAllGlobals()
})

describe('theme preference', () => {
    it('is system by default', () => {
        expect(getThemePreference()).toBe('system')
    })

    it('ignores unexpected stored values', () => {
        localStorage.setItem(THEME_STORAGE_KEY, 'purple')
        expect(getThemePreference()).toBe('system')
    })

    it('still applies the theme when storage is unavailable', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError')
        })

        setThemePreference('dark')

        expect(document.documentElement.dataset.theme).toBe('dark')
        vi.restoreAllMocks()
    })
})

describe('getResolvedTheme', () => {
    it('follows the OS when nothing is forced', () => {
        mockOsDark(true)
        expect(getResolvedTheme()).toBe('dark')
        mockOsDark(false)
        expect(getResolvedTheme()).toBe('light')
    })

    it('lets a forced theme win over the OS', () => {
        mockOsDark(true)
        setThemePreference('light')
        expect(getResolvedTheme()).toBe('light')
    })
})

describe('readTokens', () => {
    it('reads CSS custom properties from the root element', () => {
        document.documentElement.style.setProperty('--viz-series', ' #10194a ')
        expect(readTokens(['viz-series'])).toEqual({ 'viz-series': '#10194a' })
        document.documentElement.style.removeProperty('--viz-series')
    })
})
