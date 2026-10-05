import { Svg, type IconProps } from "./Svg";

export const ThunderstormIcon = (props: IconProps) => (
  <Svg {...props}>
    <path className="wx-cloud wx-cloud--storm" d="M7 15h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.4 1.1A3.5 3.5 0 0 0 7 15z" />
    <path className="wx-bolt" d="M13 15.5l-2.5 3.5h3.5l-2.5 3.5" />
  </Svg>
);
