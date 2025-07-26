// Background script to ensure browser action is enabled
browser.runtime.onInstalled.addListener(() => {
  console.log('Click the Cookie extension installed');
  
  // Explicitly enable the browser action
  browser.browserAction.enable();
  
  // Set icon explicitly (sometimes helps with display issues)
  browser.browserAction.setIcon({
    path: {
      "16": "icons/icon-16-test.png",
      "32": "icons/icon-32.png"
    }
  });
  
  // Set title
  browser.browserAction.setTitle({
    title: "Click the Cookie"
  });
});

// Log when extension starts
console.log('Click the Cookie background script loaded');
