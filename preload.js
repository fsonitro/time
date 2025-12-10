const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Locations
  getLocations: () => ipcRenderer.invoke('get-locations'),
  getAllTimes: () => ipcRenderer.invoke('get-all-times'),
  updateLocations: (locations) => ipcRenderer.send('update-locations', locations),
  
  // Preferences
  getPreferences: () => ipcRenderer.invoke('get-preferences'),
  updatePreferences: (preferences) => ipcRenderer.send('update-preferences', preferences),
  
  // Menu bar
  getMenuBarLocationId: () => ipcRenderer.invoke('get-menu-bar-location-id'),
  setMenuBarLocation: (locationId) => ipcRenderer.send('set-menu-bar-location', locationId),
  
  // Time
  getTimeForTimezone: (timezone) => ipcRenderer.invoke('get-time-for-timezone', timezone),
  
  // Window actions
  openSettings: () => ipcRenderer.send('open-settings'),
  closeDropdown: () => ipcRenderer.send('close-dropdown'),
  resizeDropdown: (height) => ipcRenderer.send('resize-dropdown', height),
  quitApp: () => ipcRenderer.send('quit-app'),
  
  // Theme
  getDarkMode: () => ipcRenderer.invoke('get-dark-mode'),
  
  // Event listeners
  onLocationsUpdated: (callback) => {
    ipcRenderer.on('locations-updated', callback);
    return () => ipcRenderer.removeListener('locations-updated', callback);
  },
  onPreferencesUpdated: (callback) => {
    ipcRenderer.on('preferences-updated', callback);
    return () => ipcRenderer.removeListener('preferences-updated', callback);
  },
  onTimeUpdated: (callback) => {
    ipcRenderer.on('time-updated', callback);
    return () => ipcRenderer.removeListener('time-updated', callback);
  },
  onThemeUpdated: (callback) => {
    ipcRenderer.on('theme-updated', (event, isDark) => callback(isDark));
    return () => ipcRenderer.removeListener('theme-updated', callback);
  }
});
