const simpleImportSort = require("eslint-plugin-simple-import-sort");
const prettier = require("eslint-plugin-prettier");
const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

// Create a clean version of the globals without whitespace in keys
const cleanGlobals = {};

// Process browser globals to remove any whitespace in keys
const cleanBrowserGlobals = {};
Object.keys(globals.browser).forEach(key => {
    const cleanKey = key.trim();
    cleanBrowserGlobals[cleanKey] = globals.browser[key];
});

// Process amd globals
const cleanAmdGlobals = {};
Object.keys(globals.amd).forEach(key => {
    const cleanKey = key.trim();
    cleanAmdGlobals[cleanKey] = globals.amd[key];
});

// Process node globals
const cleanNodeGlobals = {};
Object.keys(globals.node).forEach(key => {
    const cleanKey = key.trim();
    cleanNodeGlobals[cleanKey] = globals.node[key];
});

module.exports = [{
    ignores: ["**/node_modules/", "**/dist/", "**/*.log"],
}, ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:prettier/recommended",
), {
    plugins: {
        "simple-import-sort": simpleImportSort,
        prettier,
    },

    languageOptions: {
        globals: {
            ...cleanBrowserGlobals,
            ...cleanAmdGlobals,
            ...cleanNodeGlobals,
        },

        parser: tsParser,
        ecmaVersion: 2020,
        sourceType: "module",

        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },

    settings: {
        react: {
            version: "detect",
        },

        "import/resolver": {
            node: {
                paths: ["src"],
                extensions: [".js", ".jsx", ".ts", ".tsx"],
            },
        },
    },

    rules: {
        "prettier/prettier": ["error", {}, {
            usePrettierrc: true,
        }],

        "react/react-in-jsx-scope": "off",
        "jsx-a11y/accessible-emoji": "off",
        "react/prop-types": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",

        "jsx-a11y/anchor-is-valid": ["error", {
            components: ["Link"],
            specialLink: ["hrefLeft", "hrefRight"],
            aspects: ["invalidHref", "preferButton"],
        }],
    },
}];