# World Clock - macOS Tray Application

## Project Overview

A macOS menu bar (tray) application that displays world times for selected locations. The app runs exclusively from the menu bar without a dock icon, following native macOS design conventions.

---

## Features

### Core Functionality
- **Menu Bar Display**: Shows the current time and location name in the menu bar (e.g., "London 15:10")
- **Dropdown Panel**: Clicking the menu bar item reveals a dropdown with all configured time zones
- **Real-time Updates**: Time updates every minute (or configurable interval)
- **Timezone Support**: Full IANA timezone database support

### User Preferences
- **Add/Remove Locations**: Search and select from worldwide time zones
- **Favourites**: Mark locations as favourites (displayed first, one shown in menu bar)
- **Custom Labels**: Optionally rename locations (e.g., "Home" instead of "New York")
- **Display Format**: Choose between 12-hour and 24-hour time formats
- **Show Date**: Option to display date alongside time

### Settings Page
- Accessible via dropdown menu or keyboard shortcut
- Search/filter available time zones
- Drag-and-drop reordering of locations
- Toggle favourite status with star icon
- Delete locations with confirmation

---

## Technical Architecture

### Technology Stack
| Component | Technology |
|-----------|------------|
| Framework | Electron |
| Frontend | HTML, CSS, JavaScript (or React/Vue optional) |
| Styling | Native macOS styling (vibrancy, SF fonts) |
| Storage | electron-store (persistent JSON) |
| Timezone | Intl API (native) or date-fns-tz |
| Build | electron-builder |

### Project Structure
```
time/
├── package.json
├── main.js                 # Main process (tray, windows)
├── preload.js              # Secure bridge between main/renderer
├── src/
│   ├── index.html          # Dropdown panel UI
│   ├── settings.html       # Settings page UI
│   ├── styles/
│   │   ├── main.css        # Dropdown styles
│   │   └── settings.css    # Settings page styles
│   └── renderer/
│       ├── dropdown.js     # Dropdown panel logic
│       └── settings.js     # Settings page logic
├── assets/
│   └── icons/
│       ├── tray-icon.png       # 16x16 menu bar icon
│       ├── tray-icon@2x.png    # 32x32 retina
│       └── app-icon.icns       # App icon for About
├── utils/
│   ├── timezones.js        # Timezone utilities
│   └── store.js            # Preferences management
└── build/                  # Build configuration
```

---

## Implementation Details

### 1. Main Process (`main.js`)

#### Tray Setup
```javascript
// Key responsibilities:
// - Create Tray instance with icon
// - Set tray title (dynamic: "London 15:10")
// - Handle tray click to show/hide dropdown
// - Manage BrowserWindow for dropdown panel
// - Listen for IPC messages from renderer
```

#### Critical Electron Settings
```javascript
// Hide from dock (tray-only app)
app.dock.hide();

// BrowserWindow for dropdown
const dropdown = new BrowserWindow({
  width: 300,
  height: 400,
  show: false,
  frame: false,
  resizable: false,
  movable: false,
  alwaysOnTop: true,
  skipTaskbar: true,
  transparent: true,
  vibrancy: 'menu',           // Native macOS blur
  visualEffectState: 'active',
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false
  }
});
```

#### Tray Positioning
```javascript
// Position dropdown below tray icon
tray.on('click', (event, bounds) => {
  const { x, y, width, height } = bounds;
  const windowBounds = dropdown.getBounds();
  
  const xPos = Math.round(x + width / 2 - windowBounds.width / 2);
  const yPos = y + height;
  
  dropdown.setPosition(xPos, yPos, false);
  dropdown.isVisible() ? dropdown.hide() : dropdown.show();
});
```

### 2. Dropdown Panel UI

#### Design Specifications
- **Width**: 280-320px
- **Max Height**: 400px (scrollable if needed)
- **Background**: Translucent with vibrancy effect
- **Corners**: 10px border-radius
- **Shadow**: Subtle drop shadow
- **Font**: SF Pro Text (system font)

#### Layout
```
┌─────────────────────────────┐
│  ★ London          15:10   │  ← Favourite (bold)
│  ★ New York        10:10   │
├─────────────────────────────┤
│    Tokyo           00:10   │  ← Regular locations
│    Sydney          02:10   │
│    Paris           16:10   │
├─────────────────────────────┤
│  ⚙️ Settings...             │  ← Footer actions
│  ❌ Quit                    │
└─────────────────────────────┘
```

#### Time Display Format
- Location name left-aligned
- Time right-aligned
- Show timezone offset on hover: "(UTC+0)"
- Optional: Show "Tomorrow" / "Yesterday" for date differences

### 3. Settings Page

#### Design Specifications
- Separate BrowserWindow (standard frame)
- 500px × 600px default size
- Native macOS window controls
- Sections with clear visual separation

#### Sections

**1. Display Preferences**
- Time format toggle (12h / 24h)
- Show seconds toggle
- Show date toggle
- Update interval selector

**2. Locations Management**
- Search box with instant filtering
- List of current locations with:
  - Drag handle for reordering
  - Star icon for favourite toggle
  - Edit icon for custom label
  - Delete icon (with confirmation)
- "Add Location" button opens timezone picker

**3. Timezone Picker Modal**
- Searchable list of all IANA timezones
- Grouped by region (America, Europe, Asia, etc.)
- Shows current time preview
- Popular locations section at top

### 4. Data Storage

#### Schema (electron-store)
```javascript
{
  "preferences": {
    "timeFormat": "24h",        // "12h" | "24h"
    "showSeconds": false,
    "showDate": false,
    "updateInterval": 60000     // milliseconds
  },
  "locations": [
    {
      "id": "uuid-1",
      "timezone": "Europe/London",
      "label": "London",         // Custom or default
      "isFavourite": true,
      "order": 0
    },
    {
      "id": "uuid-2", 
      "timezone": "America/New_York",
      "label": "New York",
      "isFavourite": true,
      "order": 1
    }
  ],
  "menuBarLocationId": "uuid-1"  // Which location shows in menu bar
}
```

### 5. IPC Communication

#### Channels
| Channel | Direction | Purpose |
|---------|-----------|---------|
| `get-locations` | Renderer → Main | Request location list |
| `locations-updated` | Main → Renderer | Send updated locations |
| `update-location` | Renderer → Main | Modify a location |
| `add-location` | Renderer → Main | Add new timezone |
| `remove-location` | Renderer → Main | Delete a timezone |
| `get-preferences` | Renderer → Main | Request preferences |
| `update-preferences` | Renderer → Main | Save preferences |
| `open-settings` | Renderer → Main | Open settings window |
| `quit-app` | Renderer → Main | Quit application |

---

## Styling Guidelines

### macOS Native Feel
```css
/* System font stack */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 13px;
  -webkit-font-smoothing: antialiased;
}

/* Vibrancy-compatible background */
.dropdown-container {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 10px;
}

/* Native-like list items */
.location-item {
  padding: 8px 12px;
  border-radius: 6px;
}

.location-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

/* Accent color (system blue) */
.favourite-star.active {
  color: #007AFF;
}
```

### Dark Mode Support
```css
@media (prefers-color-scheme: dark) {
  .dropdown-container {
    background: rgba(30, 30, 30, 0.8);
    color: #ffffff;
  }
  
  .location-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}
```

---

## Build & Distribution

### Package Scripts
```json
{
  "scripts": {
    "start": "electron .",
    "build": "electron-builder --mac",
    "build:dmg": "electron-builder --mac dmg",
    "build:zip": "electron-builder --mac zip"
  }
}
```

### electron-builder Configuration
```json
{
  "build": {
    "appId": "com.yourname.worldclock",
    "productName": "World Clock",
    "mac": {
      "category": "public.app-category.utilities",
      "icon": "assets/icons/app-icon.icns",
      "target": ["dmg", "zip"],
      "extendInfo": {
        "LSUIElement": true
      }
    }
  }
}
```

> **Note**: `LSUIElement: true` ensures the app runs without a dock icon.

---

## Development Workflow

### Phase 1: Foundation
1. Initialize npm project with dependencies
2. Create main process with basic tray
3. Implement dropdown window positioning
4. Add basic time display

### Phase 2: Core Features
5. Implement timezone selection
6. Add electron-store for persistence
7. Create settings window
8. Implement favourites system

### Phase 3: Polish
9. Apply macOS native styling
10. Add dark mode support
11. Implement drag-and-drop reordering
12. Add keyboard shortcuts

### Phase 4: Distribution
13. Create app icons (all sizes)
14. Configure electron-builder
15. Test on different macOS versions
16. Build and sign for distribution

---

## Dependencies

### Production
```json
{
  "electron": "^28.0.0",
  "electron-store": "^8.1.0",
  "uuid": "^9.0.0"
}
```

### Development
```json
{
  "electron-builder": "^24.0.0",
  "electron-reload": "^2.0.0"
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd + ,` | Open Settings (global) |
| `Cmd + Q` | Quit application |
| `Esc` | Close dropdown |
| `↑/↓` | Navigate locations |
| `Enter` | Set selected as menu bar display |

---

## Future Enhancements (Optional)

- [ ] Multiple menu bar items (show more than one time)
- [ ] Calendar integration
- [ ] Meeting time zone converter
- [ ] Alarm/reminder for specific times
- [ ] Widget for macOS Notification Center
- [ ] Sync settings via iCloud
- [ ] Auto-detect current location

---

## Notes

- Always test with `app.dock.hide()` to ensure true tray-only behaviour
- Use `nativeTheme.shouldUseDarkColors` for theme detection
- Handle screen changes (external monitor connect/disconnect)
- Ensure dropdown closes when clicking outside
- Consider accessibility (VoiceOver support)
