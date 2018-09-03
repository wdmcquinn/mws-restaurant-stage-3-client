const idb = require('idb');

module.exports = {
   dbPromise: idb.open('places', 3, upgradeDB => {
    switch (upgradeDB.oldVersion) {
      case 0:
      //Placeholder for database creation
      upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
      case 1:
      //Add Outbox
      upgradeDB.createObjectStore('outbox', {
        keyPath: 'id',
        autoIncrement: true
      });
      let reviews = upgradeDB.createObjectStore('reviews', {
        keyPath: 'id'
      });
      reviews.createIndex('restaurant_id', 'restaunt_id');
    }
  })
}
