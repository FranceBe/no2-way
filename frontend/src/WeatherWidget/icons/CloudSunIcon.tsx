import { Svg, type IconProps } from "./Svg";

export const CloudSunIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle className="wx-sun" cx={8} cy={8} r={3} />
    <path className="wx-sun-rays" d="M8 2v1.5M2 8h1.5M3.76 3.76l1.06 1.06M12.24 3.76l-1.06 1.06M3.76 12.24l1.06-1.06" />
    <path className="wx-cloud" d="M9 20h9a3.5 3.5 0 0 0 0-7 4.8 4.8 0 0 0-9.1 1A3 3 0 0 0 9 20z" />
  </Svg>
);
