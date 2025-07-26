// Content script - Inject auto-clicker into page context with toggle control
(function() {
  'use strict';
  
  console.log('Click the Cookie extension loaded - injecting auto-clicker into page context');
  
  let autoClickerEnabled = false;
  
  // Inject script into the page's context so it can access the Game object
  const script = document.createElement('script');
  script.textContent = `
    (function() {
      console.log('Auto-clicker script injected into page context');
      
      let autoClickerInterval = null;
      let gameReady = false;
      let originalVolume = null;
      
      function startAutoClicker() {
        if (autoClickerInterval) {
          clearInterval(autoClickerInterval);
        }
        
        // Store original volume and mute sounds during auto-clicking
        originalVolume = Game.volume;
        Game.volume = 0;
        
        autoClickerInterval = setInterval(function() {
          Game.ClickCookie();
        }, 50);
        
        console.log('Auto-clicker started (50ms interval) in page context with sounds muted');
      }
      
      function stopAutoClicker() {
        if (autoClickerInterval) {
          clearInterval(autoClickerInterval);
          autoClickerInterval = null;
          
          // Restore original volume when stopping
          if (originalVolume !== null) {
            Game.volume = originalVolume;
            originalVolume = null;
          }
        }
        console.log('Auto-clicker stopped in page context with sounds restored');
      }
      
      function waitForGame() {
        if (typeof Game !== 'undefined' && Game.ClickCookie) {
          console.log('Game object found in page context - auto-clicker ready');
          gameReady = true;
        } else {
          console.log('Game object not ready yet in page context, waiting...');
          setTimeout(waitForGame, 100);
        }
      }
      
      // Listen for toggle messages from content script
      window.addEventListener('message', function(event) {
        if (event.source !== window) return;
        
        if (event.data.type === 'TOGGLE_AUTO_CLICKER') {
          if (gameReady) {
            if (event.data.enabled) {
              startAutoClicker();
            } else {
              stopAutoClicker();
            }
          } else {
            console.log('Game not ready yet, cannot toggle auto-clicker');
          }
        }
      });
      
      // Start waiting for Game object
      waitForGame();
    })();
  `;
  
  // Inject the script into the page
  (document.head || document.documentElement).appendChild(script);
  script.remove(); // Clean up the script element
  
  console.log('Auto-clicker injection complete');
  
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
    console.error('Error loading auto-clicker state:', error);
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
