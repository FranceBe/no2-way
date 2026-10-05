// Shared wrapper for all weather icons: 24x24, stroke-based. Colours come from the .wx-* classes in icons.css (currentColor as fallback)
import type { ReactNode, SVGProps } from 'react'
import './icons.css'

export type IconProps = SVGProps<SVGSVGElement> & {
    size?: number
    title?: string
}

// Shared wrapper: decorative by default, accessible when a title is given
export function Svg({
    size = 24,
    title,
    children,
    ...props
}: IconProps & { children: ReactNode }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            role={title ? 'img' : undefined}
            aria-hidden={title ? undefined : true}
            {...props}
        >
            {title && <title>{title}</title>}
            {children}
        </svg>
    )
}
