// Content script - Simple click counter for Cookie Clicker
(function() {
  'use strict';
  
  console.log('Click the Cookie extension loaded - tracking clicks');
  
  let clickCount = 0;
  
  // Count clicks on the big cookie
  const bigCookie = document.getElementById('bigCookie');
  if (bigCookie) {
    bigCookie.addEventListener('click', function() {
      clickCount++;
      
      // Store the count (no console logging for performance)
      browser.storage.local.set({ clickCount: clickCount });
    });
    
    console.log('Click counter attached to big cookie');
  } else {
    console.log('Big cookie element not found - click counter not attached');
  }
  
})();
