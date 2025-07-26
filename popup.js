// Popup script - Auto-clicker and Auto-buy controls
document.addEventListener('DOMContentLoaded', function() {
  console.log('Click the Cookie extension popup loaded');
  
  // Get DOM elements
  const autoClickerToggle = document.getElementById('autoClickerToggle');
  const autoClickerStatus = document.getElementById('autoClickerStatus');
  const autoBuyToggle = document.getElementById('autoBuyToggle');
  const autoBuyStatus = document.getElementById('autoBuyStatus');
  
  // Load and display auto-clicker state
  function loadAutoClickerState() {
    browser.storage.local.get(['autoClickerEnabled']).then(function(result) {
      const isEnabled = result.autoClickerEnabled || false;
      autoClickerToggle.checked = isEnabled;
      updateAutoClickerStatus(isEnabled);
    }).catch(function(error) {
      console.error('Error loading auto-clicker state:', error);
      autoClickerToggle.checked = false;
      updateAutoClickerStatus(false);
    });
  }
  
  // Load and display auto-buy state
  function loadAutoBuyState() {
    browser.storage.local.get(['autoBuyEnabled']).then(function(result) {
      const isEnabled = result.autoBuyEnabled || false;
      autoBuyToggle.checked = isEnabled;
      updateAutoBuyStatus(isEnabled);
    }).catch(function(error) {
      console.error('Error loading auto-buy state:', error);
      autoBuyToggle.checked = false;
      updateAutoBuyStatus(false);
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
  
  // Update auto-buy status display
  function updateAutoBuyStatus(isEnabled) {
    if (isEnabled) {
      autoBuyStatus.textContent = 'Auto-buy is ACTIVE (buying every 100ms)';
      autoBuyStatus.style.color = '#4CAF50';
    } else {
      autoBuyStatus.textContent = 'Auto-buy is disabled';
      autoBuyStatus.style.color = '#ccc';
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
      console.error('Error saving auto-clicker state:', error);
    });
  });
  
  // Handle auto-buy toggle
  autoBuyToggle.addEventListener('change', function() {
    const isEnabled = autoBuyToggle.checked;
    
    // Save the state
    browser.storage.local.set({ autoBuyEnabled: isEnabled }).then(function() {
      updateAutoBuyStatus(isEnabled);
      
      // Send message to content script to toggle auto-buy
      browser.tabs.query({ active: true, currentWindow: true }).then(function(tabs) {
        if (tabs[0]) {
          browser.tabs.sendMessage(tabs[0].id, {
            action: 'toggleAutoBuy',
            enabled: isEnabled
          }).catch(function(error) {
            console.log('Could not send message to content script (tab may not have Cookie Clicker loaded):', error);
          });
        }
      });
    }).catch(function(error) {
      console.error('Error saving auto-buy state:', error);
    });
  });
  
  // Initial load
  loadAutoClickerState();
  loadAutoBuyState();
});
