# Testing Guide for Cookie Clicker Auto-Clicker

## Quick Start Testing

### 1. Install the Extension

**Option A: Temporary Install (Recommended for testing)**
1. Open Firefox
2. Navigate to `about:debugging`
3. Click "This Firefox" 
4. Click "Load Temporary Add-on..."
5. Navigate to the `build/` folder and select `manifest.json`

**Option B: Package Install**
1. In Firefox, go to `about:addons`
2. Click the gear icon
3. Select "Install Add-on From File..."
4. Choose `cookie-clicker-auto-clicker.zip`

### 2. Test the Extension

1. **Navigate to Cookie Clicker**: Go to https://orteil.dashnet.org/cookieclicker/
2. **Wait for Loading**: Let the game fully load (you should see the big cookie)
3. **Open Extension**: Click the extension icon in the toolbar (should show a cookie icon)
4. **Test Basic Functionality**:
   - Popup should open with controls
   - Settings should be toggleable
   - Click speed input should accept values 10-5000

### 3. Test Auto-Clicking

1. **Enable Auto-Click**: Check the "Auto-click big cookie" checkbox
2. **Set Speed**: Set click speed to 100ms (good for testing)
3. **Start**: Click "Start Auto-Clicker"
4. **Verify**: 
   - Status should change to "Active" (green)
   - Cookie should be clicked automatically
   - Cookie count should increase rapidly
   - Stop button should appear

### 4. Test Auto-Features

1. **Enable Auto-Upgrade**: Check the "Auto-buy upgrades" checkbox
2. **Enable Auto-Building**: Check the "Auto-buy buildings" checkbox  
3. **Wait**: Let the extension run for a few minutes
4. **Verify**:
   - Upgrades should be purchased automatically when available
   - Buildings should be purchased when affordable
   - Most expensive buildings should be prioritized

### 5. Test Persistence

1. **Configure Settings**: Set specific values (e.g., speed 200ms, enable auto-features)
2. **Close Popup**: Close the extension popup
3. **Reopen Popup**: Click the extension icon again
4. **Verify**: 
   - Settings should be remembered
   - Status should be preserved

### 6. Test Stop Functionality

1. **Stop Extension**: Click "Stop Auto-Clicker"
2. **Verify**:
   - Status changes to "Inactive" (red)
   - Auto-clicking stops immediately
   - Start button reappears

## Troubleshooting Tests

### Test 1: Wrong Website
1. Navigate to any site other than Cookie Clicker
2. Try to start the extension
3. **Expected**: Should handle gracefully, possibly show error

### Test 2: Game Not Loaded
1. Navigate to Cookie Clicker but start extension before game loads
2. **Expected**: Should wait for game or show appropriate message

### Test 3: Performance Test
1. Set click speed to 10ms (minimum)
2. Enable all auto-features
3. Run for 10 minutes
4. **Expected**: Browser should remain responsive

### Test 4: Settings Persistence
1. Set custom settings and start extension
2. Restart Firefox completely
3. Reload Cookie Clicker and open extension
4. **Expected**: Previous settings should be restored

## Expected Behaviors

### Working Correctly
- Cookie clicks increase cookie count
- Upgrades are purchased when affordable and beneficial
- Buildings are purchased in order of efficiency (most expensive first)
- Settings persist across browser sessions
- Extension starts/stops cleanly
- No console errors in browser dev tools

### Issues to Report
- Extension doesn't start or shows errors
- Auto-clicking doesn't work or clicks wrong elements
- Settings don't save or restore incorrectly
- Browser becomes unresponsive
- Console shows JavaScript errors
- Memory leaks during extended use

## Browser Console Monitoring

1. Open Developer Tools: `F12`
2. Go to Console tab
3. Look for messages starting with "Cookie Clicker auto-clicker"
4. Report any error messages

## Performance Monitoring

1. Monitor CPU usage in Task Manager/Activity Monitor
2. Check Firefox memory usage over time
3. Verify browser remains responsive during use

## Test Results Template

```
Date: ___________
Firefox Version: ___________
Extension Version: 1.0

Basic Installation: [PASS/FAIL]
Auto-Click Function: [PASS/FAIL]  
Auto-Upgrade Function: [PASS/FAIL]
Auto-Building Function: [PASS/FAIL]
Settings Persistence: [PASS/FAIL]
Start/Stop Controls: [PASS/FAIL]
Performance (10min test): [PASS/FAIL]

Issues Found:
- 
- 
- 

Notes:
- 
- 
```

---

Report any issues with detailed reproduction steps!
