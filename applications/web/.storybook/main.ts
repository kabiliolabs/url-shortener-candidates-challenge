import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../app/components/**/*.stories.tsx"],
  addons: [],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal(config) {
    // Filter out react-router plugins that conflict with Storybook.
    // Plugins can be nested arrays, so we flatten first.
    const flat = (config.plugins || []).flat(Infinity);
    config.plugins = flat.filter((plugin) => {
      const name =
        plugin && typeof plugin === "object" && "name" in plugin
          ? (plugin as { name: string }).name
          : "";
      return !name.includes("react-router");
    });
    config.plugins.push(tailwindcss(), tsconfigPaths());
    return config;
  },
};

export default config;
