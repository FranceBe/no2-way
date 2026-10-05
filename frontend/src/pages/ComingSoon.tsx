import { useId, type ReactNode } from 'react'
import './ComingSoon.css'

type ComingSoonProps = {
    title: string
    children: ReactNode
}

// Empty panel for a tab whose widgets are not written yet
export const ComingSoon = ({ title, children }: ComingSoonProps) => {
    const titleId = useId()
    return (
        <section className="coming-soon" aria-labelledby={titleId}>
            <h2 id={titleId}>{title}</h2>
            <p>{children}</p>
            <p className="coming-soon__note">Coming soon.</p>
        </section>
    )
}
