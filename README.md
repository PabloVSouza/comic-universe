<div align="center">
  <img src="https://github.com/pablovsouza/comic-universe/blob/Version-2.0/src/renderer/assets/icon.svg?raw=true" width="200">
  <h1>Comic Universe</h1>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" />
  <a href="https://github.com/prisma/prisma/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" /></a>
  <a href="https://discord.gg/gPsQkDGDfc"><img alt="Discord" src="https://img.shields.io/discord/1270554232260526120?label=Discord"></a>
  <br />
  <br />
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://www.instagram.com/opablosouza/">Instagram</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://discord.gg/gPsQkDGDfc">Discord</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://x.com/opablosouza">X (Twitter)</a>
  <br />
  <hr />
</div>

## What is Comic Universe?

**Comic Universe** is a Desktop App for reading and keeping track of your reading progress while having a nice and easy to use interface for the best experience possible.

These are the main technologies used by this app:

- [**NodeJS**](https://nodejs.org/): A free, open-source, cross-platform JavaScript runtime environment
- [**ElectronJS**](https://www.electronjs.org/): A framework for building desktop applications using JavaScript, HTML, and CSS.
- [**Typescript**](https://www.typescriptlang.org/): A strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.
- [**React**](https://react.dev/): A Framework / Library for building responsive and complex web applications.
- [**Vite**](https://vitejs.dev/): A build tool that aims to provide a faster and leaner development experience for modern web projects.
- [**SASS**](https://sass-lang.com/): A stylesheet language that’s compiled to CSS.
- [**Electron Vite**](https://electron-vite.org/): A build tool and template for creating apps using Electron and Vite.

## Why it exists?

This started as a simple tool used by myself, just to keep track of my reading progress, but with time and knowledge, it started to evolve, and eventually, it became my main portfolio and learning platform. Here is where i try every tech that i want, and try to provide the best possible code, so it can also be a portfolio for jobs.

- This is the third iteration of the app, that first started as a simple C# app called Manga Reader. Eventually, i started the development from the ground up using web technologies, and it became Manga Universe, using Electron and VueJS. And now, on it's third iteration, it's still using electron (maybe Tauri in the future), and now React, Typescript and Vite.
- As an electron app, it have some nice features, but also a few challenges with some libraries (Like Prisma ORM), forcing me to create new solutions.
- It evolved together with my experience as a developer, and now on it's third fully rebuild iteration, it's a (almost) fully featured app, with suport for Windows, Linux and Mac, multiple web sources, multiple languages, themming, and a shiny and modern new interface.

## The Challenge

If you are an electron developer, you probably understand the challenge of using prisma with sqlite on a bundled app like this.

Some of those challenges are:

- Create the database file outside the app bundle, for preserving the data
- Connect to the database on a path that is not on the env file
- Running the necessary migrations when needed
- Having all those processes invisible and action free to the end user.

One of the main goals was to make the app as simple to use and to setup as possible, with no extra steps required to the user.

After studing for a long time and trying different solutions, i've found this excelent [Article](https://dev.to/awohletz/running-prisma-migrate-in-an-electron-app-1ehm) and [Repository](https://github.com/awohletz/electron-prisma-trpc-example) from [Ayron Wohletz](https://twitter.com/ayron_wohletz).

Based on Ayron findings, and developing a few solutions of my own, a new package was created, called [Prisma Packaged](https://github.com/pablovsouza/prisma-packaged)(I know it's a bad name), and all of the app's database interations are made using this package as a prisma's assistant.

## Project Setup:

### Install dependencies:

```
yarn
```

### Generating the database client for development

```
npx prisma generate
```

### Development server:

```
yarn dev
```

### Building for production:

```
yarn build:platform name (eg: Mac, Win, Linux)
```

This app is developed mainly with the purpose of studing and trying new solutions and technologies, and it's free to be studied and used by everyone. It should **NEVER** be used for commercial purpuses.

If you want to contribute to the project, as a developer, tester, or whatever else, you can contact me at [~~Twitter~~ X](https://twitter.com/opablosouza) or [Instagram](https://www.instagram.com/opablosouza/).
