import { Svg, type IconProps } from "./Svg";

export const FogIcon = (props: IconProps) => (
  <Svg {...props}>
    <path className="wx-cloud" d="M7 15h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.4 1.1A3.5 3.5 0 0 0 7 15z" />
    <path className="wx-fog" d="M4 18.5h12M8 21.5h12" />
  </Svg>
);
