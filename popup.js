// Popup script - Simple click counter display
document.addEventListener('DOMContentLoaded', function() {
  console.log('Click the Cookie extension popup loaded');
  
  // Load and display the click count
  const clickCountElement = document.getElementById('clickCount');
  
  browser.storage.local.get(['clickCount']).then(function(result) {
    const count = result.clickCount || 0;
    clickCountElement.textContent = count.toLocaleString();
    console.log('Loaded click count:', count);
  }).catch(function(error) {
    console.error('Error loading click count:', error);
    clickCountElement.textContent = '0';
  });
  
  // Update the count every second while popup is open
  setInterval(function() {
    browser.storage.local.get(['clickCount']).then(function(result) {
      const count = result.clickCount || 0;
      clickCountElement.textContent = count.toLocaleString();
    });
  }, 1000);
});
