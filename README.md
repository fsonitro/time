# World Clock

A macOS menu bar application that displays world times for selected locations.

![macOS](https://img.shields.io/badge/macOS-000000?style=flat&logo=apple&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-47848F?style=flat&logo=electron&logoColor=white)

## Features

- **Menu Bar Display** — Shows current time and location directly in the menu bar (e.g., "London 15:10")
- **Multiple Time Zones** — Add and manage locations from around the world
- **Favourites** — Mark locations as favourites for quick access
- **Customizable Display** — Toggle between 12/24-hour format, show seconds, show date
- **Native macOS Design** — Follows macOS design conventions with vibrancy and dark mode support
- **Tray-Only** — Runs exclusively from the menu bar without a dock icon

## Installation

```bash
# Clone the repository
git clone https://github.com/fsonitro/time.git
cd time

# Install dependencies
npm install

# Run the app
npm start
```

## Build

```bash
# Build for macOS
npm run build

# Build DMG installer
npm run build:dmg
```

## Usage

1. Click the time in the menu bar to open the dropdown
2. Click any location to set it as the menu bar display
3. Open **Settings** to add locations or change preferences
4. Use the star icon to mark favourites

## License

MIT
