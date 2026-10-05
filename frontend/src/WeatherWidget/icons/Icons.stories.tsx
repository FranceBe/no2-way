import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CloudIcon,
  CloudMoonIcon,
  CloudSunIcon,
  DrizzleIcon,
  DropletIcon,
  FogIcon,
  MoonIcon,
  RainIcon,
  SnowIcon,
  SunIcon,
  ThermometerIcon,
  ThunderstormIcon,
  WindIcon,
  type IconProps,
} from ".";

const meta = {
  title: "Weather/Icons",
  parameters: { layout: "centered" },
  args: { size: 96 },
  argTypes: {
    size: { control: { type: "range", min: 16, max: 192, step: 8 } },
    strokeWidth: { control: { type: "range", min: 0.5, max: 3, step: 0.25 } },
  },
} satisfies Meta<IconProps>;

export default meta;
type Story = StoryObj<typeof meta>;

const icons = {
  Sun: SunIcon,
  Moon: MoonIcon,
  CloudSun: CloudSunIcon,
  CloudMoon: CloudMoonIcon,
  Cloud: CloudIcon,
  Fog: FogIcon,
  Drizzle: DrizzleIcon,
  Rain: RainIcon,
  Snow: SnowIcon,
  Thunderstorm: ThunderstormIcon,
  Wind: WindIcon,
  Thermometer: ThermometerIcon,
  Droplet: DropletIcon,
};

// ---------- Every icon in one grid ----------

export const Gallery: Story = {
  args: { size: 48 },
  render: (args) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 110px)", gap: 24 }}>
      {Object.entries(icons).map(([name, Icon]) => (
        <figure key={name} style={{ margin: 0, display: "grid", justifyItems: "center", gap: 8 }}>
          <Icon {...args} />
          <figcaption style={{ fontSize: 13 }}>{name}</figcaption>
        </figure>
      ))}
    </div>
  ),
};

// ---------- One story per icon ----------

export const Sun: Story = { render: (args) => <SunIcon {...args} /> };
export const Moon: Story = { render: (args) => <MoonIcon {...args} /> };
export const CloudSun: Story = { render: (args) => <CloudSunIcon {...args} /> };
export const CloudMoon: Story = { render: (args) => <CloudMoonIcon {...args} /> };
export const Cloud: Story = { render: (args) => <CloudIcon {...args} /> };
export const Fog: Story = { render: (args) => <FogIcon {...args} /> };
export const Drizzle: Story = { render: (args) => <DrizzleIcon {...args} /> };
export const Rain: Story = { render: (args) => <RainIcon {...args} /> };
export const Snow: Story = { render: (args) => <SnowIcon {...args} /> };
export const Thunderstorm: Story = { render: (args) => <ThunderstormIcon {...args} /> };
export const Wind: Story = { render: (args) => <WindIcon {...args} /> };
export const Thermometer: Story = { render: (args) => <ThermometerIcon {...args} /> };
export const Droplet: Story = { render: (args) => <DropletIcon {...args} /> };
