// Content script - Inject auto-clicker into page context with toggle control
(function() {
  'use strict';
  
  let autoClickerEnabled = false;
  
  // Load and inject the external script into the page's context
  function injectScript() {
    const script = document.createElement('script');
    script.src = browser.runtime.getURL('injected-script.js');
    script.onload = function() {
      this.remove(); // Clean up the script element after loading
    };
    (document.head || document.documentElement).appendChild(script);
  }
  
  // Inject the script
  injectScript();
  
  // Load auto-clicker state from storage
  browser.storage.local.get(['autoClickerEnabled']).then(function(result) {
    autoClickerEnabled = result.autoClickerEnabled || false;
    if (autoClickerEnabled) {
      // Send toggle message to injected script
      window.postMessage({
        type: 'TOGGLE_AUTO_CLICKER',
        enabled: true
      }, '*');
    }
  }).catch(function(error) {
    // Silently handle storage errors
  });
  
  // Listen for messages from popup
  browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'toggleAutoClicker') {
      autoClickerEnabled = message.enabled;
      
      // Save state to storage
      browser.storage.local.set({ autoClickerEnabled: autoClickerEnabled });
      
      // Send toggle message to injected script
      window.postMessage({
        type: 'TOGGLE_AUTO_CLICKER',
        enabled: autoClickerEnabled
      }, '*');
      
      sendResponse({ success: true });
    }
  });
  
})();
