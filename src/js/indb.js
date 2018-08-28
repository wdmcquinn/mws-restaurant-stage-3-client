const idb = require('idb');

module.exports = {
   dbPromise: idb.open('places', 2, upgradeDB => {
    switch (upgradeDB.oldVersion) {
      case 0:
      //Placeholder for database creation
      upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
    }
  })
}
