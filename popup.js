// Popup script - Auto-clicker and Auto-buy controls
document.addEventListener('DOMContentLoaded', function() {
  console.log('Click the Cookie extension popup loaded');
  
  // Get DOM elements
  const autoClickerToggle = document.getElementById('autoClickerToggle');
  const autoClickerStatus = document.getElementById('autoClickerStatus');
  const autoBuyBuildingsToggle = document.getElementById('autoBuyBuildingsToggle');
  const autoBuyBuildingsStatus = document.getElementById('autoBuyBuildingsStatus');
  const autoBuyUpgradesToggle = document.getElementById('autoBuyUpgradesToggle');
  const autoBuyUpgradesStatus = document.getElementById('autoBuyUpgradesStatus');
  
  // Load and display auto-clicker state
  function loadAutoClickerState() {
    browser.storage.local.get(['autoClickerEnabled']).then(function(result) {
      const isEnabled = result.autoClickerEnabled || false;
      autoClickerToggle.checked = isEnabled;
      updateAutoClickerStatus(isEnabled);
    }).catch(function(error) {
      autoClickerToggle.checked = false;
      updateAutoClickerStatus(false);
    });
  }
  
  // Load and display auto-buy buildings state
  function loadAutoBuyBuildingsState() {
    browser.storage.local.get(['autoBuyBuildingsEnabled']).then(function(result) {
      const isEnabled = result.autoBuyBuildingsEnabled || false;
      autoBuyBuildingsToggle.checked = isEnabled;
      updateAutoBuyBuildingsStatus(isEnabled);
    }).catch(function(error) {
      autoBuyBuildingsToggle.checked = false;
      updateAutoBuyBuildingsStatus(false);
    });
  }
  
  // Load and display auto-buy upgrades state
  function loadAutoBuyUpgradesState() {
    browser.storage.local.get(['autoBuyUpgradesEnabled']).then(function(result) {
      const isEnabled = result.autoBuyUpgradesEnabled || false;
      autoBuyUpgradesToggle.checked = isEnabled;
      updateAutoBuyUpgradesStatus(isEnabled);
    }).catch(function(error) {
      autoBuyUpgradesToggle.checked = false;
      updateAutoBuyUpgradesStatus(false);
    });
  }
  
  // Update auto-clicker status display
  function updateAutoClickerStatus(isEnabled) {
    if (isEnabled) {
      autoClickerStatus.textContent = 'Auto-clicker is ACTIVE (clicking every 50ms)';
      autoClickerStatus.style.color = '#4CAF50';
    } else {
      autoClickerStatus.textContent = 'Auto-clicker is disabled';
      autoClickerStatus.style.color = '#ccc';
    }
  }
  
  // Update auto-buy buildings status display
  function updateAutoBuyBuildingsStatus(isEnabled) {
    if (isEnabled) {
      autoBuyBuildingsStatus.textContent = 'Auto-buy buildings is ACTIVE (buying every 100ms)';
      autoBuyBuildingsStatus.style.color = '#4CAF50';
    } else {
      autoBuyBuildingsStatus.textContent = 'Auto-buy buildings is disabled';
      autoBuyBuildingsStatus.style.color = '#ccc';
    }
  }
  
  // Update auto-buy upgrades status display
  function updateAutoBuyUpgradesStatus(isEnabled) {
    if (isEnabled) {
      autoBuyUpgradesStatus.textContent = 'Auto-buy upgrades is ACTIVE (buying every 100ms)';
      autoBuyUpgradesStatus.style.color = '#4CAF50';
    } else {
      autoBuyUpgradesStatus.textContent = 'Auto-buy upgrades is disabled';
      autoBuyUpgradesStatus.style.color = '#ccc';
    }
  }
  
  // Handle auto-clicker toggle
  autoClickerToggle.addEventListener('change', function() {
    const isEnabled = autoClickerToggle.checked;
    
    // Save the state
    browser.storage.local.set({ autoClickerEnabled: isEnabled }).then(function() {
      updateAutoClickerStatus(isEnabled);
      
      // Send message to content script to toggle auto-clicker
      browser.tabs.query({ active: true, currentWindow: true }).then(function(tabs) {
        if (tabs[0]) {
          browser.tabs.sendMessage(tabs[0].id, {
            action: 'toggleAutoClicker',
            enabled: isEnabled
          }).catch(function(error) {
            console.log('Could not send message to content script (tab may not have Cookie Clicker loaded):', error);
          });
        }
      });
    }).catch(function(error) {
      // Silently handle storage errors
    });
  });

  // Handle auto-buy buildings toggle
  autoBuyBuildingsToggle.addEventListener('change', function() {
    const isEnabled = autoBuyBuildingsToggle.checked;
    
    // Save the state
    browser.storage.local.set({ autoBuyBuildingsEnabled: isEnabled }).then(function() {
      updateAutoBuyBuildingsStatus(isEnabled);
      
      // Send message to content script to toggle auto-buy buildings
      browser.tabs.query({ active: true, currentWindow: true }).then(function(tabs) {
        if (tabs[0]) {
          browser.tabs.sendMessage(tabs[0].id, {
            action: 'toggleAutoBuyBuildings',
            enabled: isEnabled
          }).catch(function(error) {
            console.log('Could not send message to content script (tab may not have Cookie Clicker loaded):', error);
          });
        }
      });
    }).catch(function(error) {
      // Silently handle storage errors
    });
  });

  // Handle auto-buy upgrades toggle
  autoBuyUpgradesToggle.addEventListener('change', function() {
    const isEnabled = autoBuyUpgradesToggle.checked;
    
    // Save the state
    browser.storage.local.set({ autoBuyUpgradesEnabled: isEnabled }).then(function() {
      updateAutoBuyUpgradesStatus(isEnabled);
      
      // Send message to content script to toggle auto-buy upgrades
      browser.tabs.query({ active: true, currentWindow: true }).then(function(tabs) {
        if (tabs[0]) {
          browser.tabs.sendMessage(tabs[0].id, {
            action: 'toggleAutoBuyUpgrades',
            enabled: isEnabled
          }).catch(function(error) {
            console.log('Could not send message to content script (tab may not have Cookie Clicker loaded):', error);
          });
        }
      });
    }).catch(function(error) {
      // Silently handle storage errors
    });
  });

  // Initial load
  loadAutoClickerState();
  loadAutoBuyBuildingsState();
  loadAutoBuyUpgradesState();
});
