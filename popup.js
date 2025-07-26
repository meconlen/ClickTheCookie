// Popup script - Simple click counter display and auto-clicker controls
document.addEventListener('DOMContentLoaded', function() {
  console.log('Click the Cookie extension popup loaded');
  
  // Get DOM elements
  const clickCountElement = document.getElementById('clickCount');
  const autoClickerToggle = document.getElementById('autoClickerToggle');
  const autoClickerStatus = document.getElementById('autoClickerStatus');
  
  // Load and display the click count
  function updateClickCount() {
    browser.storage.local.get(['clickCount']).then(function(result) {
      const count = result.clickCount || 0;
      clickCountElement.textContent = count.toLocaleString();
    }).catch(function(error) {
      console.error('Error loading click count:', error);
      clickCountElement.textContent = '0';
    });
  }
  
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
  
  // Initial load
  updateClickCount();
  loadAutoClickerState();
  
  // Update the count every second while popup is open
  setInterval(updateClickCount, 1000);
});
