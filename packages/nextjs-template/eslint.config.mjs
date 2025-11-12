import next from "eslint-config-next";

export default [
  ...next,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/rules-of-components": "off",
      "react/no-unstable-components": "off",
      "react/no-unstable-nested-components": "off",
      "react-hooks/rules-of-components": "off",
    },
  },
];
