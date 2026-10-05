import { Svg, type IconProps } from "./Svg";

export const SunIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle className="wx-sun" cx={12} cy={12} r={4} />
    <path className="wx-sun-rays" d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </Svg>
);
