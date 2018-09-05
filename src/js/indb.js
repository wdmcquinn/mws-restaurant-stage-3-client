/**
 * Create DBPromise object for importing to other files
 */
const idb = require('idb');

module.exports = {
   dbPromise: idb.open('places', 3, upgradeDB => {
    switch (upgradeDB.oldVersion) {
      case 0:
      //Create restaurants objectstore
      upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
      case 1:
      //Add Outbox
      upgradeDB.createObjectStore('outbox', {
        keyPath: 'id',
        autoIncrement: true
      });
      //Add reviews Objectstore and create index
      let reviews = upgradeDB.createObjectStore('reviews', {
        keyPath: 'id'
      });
      reviews.createIndex('restaurant_id', 'restaurant_id');
    }
  })
}
