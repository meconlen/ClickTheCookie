// Content script - Simple click counter for Cookie Clicker with auto-clicker
(function() {
  'use strict';
  
  console.log('Click the Cookie extension loaded - tracking clicks and auto-clicker ready');
  
  let clickCount = 0;
  let autoClickerEnabled = false;
  let autoClickerInterval = null;
  
  // Get the big cookie element
  const bigCookie = document.getElementById('bigCookie');
  if (bigCookie) {
    // Count manual clicks on the big cookie
    bigCookie.addEventListener('click', function() {
      clickCount++;
      
      // Store the count (no console logging for performance)
      browser.storage.local.set({ clickCount: clickCount });
    });
    
    console.log('Click counter attached to big cookie');
  } else {
    console.log('Big cookie element not found - click counter not attached');
  }
  
  // Auto-clicker function
  function startAutoClicker() {
    if (autoClickerInterval) {
      clearInterval(autoClickerInterval);
    }
    
    autoClickerInterval = setInterval(function() {
      if (bigCookie && autoClickerEnabled) {
        // Simulate a click on the big cookie
        bigCookie.click();
      }
    }, 50); // 50ms interval as requested
    
    console.log('Auto-clicker started (50ms interval)');
  }
  
  function stopAutoClicker() {
    if (autoClickerInterval) {
      clearInterval(autoClickerInterval);
      autoClickerInterval = null;
    }
    console.log('Auto-clicker stopped');
  }
  
  // Load auto-clicker state from storage
  browser.storage.local.get(['autoClickerEnabled']).then(function(result) {
    autoClickerEnabled = result.autoClickerEnabled || false;
    if (autoClickerEnabled && bigCookie) {
      startAutoClicker();
    }
  }).catch(function(error) {
    console.error('Error loading auto-clicker state:', error);
  });
  
  // Listen for messages from popup
  browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'toggleAutoClicker') {
      autoClickerEnabled = message.enabled;
      
      if (autoClickerEnabled && bigCookie) {
        startAutoClicker();
      } else {
        stopAutoClicker();
      }
      
      sendResponse({ success: true });
    }
  });
  
})();
