import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

type InfoTipProps = {
    label: string // accessible name of the button, e.g. "About fine particles"
    children: ReactNode
}

// Small "i" button with an explanation. Shows on hover, and toggles on
// click, tap or Enter (touch screens have no hover).
// The panel is positioned against the closest positioned ancestor.
export const InfoTip = ({ label, children }: InfoTipProps) => {
    const [open, setOpen] = useState(false)
    const panelId = useId()
    const rootRef = useRef<HTMLDivElement>(null)

    // Close on Escape or on a click outside
    useEffect(() => {
        if (!open) return
        const onPointerDown = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
        }
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('pointerdown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('pointerdown', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [open])

    return (
        <div className="info-tip" ref={rootRef} data-open={open || undefined}>
            <button
                type="button"
                className="info-tip__button"
                aria-label={label}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((o) => !o)}
            >
                <svg viewBox="0 0 16 16" width={14} height={14} aria-hidden>
                    <circle
                        cx="8"
                        cy="8"
                        r="7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M8 7v4.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                    <circle cx="8" cy="4.6" r="1" fill="currentColor" />
                </svg>
            </button>
            <div id={panelId} role="note" className="info-tip__panel">
                {children}
            </div>
        </div>
    )
}
