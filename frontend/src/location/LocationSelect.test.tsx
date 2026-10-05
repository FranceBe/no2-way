import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FIXTURE_LOCATIONS } from './fixtures'
import { LocationSelect } from './LocationSelect'

describe('LocationSelect', () => {
    it('lists the neighbourhoods by name and reports the selected id', () => {
        const onChange = vi.fn()
        render(
            <LocationSelect
                locations={FIXTURE_LOCATIONS}
                value="camden"
                onChange={onChange}
            />
        )
        const select = screen.getByRole('combobox', { name: 'Neighbourhood' })

        expect(select).toHaveValue('camden')
        expect(
            within(select)
                .getAllByRole('option')
                .map((o) => o.textContent)
        ).toEqual(['Camden', 'Hackney', 'Brixton'])

        fireEvent.change(select, { target: { value: 'brixton' } })
        expect(onChange).toHaveBeenCalledWith('brixton')
    })

    it('is disabled while the list is loading', () => {
        render(<LocationSelect locations={[]} onChange={vi.fn()} />)
        expect(
            screen.getByRole('combobox', { name: 'Neighbourhood' })
        ).toBeDisabled()
    })
})
