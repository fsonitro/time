// Settings page logic
let locations = [];
let preferences = {};

async function init() {
  await loadPreferences();
  await loadLocations();
  setupEventListeners();
  
  // Listen for updates
  window.electronAPI.onLocationsUpdated(loadLocations);
  window.electronAPI.onPreferencesUpdated(loadPreferences);
  window.electronAPI.onThemeUpdated(handleThemeChange);
  
  // Check initial theme
  const isDark = await window.electronAPI.getDarkMode();
  handleThemeChange(isDark);
  
  // Show content after everything is loaded
  document.body.classList.add('ready');
}

async function loadPreferences() {
  preferences = await window.electronAPI.getPreferences();
  
  document.getElementById('timeFormat').value = preferences.timeFormat;
  document.getElementById('showSeconds').checked = preferences.showSeconds;
  document.getElementById('showDate').checked = preferences.showDate;
}

async function loadLocations() {
  locations = await window.electronAPI.getLocations();
  renderLocations();
}

function renderLocations() {
  const listContainer = document.getElementById('locationsList');
  listContainer.innerHTML = '';
  
  // Sort by order
  const sortedLocations = [...locations].sort((a, b) => a.order - b.order);
  
  if (sortedLocations.length === 0) {
    listContainer.innerHTML = '<div class="empty-state">No locations added. Click "Add Location" to get started.</div>';
    return;
  }
  
  sortedLocations.forEach((location, index) => {
    const item = createLocationSettingsItem(location, index);
    listContainer.appendChild(item);
  });
}

function createLocationSettingsItem(location, index) {
  const item = document.createElement('div');
  item.className = 'location-settings-item';
  item.draggable = true;
  item.dataset.id = location.id;
  
  item.innerHTML = `
    <div class="drag-handle">⋮⋮</div>
    <button class="favourite-btn ${location.isFavourite ? 'active' : ''}" data-id="${location.id}" title="Toggle favourite">
      ${location.isFavourite ? '★' : '☆'}
    </button>
    <div class="location-details">
      <span class="location-name">${location.label}</span>
      <span class="location-timezone">${location.timezone}</span>
    </div>
    <div class="location-actions">
      <button class="edit-btn" data-id="${location.id}" title="Edit label">✎</button>
      <button class="delete-btn" data-id="${location.id}" title="Delete">✕</button>
    </div>
  `;
  
  // Drag events
  item.addEventListener('dragstart', handleDragStart);
  item.addEventListener('dragover', handleDragOver);
  item.addEventListener('drop', handleDrop);
  item.addEventListener('dragend', handleDragEnd);
  
  return item;
}

// Drag and drop handling
let draggedItem = null;

function handleDragStart(e) {
  draggedItem = e.target.closest('.location-settings-item');
  draggedItem.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  
  const item = e.target.closest('.location-settings-item');
  if (item && item !== draggedItem) {
    const rect = item.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    
    if (e.clientY < midY) {
      item.classList.add('drag-over-top');
      item.classList.remove('drag-over-bottom');
    } else {
      item.classList.add('drag-over-bottom');
      item.classList.remove('drag-over-top');
    }
  }
}

function handleDrop(e) {
  e.preventDefault();
  
  const dropTarget = e.target.closest('.location-settings-item');
  if (!dropTarget || dropTarget === draggedItem) return;
  
  const draggedId = draggedItem.dataset.id;
  const dropId = dropTarget.dataset.id;
  
  const draggedIndex = locations.findIndex(l => l.id === draggedId);
  const dropIndex = locations.findIndex(l => l.id === dropId);
  
  // Reorder locations
  const [removed] = locations.splice(draggedIndex, 1);
  
  const rect = dropTarget.getBoundingClientRect();
  const midY = rect.top + rect.height / 2;
  const insertIndex = e.clientY < midY ? dropIndex : dropIndex + 1;
  
  locations.splice(insertIndex > draggedIndex ? insertIndex - 1 : insertIndex, 0, removed);
  
  // Update order values
  locations.forEach((loc, idx) => {
    loc.order = idx;
  });
  
  window.electronAPI.updateLocations(locations);
  renderLocations();
}

function handleDragEnd() {
  if (draggedItem) {
    draggedItem.classList.remove('dragging');
  }
  
  document.querySelectorAll('.location-settings-item').forEach(item => {
    item.classList.remove('drag-over-top', 'drag-over-bottom');
  });
  
  draggedItem = null;
}

function setupEventListeners() {
  // Preference changes
  document.getElementById('timeFormat').addEventListener('change', savePreferences);
  document.getElementById('showSeconds').addEventListener('change', savePreferences);
  document.getElementById('showDate').addEventListener('change', savePreferences);
  
  // Add location button
  document.getElementById('addLocationBtn').addEventListener('click', openAddLocationModal);
  
  // Modal close
  document.getElementById('closeModalBtn').addEventListener('click', closeAddLocationModal);
  document.getElementById('addLocationModal').addEventListener('click', (e) => {
    if (e.target.id === 'addLocationModal') {
      closeAddLocationModal();
    }
  });
  
  // Timezone search
  document.getElementById('timezoneSearch').addEventListener('input', filterTimezones);
  
  // Location list actions (delegated)
  document.getElementById('locationsList').addEventListener('click', handleLocationAction);
  
  // Escape to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAddLocationModal();
    }
  });
}

function savePreferences() {
  preferences = {
    ...preferences,
    timeFormat: document.getElementById('timeFormat').value,
    showSeconds: document.getElementById('showSeconds').checked,
    showDate: document.getElementById('showDate').checked
  };
  
  window.electronAPI.updatePreferences(preferences);
}

function handleLocationAction(e) {
  const target = e.target.closest('button');
  if (!target) return;
  
  const id = target.dataset.id;
  
  if (target.classList.contains('favourite-btn')) {
    toggleFavourite(id);
  } else if (target.classList.contains('edit-btn')) {
    editLocation(id);
  } else if (target.classList.contains('delete-btn')) {
    deleteLocation(id);
  }
}

function toggleFavourite(id) {
  const location = locations.find(l => l.id === id);
  if (location) {
    location.isFavourite = !location.isFavourite;
    window.electronAPI.updateLocations(locations);
  }
}

function editLocation(id) {
  const location = locations.find(l => l.id === id);
  if (!location) return;
  
  const newLabel = prompt('Enter new label:', location.label);
  if (newLabel && newLabel.trim()) {
    location.label = newLabel.trim();
    window.electronAPI.updateLocations(locations);
  }
}

function deleteLocation(id) {
  const location = locations.find(l => l.id === id);
  if (!location) return;
  
  if (confirm(`Remove "${location.label}" from your locations?`)) {
    locations = locations.filter(l => l.id !== id);
    // Re-index orders
    locations.forEach((loc, idx) => {
      loc.order = idx;
    });
    window.electronAPI.updateLocations(locations);
  }
}

// Modal functions
function openAddLocationModal() {
  const modal = document.getElementById('addLocationModal');
  modal.classList.add('visible');
  document.getElementById('timezoneSearch').value = '';
  document.getElementById('timezoneSearch').focus();
  renderTimezoneList();
}

function closeAddLocationModal() {
  document.getElementById('addLocationModal').classList.remove('visible');
}

function renderTimezoneList(filter = '') {
  const listContainer = document.getElementById('timezoneList');
  listContainer.innerHTML = '';
  
  const filterLower = filter.toLowerCase();
  const existingTimezones = new Set(locations.map(l => l.timezone));
  
  // Group by region
  const grouped = {};
  
  window.TIMEZONE_DATA.forEach(tz => {
    // Filter
    if (filter && !tz.label.toLowerCase().includes(filterLower) && 
        !tz.timezone.toLowerCase().includes(filterLower)) {
      return;
    }
    
    if (!grouped[tz.region]) {
      grouped[tz.region] = [];
    }
    grouped[tz.region].push(tz);
  });
  
  // Render groups
  window.REGIONS.forEach(region => {
    if (!grouped[region] || grouped[region].length === 0) return;
    
    const regionHeader = document.createElement('div');
    regionHeader.className = 'timezone-region-header';
    regionHeader.textContent = region;
    listContainer.appendChild(regionHeader);
    
    grouped[region].forEach(tz => {
      const isAdded = existingTimezones.has(tz.timezone);
      
      const item = document.createElement('div');
      item.className = `timezone-item ${isAdded ? 'added' : ''}`;
      
      const time = getCurrentTimeForTimezone(tz.timezone);
      
      item.innerHTML = `
        <div class="timezone-info">
          <span class="timezone-label">${tz.label}</span>
          <span class="timezone-id">${tz.timezone}</span>
        </div>
        <div class="timezone-preview">
          <span class="timezone-time">${time}</span>
          ${isAdded ? '<span class="added-badge">Added</span>' : ''}
        </div>
      `;
      
      if (!isAdded) {
        item.addEventListener('click', () => addLocation(tz));
      }
      
      listContainer.appendChild(item);
    });
  });
}

function getCurrentTimeForTimezone(timezone) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: preferences.timeFormat === '12h'
    }).format(new Date());
  } catch (e) {
    return '--:--';
  }
}

function filterTimezones(e) {
  renderTimezoneList(e.target.value);
}

function addLocation(tz) {
  const newLocation = {
    id: generateId(),
    timezone: tz.timezone,
    label: tz.label,
    isFavourite: false,
    order: locations.length
  };
  
  locations.push(newLocation);
  window.electronAPI.updateLocations(locations);
  closeAddLocationModal();
}

function generateId() {
  return 'loc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function handleThemeChange(isDark) {
  document.body.classList.toggle('dark-mode', isDark);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
