// Background script to ensure browser action is enabled
browser.runtime.onInstalled.addListener(() => {
  console.log('Click the Cookie extension installed');
  
  // Explicitly enable the browser action for all tabs
  browser.browserAction.enable();
  
  // Set icon explicitly with multiple sizes
  browser.browserAction.setIcon({
    path: "icons/icon-20.png"
  });
  
  // Set title
  browser.browserAction.setTitle({
    title: "Click the Cookie - Session Counter"
  });
  
  // Try to show the browser action explicitly
  browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    if (tabs[0]) {
      browser.browserAction.enable(tabs[0].id);
    }
  });
});

// Also enable on any tab updates
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    browser.browserAction.enable(tabId);
  }
});

// Enable when any tab becomes active
browser.tabs.onActivated.addListener((activeInfo) => {
  browser.browserAction.enable(activeInfo.tabId);
});

// Log when extension starts
console.log('Click the Cookie background script loaded - forcing toolbar icon');
