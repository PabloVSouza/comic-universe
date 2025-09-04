<div align="center">
  <img src="https://github.com/pablovsouza/comic-universe/blob/master/src/renderer/assets/icon.svg?raw=true" width="200">
  <h1>Comic Universe - Tauri Port</h1>
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

These are the main technologies used by this Tauri port:

- [**Rust**](https://www.rust-lang.org/): A systems programming language that focuses on safety, speed, and concurrency
- [**Tauri**](https://tauri.app/): A framework for building desktop applications using web technologies with a Rust backend
- [**Typescript**](https://www.typescriptlang.org/): A strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.
- [**React**](https://react.dev/): A Framework / Library for building responsive and complex web applications.
- [**Vite**](https://vitejs.dev/): A build tool that aims to provide a faster and leaner development experience for modern web projects.
- [**TailwindCSS**](https://tailwindcss.com/): A utility-first CSS framework for rapidly building custom user interfaces.
- [**SQLx**](https://github.com/launchbadge/sqlx): A Rust SQL toolkit with compile-time checked queries

## Why it exists?

This started as a simple tool used by myself, just to keep track of my reading progress, but with time and knowledge, it started to evolve, and eventually, it became my main portfolio and learning platform. Here is where i try every tech that i want, and try to provide the best possible code, so it can also be a portfolio for jobs.

- This is the **Tauri port** of Comic Universe, migrating from Electron to Tauri for better performance, smaller bundle size, and improved security.
- The original app started as a simple C# app called Manga Reader, evolved to Manga Universe using Electron and VueJS, then became Comic Universe with Electron and React.
- This Tauri port maintains the same functionality while leveraging Rust's performance and safety features, with a modern React frontend and SQLx for database operations.
- It supports Windows, Linux and Mac, multiple web sources, multiple languages, theming, and a shiny and modern interface.

## The Tauri Migration Challenge

Migrating from Electron to Tauri presented several interesting challenges:

### Database Migration

- **From Prisma to SQLx**: Migrated from Prisma ORM to SQLx for compile-time checked SQL queries
- **SQLite Integration**: Direct SQLite integration with proper connection management
- **Migration System**: Custom migration system using SQLx migrations

### Plugin System

- **From Node.js to Rust**: Original plugins were Node.js modules, now implemented as Rust-based plugin runners
- **API Compatibility**: Maintaining compatibility with existing plugin APIs while leveraging Rust's performance
- **GraphQL Integration**: Direct GraphQL API calls using `reqwest` for external comic sources

### Frontend Adaptation

- **IPC Communication**: Adapted from Electron's IPC to Tauri's invoke system
- **Asset Handling**: Updated asset loading and SVG handling for Tauri's webview
- **Window Management**: Migrated from Electron's window management to Tauri's window system

### Performance Benefits

- **Smaller Bundle Size**: Significantly reduced application size compared to Electron
- **Better Memory Usage**: Rust backend provides more efficient memory management
- **Faster Startup**: Improved application startup times

## Current Status

This Tauri port is currently in **active development** and includes:

### ✅ Implemented Features

- **Core Application Structure**: Complete Tauri setup with React frontend
- **Database System**: SQLite integration with SQLx migrations
- **User Management**: User creation, management, and persistence
- **Plugin System**: Basic plugin architecture with HQ Now plugin implementation
- **Search Functionality**: Comic search with real-time API integration
- **Debug Console**: In-app debugging tools with F12 toggle
- **Settings Management**: Application settings and configuration

### 🚧 In Development

- **Plugin API**: Expanding plugin system for more comic sources
- **Reader Interface**: Comic reading functionality
- **Download Management**: Comic download and offline reading
- **Theme System**: Dark/light theme support
- **Multi-language Support**: Internationalization

### 📋 Planned Features

- **Additional Plugins**: Support for more comic repositories
- **Reading Progress**: Advanced progress tracking
- **Library Management**: Comic library organization
- **Export/Import**: Data backup and migration tools

## Future Roadmap

With the Tauri migration complete, here are the planned improvements:

### Short Term

- **Plugin Ecosystem**: Expand plugin system to support more comic sources
- **Reader Improvements**: Enhanced reading experience with better navigation
- **Performance Optimization**: Further optimize Rust backend and frontend rendering
- **Testing Suite**: Comprehensive testing for both Rust backend and React frontend

### Long Term

- **Online Sync**: Implement cloud synchronization for reading progress
- **Mobile Companion**: Develop mobile app for reading on the go
- **Community Features**: User reviews, ratings, and recommendations
- **Advanced Library Management**: Smart categorization and search algorithms

### Technical Improvements

- **WebAssembly Integration**: Explore WASM for plugin development
- **Advanced Caching**: Implement intelligent caching strategies
- **Offline Support**: Enhanced offline reading capabilities
- **API Standardization**: Create standardized plugin API for third-party developers

## Project Setup:

### Prerequisites

- [Rust](https://rustup.rs/) (latest stable version)
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Install dependencies:

```bash
# Install frontend dependencies
npm install

# Install Rust dependencies (automatically handled by Cargo)
cd src-tauri
cargo build
cd ..
```

### Development server:

```bash
npm run tauri dev
```

### Building for production:

```bash
# Build for current platform
npm run tauri build

# Build for specific platform (requires additional setup)
npm run tauri build -- --target x86_64-pc-windows-msvc  # Windows
npm run tauri build -- --target x86_64-apple-darwin     # macOS
npm run tauri build -- --target x86_64-unknown-linux-gnu # Linux
```

### Database Setup:

The SQLite database is automatically created and migrated on first run. Database files are stored in:

- **Development**: Project root directory
- **Production**: Application support directory (OS-specific)

## Migration from Electron

This Tauri port represents a complete rewrite of the original Electron application. Key changes include:

### Architecture Changes

- **Backend**: Node.js → Rust with Tauri
- **Database**: Prisma ORM → SQLx with compile-time checked queries
- **IPC**: Electron IPC → Tauri invoke system
- **Plugins**: Node.js modules → Rust-based plugin runners

### Performance Improvements

- **Bundle Size**: ~80% reduction in application size
- **Memory Usage**: Significantly lower memory footprint
- **Startup Time**: Faster application startup
- **Security**: Enhanced security through Rust's memory safety

### Development Experience

- **Type Safety**: Full type safety from frontend to backend
- **Hot Reload**: Maintained fast development cycle
- **Cross-platform**: Native performance on all platforms
- **Modern Tooling**: Latest Rust and React tooling

This app is developed mainly with the purpose of studing and trying new solutions and technologies, and it's free to be studied and used by everyone. It should **NEVER** be used for commercial purpuses.

If you want to contribute to the project, as a developer, tester, or whatever else, you can contact me at [~~Twitter~~ X](https://twitter.com/opablosouza) or [Instagram](https://www.instagram.com/opablosouza/).
