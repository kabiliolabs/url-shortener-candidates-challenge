import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyButton } from "./CopyButton";

const meta: Meta<typeof CopyButton> = {
  title: "UI/CopyButton",
  component: CopyButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CopyButton>;

export const Default: Story = {
  args: { text: "https://example.com/s/abc123" },
};

export const CustomLabel: Story = {
  args: { text: "https://example.com/s/abc123", label: "Copy URL" },
};
