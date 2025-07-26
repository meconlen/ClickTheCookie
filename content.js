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
          
          // Initialize building efficiency display
          initBuildingEfficiency();
        } else {
          console.log('Game object not ready yet in page context, waiting...');
          setTimeout(waitForGame, 100);
        }
      }
      
      // Building efficiency display functionality
      function initBuildingEfficiency() {
        console.log('Initializing building efficiency display');
        
        function addEfficiencyDisplays() {
          if (!Game.ObjectsById) return;
          
          Game.ObjectsById.forEach(function(building, index) {
            const buildingElement = document.getElementById('product' + index);
            if (!buildingElement) return;
            
            // Check if efficiency display already exists
            let efficiencyDisplay = buildingElement.querySelector('.building-efficiency');
            if (!efficiencyDisplay) {
              efficiencyDisplay = document.createElement('div');
              efficiencyDisplay.className = 'building-efficiency';
              efficiencyDisplay.style.cssText = 'font-size: 10px; color: #4CAF50; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 1px rgba(0,0,0,0.5);';
              
              // Find the right place to insert (after the price element)
              const priceElement = buildingElement.querySelector('.price');
              if (priceElement && priceElement.parentNode) {
                priceElement.parentNode.insertBefore(efficiencyDisplay, priceElement.nextSibling);
              } else {
                buildingElement.appendChild(efficiencyDisplay);
              }
            }
            
            // Calculate and display efficiency
            updateBuildingEfficiency(building, efficiencyDisplay);
          });
        }
        
        function updateBuildingEfficiency(building, displayElement) {
          if (!building || !displayElement) return;
          
          const price = building.price;
          const cps = building.storedCps;
          
          if (price > 0 && cps > 0) {
            const efficiency = cps / price;
            displayElement.textContent = 'CPS/C: ' + (efficiency < 0.001 ? efficiency.toExponential(2) : efficiency.toFixed(3));
            displayElement.style.color = '#4CAF50';
          } else if (price > 0) {
            displayElement.textContent = 'CPS/C: 0.000';
            displayElement.style.color = '#999';
          } else {
            displayElement.textContent = 'CPS/C: ---';
            displayElement.style.color = '#666';
          }
        }
        
        // Update efficiency displays periodically
        function updateAllEfficiencies() {
          if (!Game.ObjectsById) return;
          
          Game.ObjectsById.forEach(function(building, index) {
            const buildingElement = document.getElementById('product' + index);
            if (!buildingElement) return;
            
            const efficiencyDisplay = buildingElement.querySelector('.building-efficiency');
            if (efficiencyDisplay) {
              updateBuildingEfficiency(building, efficiencyDisplay);
            }
          });
        }
        
        // Initial setup
        addEfficiencyDisplays();
        
        // Update every 2 seconds
        setInterval(function() {
          addEfficiencyDisplays(); // Add to any new buildings
          updateAllEfficiencies(); // Update all existing displays
        }, 2000);
        
        console.log('Building efficiency display initialized');
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
