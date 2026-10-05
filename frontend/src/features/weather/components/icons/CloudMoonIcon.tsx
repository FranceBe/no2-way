import { Svg, type IconProps } from './Svg'

export const CloudMoonIcon = (props: IconProps) => (
    <Svg {...props}>
        <path
            className="wx-moon"
            d="M11.5 7.9A4.5 4.5 0 1 1 6.6 3a3.5 3.5 0 0 0 4.9 4.9z"
        />
        <path
            className="wx-cloud"
            d="M9 20h9a3.5 3.5 0 0 0 0-7 4.8 4.8 0 0 0-9.1 1A3 3 0 0 0 9 20z"
        />
    </Svg>
)
