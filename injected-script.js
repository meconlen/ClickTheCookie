// Injected script that runs in the page context to access Cookie Clicker's Game object
(function() {
  
  let autoClickerInterval = null;
  let gameReady = false;
  let originalVolume = null;
  let autoBuyInterval = null;
  let autoBuyBuildingsEnabled = false;
  let autoBuyUpgradesEnabled = false;
  let goldenCookieInterval = null;
  
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
    
    // Start golden cookie auto-clicking
    startGoldenCookieClicker();
    
    console.log('Auto-clicker started (50ms interval) with golden cookie auto-clicking in page context with sounds muted');
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
    
    // Stop golden cookie auto-clicking
    stopGoldenCookieClicker();
    
    console.log('Auto-clicker and golden cookie clicker stopped in page context with sounds restored');
  }
  
  function waitForGame() {
    if (typeof Game !== 'undefined' && Game.ClickCookie) {
      gameReady = true;
      
      // Initialize building efficiency display
      initBuildingEfficiency();
    } else {
      setTimeout(waitForGame, 100);
    }
  }
  
  // Building efficiency display functionality
  function initBuildingEfficiency() {
    
    // Calculate building CPS per cookie using Cookie Clicker's actual calculation
    function calculateBuildingCpsPerCookie(building) {
      if (!building || building.price <= 0) return 0;
      
      // Get the base CPS for one unit of this building
      let baseCps = 0;
      try {
        baseCps = building.cps(building);
      } catch (error) {
        // Fallback if cps() method fails
        baseCps = building.baseCps || 0;
      }
      
      // Apply the same multipliers that Cookie Clicker uses (from main.js lines 5058-5067)
      let adjustedCps = baseCps;
      
      // Apply ascension and level multipliers (if not in ascension mode)
      if (Game.ascensionMode !== 1) {
        // Building level bonus: +1% per level
        const levelBonus = 1 + (building.level || 0) * 0.01;
        
        // Get buildMult (this is complex but we can approximate or use Game's current value)
        let buildMult = 1;
        // Note: buildMult calculation is complex involving pantheon gods, etc.
        // For now, we'll use a simplified approach or try to access Game's current multipliers
        
        adjustedCps *= levelBonus * buildMult;
      }
      
      // Special case for Grandmas (id=1) with Milkhelp tablets
      if (building.id === 1 && Game.Has && Game.Has('Milkhelp® lactose intolerance relief tablets')) {
        const milkMult = 1; // Simplified - actual calculation is more complex
        adjustedCps *= 1 + 0.05 * (Game.milkProgress || 0) * milkMult;
      }
      
      // Return CPS per cookie spent
      return adjustedCps / building.price;
    }
    
    function addEfficiencyDisplays() {
      if (!Game.ObjectsById) return;
      
      // Find the most efficient building for highlighting
      let mostEfficientBuilding = null;
      let bestEfficiency = 0;
      
      Game.ObjectsById.forEach(function(building) {
        if (!building || building.price <= 0) return;
        
        // Use the proper CPS calculation like Cookie Clicker does
        const efficiency = calculateBuildingCpsPerCookie(building);
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
          efficiencyDisplay.style.cssText = 'position: absolute; right: 20%; bottom: 5px; font-size: 11px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px; pointer-events: none; z-index: 1000; text-align: center;';
          
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
      
      if (price > 0) {
        // Use the proper CPS calculation like Cookie Clicker does
        const efficiency = calculateBuildingCpsPerCookie(building);
        if (efficiency > 0) {
          displayElement.textContent = 'CPS/C: ' + efficiency.toExponential(4);
          displayElement.style.color = isMostEfficient ? '#2196F3' : '#4CAF50';
        } else {
          displayElement.textContent = 'CPS/C: 0.0000e+0';
          displayElement.style.color = '#999';
        }
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
        
        // Use the proper CPS calculation like Cookie Clicker does
        const efficiency = calculateBuildingCpsPerCookie(building);
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
  }
  
  // Unified auto-buy functionality
  function startAutoBuy() {
    if (autoBuyInterval) {
      clearInterval(autoBuyInterval);
    }
    
    autoBuyInterval = setInterval(function() {
      // Auto-buy buildings if enabled
      if (autoBuyBuildingsEnabled) {
        autoBuyMostEfficientBuilding();
      }
      
      // Auto-buy upgrades if enabled
      if (autoBuyUpgradesEnabled) {
        autoBuyAffordableUpgrades();
      }
    }, 100);
  }
  
  function stopAutoBuy() {
    if (autoBuyInterval) {
      clearInterval(autoBuyInterval);
      autoBuyInterval = null;
    }
  }

  // Auto-buy buildings functionality
  function startAutoBuyBuildings() {
    autoBuyBuildingsEnabled = true;
    // Start the unified auto-buy if it's not already running
    if (!autoBuyInterval) {
      startAutoBuy();
    }
  }
  
  function stopAutoBuyBuildings() {
    autoBuyBuildingsEnabled = false;
    // Stop the unified auto-buy if both types are disabled
    if (!autoBuyBuildingsEnabled && !autoBuyUpgradesEnabled) {
      stopAutoBuy();
    }
  }

  // Auto-buy upgrades functionality
  function startAutoBuyUpgrades() {
    autoBuyUpgradesEnabled = true;
    // Start the unified auto-buy if it's not already running
    if (!autoBuyInterval) {
      startAutoBuy();
    }
  }
  
  function stopAutoBuyUpgrades() {
    autoBuyUpgradesEnabled = false;
    // Stop the unified auto-buy if both types are disabled
    if (!autoBuyBuildingsEnabled && !autoBuyUpgradesEnabled) {
      stopAutoBuy();
    }
  }
  
  // Golden cookie auto-clicking functionality
  function startGoldenCookieClicker() {
    if (goldenCookieInterval) {
      clearInterval(goldenCookieInterval);
    }
    
    goldenCookieInterval = setInterval(function() {
      // Check for golden cookies and click them
      if (Game.shimmers && Game.shimmers.length > 0) {
        Game.shimmers.forEach(function(shimmer) {
          if (shimmer.type === 'golden') {
            // Click the golden cookie
            shimmer.pop();
            console.log('Golden cookie clicked automatically!');
          }
        });
      }
      
      // Also check for reindeer during Christmas season
      if (Game.season === 'christmas' && Game.shimmers && Game.shimmers.length > 0) {
        Game.shimmers.forEach(function(shimmer) {
          if (shimmer.type === 'reindeer') {
            shimmer.pop();
            console.log('Reindeer clicked automatically!');
          }
        });
      }
    }, 100); // Check every 100ms for golden cookies
  }
  
  function stopGoldenCookieClicker() {
    if (goldenCookieInterval) {
      clearInterval(goldenCookieInterval);
      goldenCookieInterval = null;
    }
  }
  
  // Auto-buy building functionality
  function autoBuyMostEfficientBuilding() {
    if (!Game.ObjectsById || Game.cookies < 1) return;
    
    let mostEfficientBuilding = null;
    let bestEfficiency = 0;
    
    // Find the most efficient building that we can afford
    Game.ObjectsById.forEach(function(building) {
      if (!building || building.price <= 0 || building.price > Game.cookies) return;
      
      // Use the same efficiency calculation as the display
      const efficiency = calculateBuildingCpsPerCookie(building);
      if (efficiency > bestEfficiency) {
        bestEfficiency = efficiency;
        mostEfficientBuilding = building;
      }
    });
    
    // Buy the most efficient affordable building
    if (mostEfficientBuilding && mostEfficientBuilding.price <= Game.cookies) {
      mostEfficientBuilding.buy();
      console.log('Auto-buy: Purchased', mostEfficientBuilding.name, 'for', mostEfficientBuilding.price, 'cookies (efficiency:', bestEfficiency.toExponential(4), ')');
    }
  }
  
  // Auto-buy upgrades functionality
  function autoBuyAffordableUpgrades() {
    if (!Game.UpgradesInStore || Game.cookies < 1) return;
    
    // Buy all affordable upgrades (they're generally always beneficial)
    Game.UpgradesInStore.forEach(function(upgrade) {
      if (upgrade && upgrade.basePrice && upgrade.basePrice <= Game.cookies) {
        // Skip certain upgrades that might be detrimental or require manual decision
        const skipUpgrades = [
          'One mind', 'Communal brainsweep', 'Elder Covenant', 
          'Revoke Elder Covenant', 'Elder Pledge'
        ];
        
        if (!skipUpgrades.includes(upgrade.name)) {
          upgrade.buy();
          console.log('Auto-buy: Purchased upgrade', upgrade.name, 'for', upgrade.basePrice, 'cookies');
        }
      }
    });
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
      }
    } else if (event.data.type === 'TOGGLE_AUTO_BUY_BUILDINGS') {
      if (gameReady) {
        if (event.data.enabled) {
          startAutoBuyBuildings();
        } else {
          stopAutoBuyBuildings();
        }
      }
    } else if (event.data.type === 'TOGGLE_AUTO_BUY_UPGRADES') {
      if (gameReady) {
        if (event.data.enabled) {
          startAutoBuyUpgrades();
        } else {
          stopAutoBuyUpgrades();
        }
      }
    }
  });
  
  // Start waiting for Game object
  waitForGame();
})();
