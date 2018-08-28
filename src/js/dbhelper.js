
/**
 * Common database helper functions.
 */
/**
 * import the dbPromise Object
 */
import { dbPromise } from './indb';


module.exports = class DBHelper {

/**
 * Database URL.
 * Change this to restaurants.json file location on your server.
 */
  static get DATABASE_URL() {
    const port = 1337  // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

/**
 * Fetch all restaurants.
 */
  static fetchRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL)
      .then(response => response.json())
      .then(restaurants => callback(null, restaurants))
      .catch(error => callback(error, console.log(error))); //Server Error
  }

/**
 * Fetch a restaurant by its ID.
 */
  static fetchRestaurantById(id, callback) {
    // fetch restaurant by id
    fetch(`${DBHelper.DATABASE_URL}?id=${id}`)
      .then(response => response.json())
      .then(restaurant => callback(null, restaurant))
      .catch(err => callback(err, null));
  }

/**
 * Fetch restaurants by a cuisine type with proper error handling.
 */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants by cuisine type.
    fetch(`${DBHelper.DATABASE_URL}?cuisine=${cuisine}`)
    .then(response => response.json())
    .then(restaurants => callback(null, restaurants))
    .catch(err => callback(err, null));
  }

/**
 * Fetch restaurants by a neighborhood with proper error handling.
 */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants by neighnorhood
    fetch(`${DBHelper.DATABASE_URL}?neighborhood=${neighborhood}`)
    .then(response => response.json())
    .then(restaurants => callback(null, restaurants))
    .catch(err => callback(err, null));
  }

/**
 * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
 */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    fetch(`${DBHelper.DATABASE_URL}`)
    .then(response => response.json())
    .then(restaurants => {
      let results = restaurants;
      if (cuisine !== 'all'){
        results = results.filter(r => r.cuisine_type == cuisine);
      }
      if (neighborhood !== 'all'){
        results = results.filter(r => r.neighborhood == neighborhood);
      }

      callback(null, results);
    })
    .catch(err => callback(err, null));
  }

  /**
   * 
   * Fetch unique neighborhoods and cuisines for the select boxes
   */
  static fetchFilters(callback){
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) callback(error, null);
      const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
      const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
      const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
      const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
    callback(null, uniqueNeighborhoods, uniqueCuisines);
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(map);
    return marker;
  }

  static change_fav_status(restaurant){
    console.log(restaurant.id);
    if (!restaurant.is_favorite || restaurant.is_favorite.toString() == 'false'){
      restaurant.is_favorite = 'true';
    } else if (restaurant.is_favorite.toString() == 'true'){
      restaurant.is_favorite = 'false';
    } else {
      restaurant.is_favorite = 'false';
    }
    console.log(restaurant.id, restaurant.is_favorite);
    dbPromise.then(function(db) {
      let tx = db.transaction('restaurants', 'readwrite');
      let store = tx.objectStore('restaurants');
      store.put({
        id: restaurant.id,
        data: restaurant
      });
      return tx.complete;
    })
  }
};
