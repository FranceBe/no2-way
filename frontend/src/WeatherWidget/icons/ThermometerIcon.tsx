import { Svg, type IconProps } from "./Svg";

export const ThermometerIcon = (props: IconProps) => (
  <Svg {...props}>
    <path className="wx-thermo" d="M14 14.76V4.5a2 2 0 0 0-4 0v10.26a4 4 0 1 0 4 0z" />
    <path className="wx-thermo-level" d="M12 17.5V9" />
    <circle className="wx-thermo-level" cx={12} cy={17.5} r={1.5} />
  </Svg>
);
