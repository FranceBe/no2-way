import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { setThemePreference, THEME_STORAGE_KEY } from '../theme/theme'
import { ThemeToggle } from './ThemeToggle'

const button = (name: string) => screen.getByRole('button', { name })

afterEach(() => {
    act(() => setThemePreference('system'))
})

describe('ThemeToggle', () => {
    it('defaults to Auto, without forcing a theme', () => {
        render(<ThemeToggle />)

        expect(button('Auto')).toHaveAttribute('aria-pressed', 'true')
        expect(document.documentElement).not.toHaveAttribute('data-theme')
    })

    it('forces dark and saves the choice', () => {
        render(<ThemeToggle />)

        fireEvent.click(button('Dark'))

        expect(button('Dark')).toHaveAttribute('aria-pressed', 'true')
        expect(button('Auto')).toHaveAttribute('aria-pressed', 'false')
        expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    })

    it('goes back to the OS setting with Auto', () => {
        render(<ThemeToggle />)

        fireEvent.click(button('Light'))
        fireEvent.click(button('Auto'))

        expect(document.documentElement).not.toHaveAttribute('data-theme')
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
    })

    it('shows a saved choice on first render', () => {
        localStorage.setItem(THEME_STORAGE_KEY, 'light')
        render(<ThemeToggle />)
        expect(button('Light')).toHaveAttribute('aria-pressed', 'true')
    })
})
