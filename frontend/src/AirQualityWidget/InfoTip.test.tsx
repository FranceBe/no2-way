import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InfoTip } from './InfoTip'

const renderTip = () =>
    render(
        <div>
            <InfoTip label="About fine particles">
                <p>Tiny particles</p>
            </InfoTip>
            <button type="button">Elsewhere</button>
        </div>
    )

const infoButton = () =>
    screen.getByRole('button', { name: 'About fine particles' })

describe('InfoTip', () => {
    it('is closed by default and points to its panel', () => {
        renderTip()

        expect(infoButton()).toHaveAttribute('aria-expanded', 'false')
        const panel = screen.getByRole('note')
        expect(infoButton()).toHaveAttribute('aria-controls', panel.id)
        expect(panel).toHaveTextContent('Tiny particles')
    })

    it('toggles on click', () => {
        renderTip()

        fireEvent.click(infoButton())
        expect(infoButton()).toHaveAttribute('aria-expanded', 'true')

        fireEvent.click(infoButton())
        expect(infoButton()).toHaveAttribute('aria-expanded', 'false')
    })

    it('closes on Escape', () => {
        renderTip()
        fireEvent.click(infoButton())

        fireEvent.keyDown(document, { key: 'Escape' })

        expect(infoButton()).toHaveAttribute('aria-expanded', 'false')
    })

    it('closes on a click outside, not on a click inside', () => {
        renderTip()
        fireEvent.click(infoButton())

        fireEvent.pointerDown(screen.getByText('Tiny particles'))
        expect(infoButton()).toHaveAttribute('aria-expanded', 'true')

        fireEvent.pointerDown(screen.getByRole('button', { name: 'Elsewhere' }))
        expect(infoButton()).toHaveAttribute('aria-expanded', 'false')
    })
})
