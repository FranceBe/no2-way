import { Svg, type IconProps } from './Svg'

export const WindIcon = (props: IconProps) => (
    <Svg {...props}>
        <g className="wx-wind">
            <path d="M3 8h9.5a2.5 2.5 0 1 0-2.5-2.5" />
            <path d="M3 12h14.5a3 3 0 1 1-3 3" />
            <path d="M3 16h6" />
        </g>
    </Svg>
)
