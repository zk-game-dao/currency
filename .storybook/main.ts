import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../ui/**/*.mdx", "../ui/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/experimental-addon-test",
  ],
  env: (config) => ({
    ...config,
    NODE_ENV:
      config?.NODE_ENV || process === undefined
        ? process.env.NODE_ENV || "development"
        : "development",
  }),

  staticDirs: ["../node_modules/@zk-game-dao/ui/assets"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: {
    builder: "@storybook/builder-vite",
  },
};

export default config;
