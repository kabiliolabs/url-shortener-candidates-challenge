import { Flex, Text } from "@radix-ui/themes";

interface StatPillProps {
  label: string;
  value: string;
  tone: "lavender" | "sky" | "sage";
}

const toneBackgrounds: Record<StatPillProps["tone"], string> = {
  lavender: "var(--pastel-lavender-soft)",
  sky: "var(--pastel-sky)",
  sage: "var(--pastel-sage)",
};

export function StatPill({ label, value, tone }: StatPillProps) {
  return (
    <Flex
      align="center"
      gap="2"
      style={{
        background: toneBackgrounds[tone],
        borderRadius: 999,
        padding: "0.4rem 0.9rem",
      }}
    >
      <Text size="2" weight="bold" style={{ color: "var(--ink-900)" }}>
        {value}
      </Text>
      <Text size="1" color="gray" weight="medium">
        {label}
      </Text>
    </Flex>
  );
}
