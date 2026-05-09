import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: "Button", variant: "primary" },
};

export const Secondary: Story = {
  args: { children: "Button", variant: "secondary" },
};

export const Ghost: Story = {
  args: { children: "Button", variant: "ghost" },
};

export const Loading: Story = {
  args: { children: "Loading...", loading: true },
};

export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
};

export const Small: Story = {
  args: { children: "Small", size: "sm" },
};

export const Large: Story = {
  args: { children: "Large", size: "lg" },
};
