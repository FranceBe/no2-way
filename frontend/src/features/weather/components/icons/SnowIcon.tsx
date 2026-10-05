import { Svg, type IconProps } from './Svg'

export const SnowIcon = (props: IconProps) => (
    <Svg {...props}>
        <path
            className="wx-cloud"
            d="M7 15h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.4 1.1A3.5 3.5 0 0 0 7 15z"
        />
        <g className="wx-snow" strokeWidth={1.25}>
            <path d="M8 17.7v2.6M6.87 18.35l2.26 1.3M6.87 19.65l2.26-1.3" />
            <path d="M12 20.2v2.6M10.87 20.85l2.26 1.3M10.87 22.15l2.26-1.3" />
            <path d="M16 17.7v2.6M14.87 18.35l2.26 1.3M14.87 19.65l2.26-1.3" />
        </g>
    </Svg>
)
