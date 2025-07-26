// Content script - Inject auto-clicker into page context with toggle control
(function() {
  'use strict';
  
  console.log('Click the Cookie extension loaded - injecting auto-clicker into page context');
  
  let autoClickerEnabled = false;
  let autoBuyEnabled = false;
  
  // Inject script into the page's context so it can access the Game object
  const script = document.createElement('script');
  script.textContent = `
    (function() {
      console.log('Auto-clicker script injected into page context');
      
      let autoClickerInterval = null;
      let gameReady = false;
      let originalVolume = null;
      let autoBuyInterval = null;
      
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
          
          // Find the most efficient building for highlighting
          let mostEfficientBuilding = null;
          let bestEfficiency = 0;
          
          Game.ObjectsById.forEach(function(building) {
            if (!building || building.price <= 0) return;
            
            const efficiency = building.storedCps / building.price;
            if (efficiency > bestEfficiency) {
              bestEfficiency = efficiency;
              mostEfficientBuilding = building;
            }
          });
          
          Game.ObjectsById.forEach(function(building, index) {
            const buildingElement = document.getElementById('product' + index);
            if (!buildingElement) return;
            
            // Check if efficiency display already exists
            let efficiencyDisplay = buildingElement.querySelector('.building-efficiency');
            if (!efficiencyDisplay) {
              efficiencyDisplay = document.createElement('div');
              efficiencyDisplay.className = 'building-efficiency';
              efficiencyDisplay.style.cssText = 'position: absolute; right: 50%; bottom: 20px; transform: translateX(50%); font-size: 11px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px; pointer-events: none; z-index: 1000; text-align: center;';
              
              // Make sure the building element has relative positioning
              if (buildingElement.style.position !== 'relative') {
                buildingElement.style.position = 'relative';
              }
              
              buildingElement.appendChild(efficiencyDisplay);
            }
            
            // Calculate and display efficiency with color coding
            updateBuildingEfficiency(building, efficiencyDisplay, building === mostEfficientBuilding);
          });
        }
        
        function updateBuildingEfficiency(building, displayElement, isMostEfficient) {
          if (!building || !displayElement) return;
          
          const price = building.price;
          const cps = building.storedCps;
          
          if (price > 0 && cps > 0) {
            const efficiency = cps / price;
            displayElement.textContent = 'CPS/C: ' + efficiency.toExponential(4);
            displayElement.style.color = isMostEfficient ? '#2196F3' : '#4CAF50'; // Blue for most efficient, green for others
          } else if (price > 0) {
            displayElement.textContent = 'CPS/C: 0.0000e+0';
            displayElement.style.color = '#999';
          } else {
            displayElement.textContent = 'CPS/C: ---';
            displayElement.style.color = '#666';
          }
        }
        
        // Update efficiency displays periodically
        function updateAllEfficiencies() {
          if (!Game.ObjectsById) return;
          
          // Find the most efficient building for highlighting
          let mostEfficientBuilding = null;
          let bestEfficiency = 0;
          
          Game.ObjectsById.forEach(function(building) {
            if (!building || building.price <= 0) return;
            
            const efficiency = building.storedCps / building.price;
            if (efficiency > bestEfficiency) {
              bestEfficiency = efficiency;
              mostEfficientBuilding = building;
            }
          });
          
          Game.ObjectsById.forEach(function(building, index) {
            const buildingElement = document.getElementById('product' + index);
            if (!buildingElement) return;
            
            const efficiencyDisplay = buildingElement.querySelector('.building-efficiency');
            if (efficiencyDisplay) {
              updateBuildingEfficiency(building, efficiencyDisplay, building === mostEfficientBuilding);
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
      
      // Auto-buy functionality
      function startAutoBuy() {
        if (autoBuyInterval) {
          clearInterval(autoBuyInterval);
        }
        
        autoBuyInterval = setInterval(function() {
          if (!Game.ObjectsById || Game.cookies < 1) return;
          
          let bestBuilding = null;
          let bestEfficiency = 0;
          
          // Find the building with the highest CPS/C overall (regardless of affordability)
          Game.ObjectsById.forEach(function(building) {
            if (!building || building.price <= 0) return;
            
            const efficiency = building.storedCps / building.price;
            if (efficiency > bestEfficiency) {
              bestEfficiency = efficiency;
              bestBuilding = building;
            }
          });
          
          // Only buy if we can afford the most efficient building
          if (bestBuilding && bestBuilding.price <= Game.cookies) {
            bestBuilding.buy();
            console.log('Auto-buy purchased:', bestBuilding.name, 'for efficiency:', bestEfficiency.toFixed(6));
          }
        }, 100); // Check every 100ms
        
        console.log('Auto-buy started (100ms interval) in page context');
      }
      
      function stopAutoBuy() {
        if (autoBuyInterval) {
          clearInterval(autoBuyInterval);
          autoBuyInterval = null;
        }
        console.log('Auto-buy stopped in page context');
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
        } else if (event.data.type === 'TOGGLE_AUTO_BUY') {
          if (gameReady) {
            if (event.data.enabled) {
              startAutoBuy();
            } else {
              stopAutoBuy();
            }
          } else {
            console.log('Game not ready yet, cannot toggle auto-buy');
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
  
  // Load auto-clicker and auto-buy state from storage
  browser.storage.local.get(['autoClickerEnabled', 'autoBuyEnabled']).then(function(result) {
    autoClickerEnabled = result.autoClickerEnabled || false;
    autoBuyEnabled = result.autoBuyEnabled || false;
    
    if (autoClickerEnabled) {
      // Send toggle message to injected script
      window.postMessage({
        type: 'TOGGLE_AUTO_CLICKER',
        enabled: true
      }, '*');
    }
    
    if (autoBuyEnabled) {
      // Send toggle message to injected script
      window.postMessage({
        type: 'TOGGLE_AUTO_BUY',
        enabled: true
      }, '*');
    }
  }).catch(function(error) {
    console.error('Error loading extension state:', error);
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
    } else if (message.action === 'toggleAutoBuy') {
      autoBuyEnabled = message.enabled;
      
      // Save state to storage
      browser.storage.local.set({ autoBuyEnabled: autoBuyEnabled });
      
      // Send toggle message to injected script
      window.postMessage({
        type: 'TOGGLE_AUTO_BUY',
        enabled: autoBuyEnabled
      }, '*');
      
      sendResponse({ success: true });
    }
  });
  
})();
