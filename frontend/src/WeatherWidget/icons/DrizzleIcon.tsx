import { Svg, type IconProps } from "./Svg";

export const DrizzleIcon = (props: IconProps) => (
  <Svg {...props}>
    <path className="wx-cloud wx-cloud--wet" d="M7 15h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.4 1.1A3.5 3.5 0 0 0 7 15z" />
    <g className="wx-drizzle" stroke="none">
      <circle cx={8} cy={18.5} r={1} />
      <circle cx={12} cy={19.5} r={1} />
      <circle cx={16} cy={18.5} r={1} />
      <circle cx={10} cy={22} r={1} />
      <circle cx={14} cy={22} r={1} />
    </g>
  </Svg>
);
