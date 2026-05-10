import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: { children: "This is an info alert", variant: "info" },
};

export const Success: Story = {
  args: { children: "Operation successful!", variant: "success" },
};

export const Warning: Story = {
  args: { children: "Please be careful", variant: "warning" },
};

export const Error: Story = {
  args: { children: "Something went wrong", variant: "error" },
};
