const { app, BrowserWindow, Tray, ipcMain, nativeTheme, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize store
const store = new Store({
  defaults: {
    preferences: {
      timeFormat: '24h',
      showSeconds: false,
      showDate: false,
      updateInterval: 60000
    },
    locations: [
      {
        id: 'default-london',
        timezone: 'Europe/London',
        label: 'London',
        isFavourite: true,
        order: 0
      },
      {
        id: 'default-newyork',
        timezone: 'America/New_York',
        label: 'New York',
        isFavourite: false,
        order: 1
      },
      {
        id: 'default-tokyo',
        timezone: 'Asia/Tokyo',
        label: 'Tokyo',
        isFavourite: false,
        order: 2
      }
    ],
    menuBarLocationId: 'default-london'
  }
});

let tray = null;
let dropdownWindow = null;
let settingsWindow = null;
let updateInterval = null;

// Hide dock icon (tray-only app)
if (app.dock) {
  app.dock.hide();
}

function createDropdownWindow() {
  dropdownWindow = new BrowserWindow({
    width: 300,
    height: 600,
    maxHeight: 600,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    vibrancy: 'menu',
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  dropdownWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Hide when losing focus
  dropdownWindow.on('blur', () => {
    if (dropdownWindow && !settingsWindow?.isFocused()) {
      dropdownWindow.hide();
    }
  });
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 550,
    height: 650,
    minWidth: 450,
    minHeight: 500,
    show: false,
    backgroundColor: '#00000000',
    titleBarStyle: 'hiddenInset',
    vibrancy: 'window',
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  settingsWindow.loadFile(path.join(__dirname, 'src', 'settings.html'));

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function getTimeForTimezone(timezone, preferences) {
  const now = new Date();
  
  const timeOptions = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: preferences.timeFormat === '12h'
  };

  if (preferences.showSeconds) {
    timeOptions.second = '2-digit';
  }

  const time = new Intl.DateTimeFormat('en-GB', timeOptions).format(now);
  
  if (preferences.showDate) {
    const dateOptions = {
      timeZone: timezone,
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    };
    const date = new Intl.DateTimeFormat('en-GB', dateOptions).format(now).replace(',', '');
    return { time, date };
  }
  
  return { time, date: null };
}

function getMenuBarTitle() {
  const preferences = store.get('preferences');
  const locations = store.get('locations');
  const menuBarLocationId = store.get('menuBarLocationId');

  const location = locations.find(l => l.id === menuBarLocationId) || locations[0];
  
  if (!location) return 'World Clock';

  const { time, date } = getTimeForTimezone(location.timezone, preferences);
  
  if (date) {
    return `${location.label} ${date} ${time}`;
  }
  return `${location.label} ${time}`;
}

function updateTrayTitle() {
  if (tray) {
    tray.setTitle(getMenuBarTitle());
  }
}

function positionDropdownWindow() {
  if (!tray || !dropdownWindow) return;

  const trayBounds = tray.getBounds();
  const windowBounds = dropdownWindow.getBounds();
  const display = screen.getDisplayMatching(trayBounds);

  // Calculate x position (centered under tray icon)
  let x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);

  // Ensure window stays within screen bounds
  if (x < display.bounds.x) {
    x = display.bounds.x;
  } else if (x + windowBounds.width > display.bounds.x + display.bounds.width) {
    x = display.bounds.x + display.bounds.width - windowBounds.width;
  }

  // Position below tray
  const y = trayBounds.y + trayBounds.height;

  dropdownWindow.setPosition(x, y, false);
}

function toggleDropdown() {
  if (!dropdownWindow) return;

  if (dropdownWindow.isVisible()) {
    dropdownWindow.hide();
  } else {
    positionDropdownWindow();
    dropdownWindow.show();
    dropdownWindow.focus();
  }
}

function createTray() {
  // Create tray with empty 1x1 transparent image (icon required but we hide it)
  const { nativeImage } = require('electron');
  const emptyIcon = nativeImage.createEmpty();
  tray = new Tray(emptyIcon);

  tray.setToolTip('World Clock');
  updateTrayTitle();

  tray.on('click', () => {
    toggleDropdown();
  });

  tray.on('right-click', () => {
    toggleDropdown();
  });
}

function startUpdateInterval() {
  const preferences = store.get('preferences');
  
  if (updateInterval) {
    clearInterval(updateInterval);
  }

  // Update immediately
  updateTrayTitle();

  // Use 1 second interval if showing seconds, otherwise use configured interval
  const interval = preferences.showSeconds ? 1000 : preferences.updateInterval;

  // Then update at calculated interval
  updateInterval = setInterval(() => {
    updateTrayTitle();
    // Notify dropdown to update if visible
    if (dropdownWindow && dropdownWindow.isVisible()) {
      dropdownWindow.webContents.send('time-updated');
    }
  }, interval);
}

// IPC Handlers
ipcMain.handle('get-locations', () => {
  return store.get('locations');
});

ipcMain.handle('get-preferences', () => {
  return store.get('preferences');
});

ipcMain.handle('get-menu-bar-location-id', () => {
  return store.get('menuBarLocationId');
});

ipcMain.on('resize-dropdown', (event, height) => {
  if (dropdownWindow) {
    const width = dropdownWindow.getBounds().width;
    dropdownWindow.setSize(width, Math.min(height, 600));
  }
});

ipcMain.handle('get-time-for-timezone', (event, timezone) => {
  const preferences = store.get('preferences');
  return getTimeForTimezone(timezone, preferences);
});

ipcMain.handle('get-all-times', () => {
  const locations = store.get('locations');
  const preferences = store.get('preferences');
  
  return locations.map(location => ({
    ...location,
    currentTime: getTimeForTimezone(location.timezone, preferences)
  }));
});

ipcMain.on('update-locations', (event, locations) => {
  store.set('locations', locations);
  updateTrayTitle();
  
  // Notify all windows
  if (dropdownWindow) {
    dropdownWindow.webContents.send('locations-updated');
  }
  if (settingsWindow) {
    settingsWindow.webContents.send('locations-updated');
  }
});

ipcMain.on('update-preferences', (event, preferences) => {
  store.set('preferences', preferences);
  startUpdateInterval();
  
  // Notify all windows
  if (dropdownWindow) {
    dropdownWindow.webContents.send('preferences-updated');
  }
  if (settingsWindow) {
    settingsWindow.webContents.send('preferences-updated');
  }
});

ipcMain.on('set-menu-bar-location', (event, locationId) => {
  store.set('menuBarLocationId', locationId);
  updateTrayTitle();
});

ipcMain.on('open-settings', () => {
  createSettingsWindow();
  if (dropdownWindow) {
    dropdownWindow.hide();
  }
});

ipcMain.on('close-dropdown', () => {
  if (dropdownWindow) {
    dropdownWindow.hide();
  }
});

ipcMain.on('quit-app', () => {
  app.quit();
});

ipcMain.handle('get-dark-mode', () => {
  return nativeTheme.shouldUseDarkColors;
});

// App lifecycle
app.whenReady().then(() => {
  createTray();
  createDropdownWindow();
  startUpdateInterval();
});

app.on('window-all-closed', (e) => {
  // Prevent app from quitting when all windows are closed
  e.preventDefault();
});

app.on('before-quit', () => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});

// Handle theme changes
nativeTheme.on('updated', () => {
  if (dropdownWindow) {
    dropdownWindow.webContents.send('theme-updated', nativeTheme.shouldUseDarkColors);
  }
  if (settingsWindow) {
    settingsWindow.webContents.send('theme-updated', nativeTheme.shouldUseDarkColors);
  }
});
