<div align="center">
  <img src="https://github.com/pablovsouza/comic-universe/blob/main/src/renderer/assets/icon.svg?raw=true" width="200">
  <h1>Comic Universe</h1>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" />
  <a href="https://github.com/pablovsouza/comic-universe/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" /></a>
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
- [**Drizzle ORM**](https://orm.drizzle.team/): A lightweight, type-safe ORM for TypeScript with excellent performance and small bundle size.
- [**SQLite**](https://www.sqlite.org/): A lightweight, serverless database engine perfect for desktop applications.
- [**Winston**](https://github.com/winstonjs/winston): A comprehensive logging library for Node.js applications.
- [**SASS**](https://sass-lang.com/): A stylesheet language that's compiled to CSS.
- [**Electron Vite**](https://electron-vite.org/): A build tool and template for creating apps using Electron and Vite.

## Why it exists?

This started as a simple tool used by myself, just to keep track of my reading progress, but with time and knowledge, it started to evolve, and eventually, it became my main portfolio and learning platform. Here is where i try every tech that i want, and try to provide the best possible code, so it can also be a portfolio for jobs.

- This is the third iteration of the app, that first started as a simple C# app called Manga Reader. Eventually, i started the development from the ground up using web technologies, and it became Manga Universe, using Electron and VueJS. And now, on it's third iteration, it's still using electron (maybe Tauri in the future), and now React, Typescript and Vite.
- As an electron app, it have some nice features, but also a few challenges with some libraries, forcing me to create new solutions and migrate to more suitable alternatives.
- It evolved together with my experience as a developer, and now on it's third fully rebuild iteration, it's a (almost) fully featured app, with suport for Windows, Linux and Mac, multiple web sources, multiple languages, themming, and a shiny and modern new interface.

## The Challenge

If you are an electron developer, you probably understand the challenge of using ORMs with sqlite on a bundled app like this.

Some of those challenges are:

- Create the database file outside the app bundle, for preserving the data
- Connect to the database on a path that is not on the env file
- Running the necessary migrations when needed
- Having all those processes invisible and action free to the end user.

One of the main goals was to make the app as simple to use and to setup as possible, with no extra steps required to the user.

After studying for a long time and trying different solutions, the app has evolved from using Prisma ORM to **Drizzle ORM**, which provides better performance, smaller bundle size, and more straightforward integration with Electron applications. The database layer is now built with an ORM-agnostic architecture, making it easy to switch between different database solutions if needed.

## Key Features

### 🗄️ **Modern Database Architecture**

- **ORM-Agnostic Design**: Built with interfaces that allow switching between different ORMs
- **Drizzle ORM**: Lightweight, type-safe, and performant database operations
- **Automatic Migrations**: Seamless database schema updates
- **Type Safety**: Full TypeScript support with zero `any` types

### 📊 **Comprehensive Logging & Error Handling**

- **Structured Logging**: Winston-based logging with daily rotation
- **Error Boundaries**: Robust error handling throughout the application
- **Performance Monitoring**: Operation duration tracking and metrics
- **Development vs Production**: Different logging configurations for each environment

### 🔌 **Plugin System**

- **Dynamic Plugin Loading**: Add new comic repositories without code changes
- **Plugin Template**: Ready-to-use template for developing new plugins
- **Repository Management**: Centralized plugin and repository handling

## 2.0.0 is almost here!

Version 2.0.0 is being developed for a while, and it's the culmination of a lot o dreams that i've had for the app since it's conception (I'm looking at you, Plugin System), so if you like the project, you should be exited for what's coming!

### We need plugins!

Version 2.0.0 will include a new Plugin system, to add new comic repositories in a more dynamic way.

The template for developing new plugins is ready, and you can find and fork it [here](https://github.com/pablovsouza/comic-universe-plugin-template).

## Plans for the Future?

I have a few possible paths to improve the app on the future, and here's my current list of maybe's:

- Migrate from electron's IPC communication to something like a TRPC, isolating the frontend from electron, and creating the possibility of running it as a web project.
- Implement a backend for online sync.
- Migrate from Electron to Tauri (Really far).
- Have a unified comic list to create a relation with the comics from the plugins.

And who knows how the project evolves...

## Project Setup:

### Install dependencies:

```bash
npm install
```

### Development server:

```bash
npm run dev
```

### Building for production:

```bash
npm run build
```

### Available Scripts:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

This app is developed mainly with the purpose of studing and trying new solutions and technologies, and it's free to be studied and used by everyone. It should **NEVER** be used for commercial purpuses.

If you want to contribute to the project, as a developer, tester, or whatever else, you can contact me at [~~Twitter~~ X](https://twitter.com/opablosouza) or [Instagram](https://www.instagram.com/opablosouza/).
