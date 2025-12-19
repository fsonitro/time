// Dropdown panel logic
let menuBarLocationId = null;

async function init() {
  await loadLocations();
  setupEventListeners();
  
  // Listen for updates
  window.electronAPI.onLocationsUpdated(loadLocations);
  window.electronAPI.onPreferencesUpdated(loadLocations);
  window.electronAPI.onTimeUpdated(loadLocations);
  window.electronAPI.onThemeUpdated(handleThemeChange);
  
  // Check initial theme
  const isDark = await window.electronAPI.getDarkMode();
  handleThemeChange(isDark);
  
  // Resize window to fit content
  resizeToFit();
}

function resizeToFit() {
  const container = document.querySelector('.dropdown-container');
  if (container) {
    const height = container.offsetHeight;
    window.electronAPI.resizeDropdown(height);
  }
}

async function loadLocations() {
  const locations = await window.electronAPI.getAllTimes();
  menuBarLocationId = await window.electronAPI.getMenuBarLocationId();
  
  const listContainer = document.getElementById('locationsList');
  listContainer.innerHTML = '';
  
  // Sort: favourites first, then by order
  const sortedLocations = [...locations].sort((a, b) => {
    if (a.isFavourite && !b.isFavourite) return -1;
    if (!a.isFavourite && b.isFavourite) return 1;
    return a.order - b.order;
  });
  
  // Separate favourites and others
  const favourites = sortedLocations.filter(l => l.isFavourite);
  const others = sortedLocations.filter(l => !l.isFavourite);
  
  // Render favourites
  if (favourites.length > 0) {
    favourites.forEach(location => {
      listContainer.appendChild(createLocationItem(location, true));
    });
    
    // Add divider if there are other locations
    if (others.length > 0) {
      const divider = document.createElement('div');
      divider.className = 'locations-divider';
      listContainer.appendChild(divider);
    }
  }
  
  // Render other locations
  others.forEach(location => {
    listContainer.appendChild(createLocationItem(location, false));
  });
  
  // Resize window after content changes
  setTimeout(resizeToFit, 10);
}

function createLocationItem(location, isFavourite) {
  const item = document.createElement('div');
  item.className = 'location-item';
  if (location.id === menuBarLocationId) {
    item.classList.add('active');
  }
  
  const isMenuBarItem = location.id === menuBarLocationId;
  const { time, date } = location.currentTime;
  
  item.innerHTML = `
    <div class="location-left">
      <span class="favourite-indicator">${isFavourite ? '★' : ''}</span>
      <div class="location-info">
        <span class="location-name">${location.label}</span>
        ${date ? `<span class="location-date">${date}</span>` : ''}
      </div>
    </div>
    <div class="location-right">
      <span class="location-time">${time}</span>
      <span class="timezone-offset">${getTimezoneOffset(location.timezone)}</span>
      ${isMenuBarItem ? '<span class="checkmark">✓</span>' : ''}
    </div>
  `;
  
  // Click to set as menu bar location
  item.addEventListener('click', () => {
    window.electronAPI.setMenuBarLocation(location.id);
    menuBarLocationId = location.id;
    loadLocations();
  });
  
  return item;
}

function getTimezoneOffset(timezone) {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    timeZoneName: 'shortOffset'
  });
  
  const parts = formatter.formatToParts(now);
  const offsetPart = parts.find(p => p.type === 'timeZoneName');
  return offsetPart ? offsetPart.value : '';
}

function setupEventListeners() {
  document.getElementById('settingsBtn').addEventListener('click', () => {
    window.electronAPI.openSettings();
  });
  
  document.getElementById('quitBtn').addEventListener('click', () => {
    window.electronAPI.quitApp();
  });
  
  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.electronAPI.closeDropdown();
    }
  });
}

function handleThemeChange(isDark) {
  document.body.classList.toggle('dark-mode', isDark);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
