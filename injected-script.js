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
  
  // Calculate building CPS per cookie using Cookie Clicker's exact calculation
  function calculateBuildingCpsPerCookie(building) {
    if (!building || building.price <= 0) return 0;
    
    // Use Cookie Clicker's exact formula from main.js line 8083 and 8096:
    // (me.storedTotalCps/me.amount)*Game.globalCpsMult
    let perBuildingCps = 0;
    
    if (building.amount > 0) {
      // For buildings we own, use Cookie Clicker's exact tooltip calculation
      perBuildingCps = (building.storedTotalCps / building.amount) * Game.globalCpsMult;
    } else {
      // For buildings we don't own, use the stored CPS with global multiplier
      // This represents what one building would produce
      perBuildingCps = building.storedCps * Game.globalCpsMult;
    }
    
    // Add grandma synergy boost calculation (only for grandmas)
    // This includes the additional value grandmas provide by boosting other buildings
    if (building.name === 'Grandma' && Game.GrandmaSynergies && building.amount > 0) {
      let synergyBoost = 0;
      
      // Calculate synergy boost from grandmas to other buildings
      // This matches the calculation from main.js lines 8028-8037
      for (let i in Game.GrandmaSynergies) {
        if (Game.Has(Game.GrandmaSynergies[i])) {
          let other = Game.Upgrades[Game.GrandmaSynergies[i]].buildingTie;
          let mult = building.amount * 0.01 * (1 / (other.id - 1));
          let boost = (other.storedTotalCps * Game.globalCpsMult) - (other.storedTotalCps * Game.globalCpsMult) / (1 + mult);
          synergyBoost += boost;
        }
      }
      
      // Add the synergy boost divided by the number of grandmas to get per-grandma contribution
      perBuildingCps += synergyBoost / building.amount;
    }
    
    // Return CPS per cookie spent (efficiency)
    return perBuildingCps / building.price;  }
  
  // Global efficiency update functions (moved from initBuildingEfficiency for access from auto-buy interval)
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

  // Building efficiency display functionality
  function initBuildingEfficiency() {
    
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
    
    // Initial setup
    addEfficiencyDisplays();
    
    // Efficiency updates are now handled by the unified auto-buy interval (100ms)
    // This provides much more responsive efficiency display updates
  }
  
  // Unified auto-buy functionality
  function startAutoBuy() {
    if (autoBuyInterval) {
      clearInterval(autoBuyInterval);
    }
    
    autoBuyInterval = setInterval(function() {
      // Update efficiency displays for responsive feedback
      if (gameReady && Game.ObjectsById) {
        // Add efficiency displays to any new buildings
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
        });
        
        // Update all efficiency displays
        updateAllEfficiencies();
      }
      
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
    
    let globalMostEfficientBuilding = null;
    let globalBestEfficiency = 0;
    let affordableMostEfficientBuilding = null;
    let affordableBestEfficiency = 0;
    
    // First, find the most efficient building overall (regardless of affordability)
    Game.ObjectsById.forEach(function(building) {
      if (!building || building.price <= 0) return;
      
      const efficiency = calculateBuildingCpsPerCookie(building);
      if (efficiency > globalBestEfficiency) {
        globalBestEfficiency = efficiency;
        globalMostEfficientBuilding = building;
      }
      
      // Also track the most efficient affordable building
      if (building.price <= Game.cookies && efficiency > affordableBestEfficiency) {
        affordableBestEfficiency = efficiency;
        affordableMostEfficientBuilding = building;
      }
    });
    
    // Decision logic: Only buy if the affordable building is the global most efficient,
    // or if the efficiency difference is negligible (within 5%)
    if (affordableMostEfficientBuilding && globalMostEfficientBuilding) {
      const efficiencyRatio = affordableBestEfficiency / globalBestEfficiency;
      
      if (affordableMostEfficientBuilding === globalMostEfficientBuilding || efficiencyRatio >= 0.95) {
        // Buy the affordable building if it's the globally most efficient or very close
        affordableMostEfficientBuilding.buy();
        console.log('Auto-buy: Purchased', affordableMostEfficientBuilding.name, 'for', affordableMostEfficientBuilding.price, 'cookies (efficiency:', affordableBestEfficiency.toExponential(4), ')');
      } else {
        // Wait and save up for the more efficient building
        console.log('Auto-buy: Saving for', globalMostEfficientBuilding.name, '(need', globalMostEfficientBuilding.price, 'cookies, have', Game.cookies, ') - efficiency:', globalBestEfficiency.toExponential(4), 'vs affordable', affordableBestEfficiency.toExponential(4));
      }
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
