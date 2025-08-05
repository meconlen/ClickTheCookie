// Debug buildings properties
if (typeof Game !== 'undefined' && Game.ObjectsById) {
  console.log('Available buildings:');
  Game.ObjectsById.forEach((building, index) => {
    if (building) {
      console.log(`Building ${index}: ${building.name}`);
      console.log('  - amount:', building.amount);
      console.log('  - price:', building.price);
      console.log('  - storedCps:', building.storedCps);
      console.log('  - baseCps:', building.baseCps);
      console.log('  - storedTotalCps:', building.storedTotalCps);
      console.log('  - cps:', building.cps);
      if (typeof building.cps === 'function') {
        console.log('  - cps():', building.cps());
      }
      console.log('  - All properties:', Object.keys(building));
      console.log('---');
    }
  });
}
