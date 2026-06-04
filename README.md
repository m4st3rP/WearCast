# WearCast 🌤️👕

A fully offline-capable Progressive Web App (PWA) that checks your local weather and recommends clothing based on your personalized temperature thresholds. Built with SvelteKit, TailwindCSS v4, Open-Meteo, and Capacitor (for Android APK generation).

## Features
- **Fully Local & Private**: Weather config and preferences strictly saved to `localStorage`.
- **Offline PWA**: Uses service workers to work seamlessly offline, cache UI assets, and install to your home screen.
- **No API Keys**: Uses Open-Meteo's free geocoding and weather APIs to fully bypass CORS and backend proxies.
- **Dark Mode**: Fully supports manual toggling or system `prefers-color-scheme`.
- **Android APK**: Native device wrapper through Capacitor.

## Development Setup

Install dependencies via `pnpm`:

```sh
pnpm install
```

Start the Vite development server:

```sh
pnpm run dev
```

## Static Web Build (GitHub Pages)

To compile the application as a strict Single Page Application (SPA / Static Web Assets):

```sh
pnpm run build
```
This will output everything into the `build/` directory. (Note: This repository contains a GitHub Actions workflow to automatically deploy this `build/` folder to GitHub Pages when pushing to the `main` branch).

## Android Native Build (Capacitor)

Capacitor wraps the web build in a native Android WebView.

**1. Sync web assets with native code**  
Every time you make changes to the Svelte codebase, you need to build the frontend and sync it to the Android platform folder:
```bash
pnpm run build
pnpm exec cap sync android
```

**2. Open Android Studio**  
To open the Android project in Android Studio (for compilation to `.apk`, running on an emulator, or direct device debugging):
```bash
pnpm exec cap open android
```

In Android Studio, let Gradle sync complete, and click the **Run** button to launch the APK in your emulator or physical device.

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
