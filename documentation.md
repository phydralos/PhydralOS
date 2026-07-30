# Pyhdra OS — External App Developer Documentation

> **Version:** 1.0
> **Target audience:** Developers building apps for Pyhdra OS
> **Tech stack:** React, Next.js, TypeScript, Firebase, BrowserFS

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Two App Types: Built-in vs External](#2-two-app-types-built-in-vs-external)
3. [App Manifest Specification](#3-app-manifest-specification)
4. [Packaging Your App as a .zip](#4-packaging-your-app-as-a-zip)
5. [Installation Flow](#5-installation-flow)
6. [How LoadedApp Works](#6-how-loadedapp-works)
7. [Account Bridge API (pyhdraAccount)](#7-account-bridge-api-pyhdraaccount)
8. [File System API](#8-file-system-api)
9. [Process Manager API](#9-process-manager-api)
10. [Session Context API](#10-session-context-api)
11. [Auth Context API](#11-auth-context-api)
12. [AppStore & Firebase Integration](#12-appstore--firebase-integration)
13. [Window Properties & Decorations](#13-window-properties--decorations)
14. [Building a Built-in App (Advanced)](#14-building-a-built-in-app-advanced)
15. [Testing & Debugging](#15-testing--debugging)
16. [Full Example: Minimal External App](#16-full-example-minimal-external-app)

---

## 1. Architecture Overview

Pyhdra OS is a web-based operating system that runs entirely in the browser. It simulates a desktop environment with windows, a taskbar, a file system, and an app store.

```
┌─────────────────────────────────────────────────┐
│                  Pyhdra OS                       │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Window    │  │ Process  │  │  File System │  │
│  │  Manager   │  │ Manager  │  │  (BrowserFS) │  │
│  └───────────┘  └──────────┘  └──────────────┘  │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Session   │  │   Auth   │  │   AppStore   │  │
│  │  Context   │  │ Context  │  │   (Firebase) │  │
│  └───────────┘  └──────────┘  └──────────────┘  │
│                       │                          │
│              ┌────────┴────────┐                 │
│              │   App Directory  │                 │
│              │  (process registry)│                 │
│              └─────────────────┘                 │
└─────────────────────────────────────────────────┘
```

### Key technologies

- **React + Next.js** — UI framework and SSR
- **TypeScript** — type safety throughout
- **BrowserFS** — in-browser file system (OverlayFS: HTTPRequest readable + IndexedDB writable)
- **Firebase** — Authentication, Firestore (user accounts, app store listings, reviews)
- **Styled Components** — styling for built-in apps
- **react-rnd** — draggable/resizable windows

---

## 2. Two App Types: Built-in vs External

### Built-in Apps

Built-in apps are React components registered in the process directory at:

`contexts/process/directory.ts`

They are compiled into the OS bundle and have full access to all OS contexts (file system, process manager, session, auth). Examples: Browser, Terminal, FileExplorer, AppStore.

### External Apps (LoadedApp)

External apps are standalone HTML/CSS/JS applications packaged as `.zip` files. They are installed via the App Installer or App Store and run inside an `<iframe>` sandbox within the `LoadedApp` component.

**External apps:**
- Are loaded from the virtual file system at `/Program Files/<app-id>/`
- Run in a sandboxed iframe (`allow-scripts allow-same-origin allow-forms allow-modals allow-popups`)
- Can communicate with the OS via the **Account Bridge** (`window.pyhdraAccount`) postMessage API
- Have their resource references (scripts, styles, images) automatically resolved to blob URLs
- Cannot directly access React contexts — they interact through the bridge

---

## 3. App Manifest Specification

Every external app must include a `manifest.json` file at the root of its zip package (or inside a subdirectory).

### Schema

```typescript
type AppManifest = {
  // ── Required ──
  id: string;          // Unique app identifier (e.g. "my-awesome-app")
  name: string;        // Display name (e.g. "My Awesome App")
  entry: string;       // Entry HTML file relative to manifest (e.g. "index.html")

  // ── Optional: Window ──
  width?: number;            // Initial window width in px (default: 640)
  height?: number;           // Initial window height in px (default: 480)
  allowResizing?: boolean;   // Whether the window can be resized (default: true)
  hideTitlebar?: boolean;    // Hide the window title bar (default: false)
  hideCloseButton?: boolean; // Hide the close button (default: false)
  hideMinimizeButton?: boolean; // Hide minimize button (default: false)
  hideMaximizeButton?: boolean; // Hide maximize button (default: false)

  // ── Optional: Visual ──
  icon?: string;         // Path to icon relative to app dir (e.g. "icon.png")
  backgroundColor?: string; // Window background color (e.g. "#1a1a2e")

  // ── Optional: Metadata ──
  title?: string;        // Window title (overrides `name` in titlebar)
  source?: "appstore" | "external"; // Set automatically by installer
};
```

### Example manifest.json

```json
{
  "id": "calculator-pro",
  "name": "Calculator Pro",
  "entry": "index.html",
  "width": 360,
  "height": 540,
  "allowResizing": false,
  "icon": "assets/icon.png",
  "backgroundColor": "#1e1e2e",
  "title": "Calculator Pro"
}
```

### Validation rules

- `id` must be unique across all installed apps. It is used as the directory name under `/Program Files/`.
- `name` is used for Desktop and Start Menu shortcut filenames.
- `entry` must point to an existing HTML file within the zip.
- If `icon` is omitted, a default icon (`/System/Icons/loadedapp.svg`) is used.
- If `width` and `height` are both provided, the window resizes to those dimensions on load.

---

## 4. Packaging Your App as a .zip

### Directory structure

```
my-app.zip
├── manifest.json
├── index.html
├── styles/
│   └── main.css
├── scripts/
│   ├── app.js
│   └── utils.js
└── assets/
    ├── icon.png
    └── logo.svg
```

### Rules

- The zip **must** contain a `manifest.json` file, either at the root or inside a subdirectory.
- All resource references in your HTML (`src`, `href`, `url()`) that are relative paths will be automatically resolved and replaced with blob URLs at load time. You do **not** need to handle this yourself.
- Absolute URLs (`http://`, `https://`, `data:`, `blob:`) are left untouched.
- The `manifest.json` and `entry` file must be within the same base directory (or both at root level).

### Creating the zip

```bash
# From inside your app directory:
zip -r my-app.zip manifest.json index.html styles/ scripts/ assets/
```

---

## 5. Installation Flow

### Via App Installer (sideload)

1. User opens the **App Installer** (or double-clicks a `.zip` file).
2. The installer calls `installAppFromZip()` from `utils/appInstaller.ts`.
3. The zip is extracted to `/Program Files/<manifest.id>/`.
4. Shortcuts (`.url` files) are created on the Desktop and in the Start Menu.
5. The app is registered in `/System/installed-apps.json` with `source: "external"`.
6. The app can now be launched from the Desktop or Start Menu.

### Via App Store (Firebase)

1. App developer publishes an app listing to the `appstore_apps` Firestore collection with a `downloadUrl` pointing to the zip file.
2. User purchases/downloads the app from the AppStore.
3. The zip is fetched via `downloadApp()` and then installed through the same `installAppFromZip()` flow with `source: "appstore"`.
4. The purchase is recorded in the user's Firestore document (`purchasedAppIds` array) so the app can be reinstalled on any device after sign-in.

### installed-apps.json

Installed apps are tracked in `/System/installed-apps.json`:

```json
{
  "calculator-pro": {
    "id": "calculator-pro",
    "name": "Calculator Pro",
    "entry": "index.html",
    "icon": "assets/icon.png",
    "source": "appstore",
    "width": 360,
    "height": 540,
    "allowResizing": false
  }
}
```

### Uninstallation

Uninstalling an app:
1. Deletes `/Program Files/<app-id>/` recursively.
2. Removes Desktop and Start Menu shortcuts.
3. Removes the entry from `installed-apps.json`.

---

## 6. How LoadedApp Works

When an external app is launched, the `LoadedApp` component (`components/apps/LoadedApp/index.tsx`) handles the lifecycle:

1. **Reads the manifest** from the app's directory (`<url>/manifest.json`).
2. **Applies window properties** from the manifest (size, resizable, titlebar visibility, etc.) to the process via `argument(id, ...)`.
3. **Reads the entry HTML file** and processes it:
   - Finds all `<script>`, `<link>`, `<img>`, `<source>` tags with relative `src`/`href` attributes.
   - Reads each referenced file from the virtual file system.
   - Creates blob URLs for each resource and replaces the references in the HTML.
   - Also processes `url(...)` references in inline CSS.
4. **Injects the Account Bridge script** (`<script data-pyhdra-account-bridge>`) into the HTML before `</body>`.
5. **Creates a blob URL** for the final HTML and loads it in a sandboxed `<iframe>`.
6. **Listens for postMessage** requests from the iframe to handle Account Bridge calls.

### Iframe sandbox attributes

```
allow-scripts allow-same-origin allow-forms allow-modals allow-popups
```

This means external apps can:
- Run JavaScript
- Access same-origin APIs (blob URLs)
- Submit forms
- Show modals/alerts
- Open popups

They **cannot**:
- Access the top window directly (cross-origin restriction via blob URL)
- Make network requests to the OS's Firebase instance directly
- Modify the OS file system directly (must use the bridge)

---

## 7. Account Bridge API (pyhdraAccount)

The Account Bridge is automatically injected into every external app's HTML. It provides access to the logged-in user's account data via `window.pyhdraAccount`.

### API Reference

#### `window.pyhdraAccount.getProfile()`

Returns the user's account profile.

```javascript
const profile = await window.pyhdraAccount.getProfile();
// Returns: { balance, country, isDeveloper, username } or null
```

#### `window.pyhdraAccount.getBalance()`

Returns the user's wallet balance.

```javascript
const balance = await window.pyhdraAccount.getBalance();
// Returns: number or null
```

#### `window.pyhdraAccount.updateBalance(newBalance)`

Updates the user's wallet balance. **Only available for App Store apps** (`source: "appstore"`). External/sideloaded apps can read but not write.

```javascript
const success = await window.pyhdraAccount.updateBalance(500);
// Returns: true if the update was allowed and succeeded
```

### Permission model

| Action | App Store apps | Sideloaded apps |
|--------|---------------|-----------------|
| `getProfile` | ✅ Read | ✅ Read |
| `getBalance` | ✅ Read | ✅ Read |
| `updateBalance` | ✅ Write | ❌ Denied |

### Example usage in an external app

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <div id="app">
    <h1>Welcome, <span id="username">Guest</span></h1>
    <p>Balance: $<span id="balance">0</span></p>
    <button id="deductBtn">Spend $10</button>
  </div>

  <script>
    (async function() {
      const profile = await window.pyhdraAccount.getProfile();
      if (profile) {
        document.getElementById('username').textContent = profile.username;
        document.getElementById('balance').textContent = profile.balance;
      }

      document.getElementById('deductBtn').addEventListener('click', async () => {
        const currentBalance = await window.pyhdraAccount.getBalance();
        if (currentBalance !== null && currentBalance >= 10) {
          const ok = await window.pyhdraAccount.updateBalance(currentBalance - 10);
          if (ok) {
            document.getElementById('balance').textContent = currentBalance - 10;
            alert('Purchase successful!');
          } else {
            alert('Unable to update balance.');
          }
        } else {
          alert('Insufficient balance.');
        }
      });
    })();
  </script>
</body>
</html>
```

### How the bridge works internally

1. The injected script defines `window.pyhdraAccount` with methods that send `postMessage` to the parent window.
2. The `LoadedApp` component listens for these messages and responds via `postMessage` back to the iframe.
3. Messages are tagged with `__pyhdra: "__pyhdraAccountRequest"` (request) and `__pyhdra: "__pyhdraAccountResponse"` (response).
4. Each request includes a unique `requestId` for correlation.

---

## 8. File System API

The file system is available to **built-in apps** via the `useFileSystem()` hook. External apps do not have direct access — the bridge is the only interface.

### File system architecture

- **Readable layer:** HTTPRequest FS (serves files from the build's `public/` directory via a pre-built index).
- **Writable layer:** IndexedDB (persists across sessions) or InMemory (ephemeral).
- **Overlay:** BrowserFS OverlayFS combines both — reads check writable first, then readable; writes go to writable.

### API (via `useFileSystem()`)

```typescript
const {
  // ── Core FS operations ──
  exists,           // (path: string) => Promise<boolean>
  lstat,            // (path: string) => Promise<Stats>  (has isDirectory())
  stat,             // (path: string) => Promise<Stats>
  mkdir,            // (path: string, overwrite?: boolean) => Promise<boolean>
  mkdirRecursive,   // (path: string) => Promise<void>
  readdir,          // (path: string) => Promise<string[]>
  readFile,         // (path: string) => Promise<Buffer>
  writeFile,        // (path: string, data: Buffer | string, overwrite?: boolean) => Promise<boolean>
  rename,           // (oldPath: string, newPath: string) => Promise<boolean>
  rmdir,            // (path: string) => Promise<boolean>
  unlink,           // (path: string) => Promise<boolean>

  // ── Extended operations ──
  rootFs,           // RootFileSystem | undefined — direct BrowserFS access
  fs,               // FSModule | undefined — raw BrowserFS module
  createPath,       // (name, dir, buffer?, iteration?, overwrite?) => Promise<string>
  deletePath,       // (path: string) => Promise<boolean>
  updateFolder,     // (folder, newFile?, oldFile?) => Promise<void>
  copyEntries,      // (entries: string[]) => void
  moveEntries,      // (entries: string[]) => void
  pasteList,        // Record<string, "copy" | "move">
  addFile,          // (dir, callback, accept?, multiple?) => Promise<string[]>
  mapFs,            // (directory, existingHandle?) => Promise<string>
  mountFs,          // (url: string) => Promise<void>
  unmountFs,        // (url: string) => void
  unMapFs,          // (directory, hasNoHandle?) => Promise<void>
  addFsWatcher,     // (folder, updateFiles) => void
  removeFsWatcher,  // (folder, updateFiles) => void
} = useFileSystem();
```

### Key paths

| Path | Description |
|------|-------------|
| `/` | Root |
| `/Program Files/` | Installed apps |
| `/System/` | System files, icons, installed-apps.json |
| `/System/Icons/` | System icons |
| `/Users/` | User directories |
| `~/Desktop` | Desktop shortcuts |
| `~/Start Menu` | Start Menu shortcuts |
| `~/Snapshots` | Save states |

### Reading a file

```typescript
const buffer = await readFile("/Program Files/my-app/data.json");
const text = buffer.toString();
const json = JSON.parse(text);
```

### Writing a file

```typescript
await mkdirRecursive("/Program Files/my-app/data");
await writeFile("/Program Files/my-app/data/config.json", JSON.stringify(config), true);
```

---

## 9. Process Manager API

Available to **built-in apps** via `useProcesses()`.

```typescript
const {
  processes,        // Record<string, Process> — all running processes
  open,             // (id: string, args?: ProcessArguments, icon?) => void
  close,            // (id: string, closing?: boolean) => void
  closeWithTransition, // (id: string) => void  (animated close)
  maximize,         // (id: string) => void
  minimize,         // (id: string) => void
  title,            // (id: string, newTitle: string) => void
  icon,             // (id: string, newIcon: string) => void
  url,              // (id: string, newUrl: string) => void
  argument,         // (id, name, value) => void  (set process argument)
  linkElement,      // (id, name, element) => void  (link DOM element)
  closeProcessesByUrl, // (url: string) => void
} = useProcesses();
```

### Opening another app

```typescript
const { open } = useProcesses();

// Open the Browser
open("Browser", { url: "https://example.com" });

// Open the File Explorer
open("FileExplorer");

// Open a file in its default app
open("LoadedApp", { url: "/Program Files/my-app/" });
```

### Process ID format

Process IDs use the format: `<appId>` or `<appId>__<url>` or `<appId>__<url>__<instance>`.

The delimiter is `__` (double underscore, defined as `PROCESS_DELIMITER` in `utils/constants.ts`).

For singleton apps, only one instance can run. Opening it again focuses the existing window.

### ProcessArguments

When opening a process, you can pass these arguments:

```typescript
type ProcessArguments = {
  url?: string;                    // URL to load (for Browser, LoadedApp, etc.)
  allowResizing?: boolean;
  autoSizing?: boolean;
  backgroundBlur?: string;
  backgroundColor?: string;
  dependantLibs?: string[];
  hideCloseButton?: boolean;
  hideMaximizeButton?: boolean;
  hideMinimizeButton?: boolean;
  hidePeek?: boolean;
  hideTaskbarEntry?: boolean;
  hideTitlebar?: boolean;
  hideTitlebarIcon?: boolean;
  initialRelativePosition?: RelativePosition;
  libs?: string[];
  lockAspectRatio?: boolean;
  peekImage?: string;
  // ... plus app-specific args
};
```

---

## 10. Session Context API

Available to **built-in apps** via `useSession()`.

```typescript
const {
  // ── Window management ──
  foregroundId,         // string — current foreground window ID
  stackOrder,           // string[] — z-order of windows
  windowStates,         // Record<string, { position?, size? }>
  setWindowStates,
  prependToStack,       // (id: string) => void
  removeFromStack,      // (id: string) => void
  setForegroundId,

  // ── Auth ──
  authUser,             // AuthUser | null
  isLocked,             // boolean — is lockscreen showing
  sessionLoaded,        // boolean
  setAuthUser,
  setIsLocked,
  userEmail,
  setUserEmail,

  // ── Appearance ──
  themeName,            // ThemeName
  setThemeName,
  wallpaperImage,       // string
  wallpaperFit,         // "center" | "fill" | "fit" | "stretch" | "tile"
  setWallpaper,
  cursor,               // string | undefined
  setCursor,
  closeEffect,          // string
  setCloseEffect,

  // ── Desktop ──
  iconPositions,        // Record<string, { gridColumnStart, gridRowStart }>
  setIconPositions,
  sortOrders,           // Record<string, [string[], SortBy?, boolean?]>
  setSortOrder,
  views,                // Record<string, FileManagerViewNames>
  setViews,

  // ── Features ──
  aiEnabled,            // boolean
  setAiEnabled,
  widgetsEnabled,       // boolean
  setWidgetsEnabled,
  clockSource,          // "local" | "ntp"
  setClockSource,

  // ── History ──
  recentFiles,          // [url, pid, title][]
  updateRecentFiles,
  runHistory,           // string[]
  setRunHistory,
} = useSession();
```

---

## 11. Auth Context API

Available to **built-in apps** via `useAuthContext()`.

```typescript
const {
  user,              // AuthUser | null
  initializing,      // boolean — true during initial auth check
  error,             // string | null
  signIn,            // (email, password) => Promise<void>
  signUp,            // (email, password, details: { username, country?, isDeveloper? }) => Promise<void>
  signOutUser,       // () => Promise<void>
  resetPassword,     // (email) => Promise<void>
  clearError,        // () => void
  updateBalance,     // (newBalance: number) => Promise<boolean>
  addPurchasedApp,   // (appId: string, cost: number) => Promise<boolean>
} = useAuthContext();
```

### AuthUser type

```typescript
type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  account?: {
    balance: number;
    country: string;
    createdAt: string;
    email: string;
    isDeveloper: boolean;
    username: string;
    purchasedAppIds: string[];
  };
};
```

### Firebase collections

| Collection | Document ID | Purpose |
|-----------|-------------|---------|
| `users` | Firebase Auth UID | User account profile (balance, purchased apps, etc.) |
| `appstore_apps` | App ID | App Store listings |
| `appstore_reviews` | Review ID | User reviews for apps |

---

## 12. AppStore & Firebase Integration

### Publishing an app to the App Store

To list your app in the App Store, add a document to the `appstore_apps` Firestore collection:

```typescript
{
  id: "calculator-pro",
  name: "Calculator Pro",
  developer: "Your Name",
  description: "A powerful calculator app.",
  tagline: "Calculate everything, beautifully.",
  category: "Utilities",          // "Development" | "Games" | "Media" | "Productivity" | "Social" | "Utilities"
  price: 0,                       // 0 for free, or positive number
  version: "1.0.0",
  iconUrl: "https://example.com/icon.png",
  downloadUrl: "https://example.com/calculator-pro.zip",
  size: "2.5 MB",
  rating: 4.8,
  ratingCount: 913,
  ageRating: "3+",
  badges: ["Built for Pyhdra OS"],
  screenshots: ["https://example.com/screenshot1.png"],
  heroImage: "https://example.com/hero.png",
  isHero: false,
  isFeaturedGrid: false,
  isTrendingApp: false,
  isTrendingGame: false,
  isDiscoverMore: false,
  sysReqs: {
    os: "Pyhdra OS 1.0+",
    architecture: "Any",
    memory: "Any",
    graphics: "Any"
  },
  changelog: "v1.0.0: Initial release."
}
```

### AppStoreApp type (from `mockData.ts`)

```typescript
type AppStoreApp = {
  id: string;
  name: string;
  developer: string;
  description: string;
  category: AppCategory;
  price: number;
  version: string;
  iconUrl: string;
  downloadUrl: string;
  tagline?: string;
  ageRating?: string;
  badges?: string[];
  screenshots?: string[];
  heroImage?: string;
  size?: string;
  rating?: number;
  ratingCount?: number;
  reviews?: AppReview[];
  sysReqs?: SystemRequirements;
  changelog?: string;
  isHero?: boolean;
  isFeaturedGrid?: boolean;
  isTrendingApp?: boolean;
  isTrendingGame?: boolean;
  isDiscoverMore?: boolean;
};
```

### Purchase flow

1. User clicks "Buy" or "Get" in the AppStore.
2. If the app has a price > 0, `addPurchasedApp(appId, cost)` is called, which:
   - Checks the user's balance.
   - Deducts the cost from the balance.
   - Adds the app ID to `purchasedAppIds` in Firestore.
3. The app zip is downloaded via `downloadApp()` and installed via `installAppFromZip()`.
4. On subsequent logins, purchased apps appear in the user's Library and can be reinstalled without paying again.

### Submitting reviews

Reviews are stored in the `appstore_reviews` collection:

```typescript
type AppReview = {
  id: string;        // e.g. "rev-1690000000000"
  comment: string;
  date: string;      // ISO date string (YYYY-MM-DD)
  rating: number;    // 1-5
  userName: string;
};
```

---

## 13. Window Properties & Decorations

When registering a built-in app in the process directory, you can control window behavior:

```typescript
{
  Component: dynamic(() => import("components/apps/MyApp")),
  title: "My App",
  icon: "/System/Icons/myapp.svg",
  backgroundColor: "#1e1e2e",
  backgroundBlur: "8px",           // optional blur backdrop
  defaultSize: { width: 600, height: 400 },
  allowResizing: true,             // default: true
  singleton: false,                // default: false (allow multiple instances)
  hasWindow: true,                 // default: true (false = no window chrome, e.g. Webamp)
  hideTitlebar: false,
  hideCloseButton: false,
  hideMinimizeButton: false,
  hideMaximizeButton: false,
  hideTaskbarEntry: false,
  hideTitlebarIcon: false,
  hidePeek: false,
  preferProcessIcon: false,        // use process icon over shortcut icon
  autoSizing: false,               // auto-size to content
  lockAspectRatio: false,
  peekImage: undefined,            // custom peek image for taskbar hover
  libs: [],                        // JS/CSS files to preload
  dependantLibs: [],               // libs that must be loaded before component
  initialRelativePosition: undefined, // { top?, bottom?, left?, right? }
}
```

### Preloading libraries

Some apps require external JS/CSS libraries. List them in `libs` to have them preloaded before the app component mounts:

```typescript
libs: [
  "/Program Files/MyApp/library.js",
  "/Program Files/MyApp/styles.css",
],
```

`dependantLibs` are loaded synchronously before the component renders (used by Monaco Editor, TinyMCE, etc.).

---

## 14. Building a Built-in App (Advanced)

Built-in apps are React components that receive `ComponentProcessProps`:

```typescript
type ComponentProcessProps = {
  id: string;  // The process ID
};
```

### Minimal built-in app

```typescript
// components/apps/MyApp/index.tsx
import { memo, type FC } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useAuthContext } from "contexts/auth";

const MyApp: FC<ComponentProcessProps> = ({ id }) => {
  const { readFile, writeFile, exists, mkdirRecursive } = useFileSystem();
  const { title, closeWithTransition } = useProcesses();
  const { user } = useAuthContext();

  // You can update the window title
  // title(id, "My Custom Title");

  return (
    <div style={{ width: "100%", height: "100%", background: "#1e1e2e", color: "#fff" }}>
      <h1>Hello, {user?.account?.username || "Guest"}!</h1>
      <button onClick={() => closeWithTransition(id)}>Close App</button>
    </div>
  );
};

export default memo(MyApp);
```

### Registering in the process directory

Add an entry to `contexts/process/directory.ts`:

```typescript
MyApp: {
  Component: dynamic(() => import("components/apps/MyApp")),
  backgroundColor: "#1e1e2e",
  defaultSize: { height: 400, width: 600 },
  icon: "/System/Icons/myapp.svg",
  title: "My App",
},
```

### Accessing the process's own arguments

```typescript
const { processes } = useProcesses();
const { [id]: process } = processes;
const { url, maximized, minimized } = process || {};
```

### Opening another app from within an app

```typescript
const { open } = useProcesses();

const handleOpenBrowser = () => {
  open("Browser", { url: "https://example.com" });
};
```

---

## 15. Testing & Debugging

### Development server

```bash
yarn dev
```

The OS runs at `http://localhost:3000`.

### Sideload testing

1. Package your app as a `.zip` with a `manifest.json`.
2. Place the zip in the `public/` directory (e.g., `public/my-app.zip`).
3. In the OS, open the File Explorer, navigate to the zip, and double-click it.
4. The App Installer will open and install your app.

### Debugging external apps

- Open DevTools (`Ctrl+Shift+I` or via the DevTools app in the OS).
- External apps run in an iframe — use the frame selector in DevTools to switch context.
- `console.log` output from the iframe appears in the parent DevTools console.
- The Account Bridge uses `postMessage` — you can inspect messages in the DevTools console.

### Linting

```bash
npx eslint components/apps/MyApp/index.tsx
```

### Type checking

```bash
npx tsc --noEmit
```

---

## 16. Full Example: Minimal External App

### manifest.json

```json
{
  "id": "hello-pyhdra",
  "name": "Hello Pyhdra",
  "entry": "index.html",
  "width": 400,
  "height": 300,
  "allowResizing": false,
  "icon": "icon.svg",
  "backgroundColor": "#1a1a2e"
}
```

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hello Pyhdra</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #1a1a2e;
      color: #e0e0e0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 16px;
    }
    h1 { font-size: 24px; }
    p { color: #888; font-size: 14px; }
    .balance {
      background: rgba(255,255,255,0.08);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
    }
    button {
      background: #4ade80;
      color: #141414;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.1s;
    }
    button:hover { transform: scale(1.05); }
    button:active { transform: scale(0.95); }
  </style>
</head>
<body>
  <h1>👋 Hello, Pyhdra!</h1>
  <p>Welcome to my app.</p>
  <div class="balance" id="balance-display">Loading balance...</div>
  <button id="action-btn">Spend $5</button>

  <script>
    let currentBalance = 0;

    async function init() {
      const balance = await window.pyhdraAccount.getBalance();
      if (balance !== null) {
        currentBalance = balance;
        document.getElementById('balance-display').textContent = '$' + balance;
      } else {
        document.getElementById('balance-display').textContent = 'Sign in to view balance';
      }
    }

    document.getElementById('action-btn').addEventListener('click', async () => {
      if (currentBalance >= 5) {
        const ok = await window.pyhdraAccount.updateBalance(currentBalance - 5);
        if (ok) {
          currentBalance -= 5;
          document.getElementById('balance-display').textContent = '$' + currentBalance;
          alert('Spent $5!');
        } else {
          alert('This app cannot modify balance.');
        }
      } else {
        alert('Insufficient balance.');
      }
    });

    init();
  </script>
</body>
</html>
```

### icon.svg

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="12" fill="#4ade80"/>
  <text x="24" y="32" font-size="24" text-anchor="middle" fill="#141414" font-family="sans-serif" font-weight="bold">H</text>
</svg>
```

### Package and install

```bash
zip -r hello-pyhdra.zip manifest.json index.html icon.svg
```

Place `hello-pyhdra.zip` in `public/`, then open it from the File Explorer in the OS.

---

## Quick Reference

| What | Where |
|------|-------|
| Process directory (app registry) | `contexts/process/directory.ts` |
| Process types | `contexts/process/types.ts` |
| Process functions (open/close/etc.) | `contexts/process/functions.ts` |
| File system context | `contexts/fileSystem/index.ts` |
| File system config | `contexts/fileSystem/FileSystemConfig.ts` |
| Auth context | `contexts/auth/index.tsx` |
| Auth hook | `hooks/useAuth.ts` |
| Account Firestore functions | `lib/account.ts` |
| Account bridge (iframe API) | `lib/accountBridge.ts` |
| Firebase init | `lib/firebase.ts` |
| App installer | `utils/appInstaller.ts` |
| AppStore Firebase functions | `components/apps/AppStore/firebase.ts` |
| AppStore component | `components/apps/AppStore/index.tsx` |
| AppStore types | `components/apps/AppStore/mockData.ts` |
| LoadedApp (external app runner) | `components/apps/LoadedApp/index.tsx` |
| Window component | `components/system/Window/index.tsx` |
| RenderComponent | `components/system/Apps/RenderComponent.tsx` |
| Session context | `contexts/session/index.ts` |
| Session types | `contexts/session/types.ts` |
| Constants | `utils/constants.ts` |
| ComponentProcessProps | `components/system/Apps/RenderComponent.tsx` |

---

*This documentation is maintained alongside the Pyhdra OS codebase. If the APIs change, this file should be updated accordingly.*
