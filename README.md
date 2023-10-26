# Comic Universe

This is my personal project, it's the third iteration of my previously called Manga-Reader on its first C# Iteration, and then Manga Universe, when it was rebuild using Electron and VueJS, and now on this latest iteration, it's called Comic Universe, and as the name implies, having support for not only Mangas, but also HQ's (and eventually Manhwa).

It was originally created so I could keep track of my reading progress, while also having a easy way of getting new chapters through web scraping, all on the same platform.

It evolved together with my experience as a developer, and now on it's third fully rebuild iteration, it's a (almost) fully featured app, with suport for Windows, Linux and Mac, multiple web sources, multiple languages, themming, and a shiny and modern new interface.

The App is built using the following technologies

- Typescript
- ElectronJS
- ReactJS
- Vite
- Prisma
- SQLite

If you are an electron developer, you probably understand the challenge of using prisma with sqlite on a bundled app like this.

Some of those challenges are:

- Create the database file outside the app bundle, for preserving the data
- Connect to the database on a path that is not on the env file
- Running the necessary migrations when needed
- Having all those processes invisible and action free to the end user.

One of the main goals was to make the app as simple to use and to setup as possible, with no extra steps required to the user.

The solution I've found for attending those requirements was to create a bunch of custom classes to initialize and run everything inside the node part of the app, and this solution was heavilly inspired (but not the same) by this excelent [Article](https://dev.to/awohletz/running-prisma-migrate-in-an-electron-app-1ehm) and [Repository](https://github.com/awohletz/electron-prisma-trpc-example) from [Ayron Wohletz](https://twitter.com/ayron_wohletz).

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
yarn build:mac (win)
```

This app was/is developed mainly for my personal studies, and will keep evolving as i'm studing new things. As so, it will probably be never used for comercial purpuses.

If you want to contribute to the project, as a developer, or tester, or whatever else, you can contact me at [~~Twitter~~ X](https://twitter.com/opablosouza) or [Instagram](https://www.instagram.com/opablosouza/).
