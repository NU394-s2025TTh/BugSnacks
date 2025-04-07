# Vite + React + Typescript + Eslint + Prettier: an example repo Updated for 2025!

A starter for React with Typescript with the fast Vite, Vitest and all static code testing with Eslint and formatting with Prettier. As of this writing updated to React 19; and the latest versions of all tools as of March 2025. This was built for use by the [Northwestern University CS394 Class taught by Todd Warren](https://toddwseattle.com/blog/2025-02-05-CS394-2025-Spring-Software-Engineering-Course/)

Once up and running it looks like this:

![Vite + React + Typescript + Vitest + Eslint + Prettier](/resources/2025-screenshot.png)

You can find more about these in the following links: [Vite](https://vitejs.dev), [React](https://reactjs.org/), [Typescript](https://www.typescriptlang.org/), [Eslint](https://eslint.org/), [Prettier](https://prettier.io/), [Vitest](https://vitest.dev/)

## Installation

- Make sure you are running node 20 or later
- npm 10.x or higher (comes with Node.js 20)

```
node --version
```

Clone the repo and run `npm install`

or preferred Run command

```
npx degit toddwseattle/pretty-vitest-react-ts-template project-name
```

this will create a clean version of the template in the `project-name` folder. omit project-name to create in the current directory. You will then need to initialize git yourself and push to github.

## Start

Install packages: `npm run dev`

## Steps in Vscode

#### (works better with this template)

1. Install Eslint and prettier extension for vs code (separate extensions; not the combined one)
2. Make Sure Both are enabled
3. Make sure all packages are Installed. (Mostly Eslint and prettier in node_modules)
4. Enable formatOnSave of vs code
5. Open a .tsx file and check if the bottom right corners of vs code have Eslint and Prettier with a double tick

![Screenshot (253)_LI](https://user-images.githubusercontent.com/52120562/162486286-7383a737-d555-4f9b-a4dd-c4a81deb7b96.jpg)

If Everything is Good Then It Should Work, but let me new if something else happens.

## pre-commit hook to lint files with eslint/prettier

In this template, when you commit via `git commit` a [pre-commit hook](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) runs the command `npm run lint`, so that eslint and prettier are run and modify the files to conform. Consequently, you may end up with new changes after you commit! The easiest way to make sure you get a clean commit is to `npm run lint` before you commit.

The npm command used in pre-commit is in the package.json key ` "pre-commit": "lint"`. Change or remove this as you see fit for your project.

## Authorship and acknowledgments

This was based on a [starter made with ❤️ by theSwordBreaker](https://github.com/TheSwordBreaker/vite-reactts-eslint-prettier). Thanks theSwordBreaker for the starter and vscode screenshots! It's been enhanced with vitest by toddwseattle using the best of the [js react starter](https://github.com/criesbeck/react-vitest) from [c-riesbeck](https://users.cs.northwestern.edu/~riesbeck/) for use by Northwestern University CS 394 students and others who like consistent looking typescript code.
