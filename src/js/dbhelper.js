/**
 * Common database helper functions.
 */
/**
 * import the dbPromise Object
 */
import { dbPromise } from "./indb";

module.exports = class DBHelper {
  /**
   * Database URLS.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    //const port = 1337  // Change this to your server port
    //return `http://localhost:${port}/restaurants`;
    return "https://mws-backend-technicdad/restaurants";
  }

  static get REVIEWS_URL() {
    //const port = 1337;
    //return `http://localhost:${port}/reviews`;
    return "https://mws-backend-technicdad/restaurants";
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
    id = id.toString();
    fetch(`${DBHelper.DATABASE_URL}?id=${id}`)
      .then(response => response.json())
      .then(restaurant => callback(null, restaurant))
      .catch(err => callback(err, null));
  }
  /**
   * Fetch reviews by restauraunts id
   */
  static fetchReviewsById(id, callback) {
    fetch(`${DBHelper.REVIEWS_URL}/?restaurant_id=${id}`, {
      method: "GET"
    }).then(response => {
      response
        .json()
        .then(response => {
          callback(null, response);
        })
        .catch(err => callback(err, null));
    });
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
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    fetch(`${DBHelper.DATABASE_URL}`)
      .then(response => response.json())
      .then(restaurants => {
        let results = restaurants;
        if (cuisine !== "all") {
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood !== "all") {
          results = results.filter(r => r.neighborhood == neighborhood);
        }

        callback(null, results);
      })
      .catch(err => callback(err, null));
  }
  /**
   * Fetch unique neighborhoods and cuisines for the select boxes
   */
  static fetchFilters(callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) callback(error, null);
      const neighborhoods = restaurants.map(
        (v, i) => restaurants[i].neighborhood
      );
      const uniqueNeighborhoods = neighborhoods.filter(
        (v, i) => neighborhoods.indexOf(v) == i
      );
      const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
      const uniqueCuisines = cuisines.filter(
        (v, i) => cuisines.indexOf(v) == i
      );
      callback(null, uniqueNeighborhoods, uniqueCuisines);
      DBHelper.tryCommit();
    });
  }
  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }
  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `/img/${restaurant.photograph}`;
  }
  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker(
      [restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      }
    );
    marker.addTo(map);
    return marker;
  }
  /**
   *  Huge thanks to Doug Brown for the videos and walkthroughs.
   *  His was the only example i could find that made sense and
   *  allowed me to complete this part.
   */
  /**
   * Change the favorite Status
   */
  static change_fav_status(restaurant) {
    if (
      !restaurant.is_favorite ||
      restaurant.is_favorite.toString() == "false"
    ) {
      restaurant.is_favorite = "true";
    } else if (restaurant.is_favorite.toString() == "true") {
      restaurant.is_favorite = "false";
    } else {
      restaurant.is_favorite = "false";
    }
    DBHelper.updateRestaurantsInIDB(restaurant, {
      is_favorite: restaurant.is_favorite
    });
    //update the restaurant object.
    dbPromise.then(function(db) {
      let tx = db.transaction("restaurants", "readwrite");
      let store = tx.objectStore("restaurants");
      store.put({
        id: restaurant.id,
        data: restaurant
      });
      return tx.complete;
    });
    let url = `${DBHelper.DATABASE_URL}/${restaurant.id}/?is_favorite=${
      restaurant.is_favorite
    }`;
    let options = {
      method: "POST"
    };
    DBHelper.addToOutbox(url, options);
  }
  /**
   *Add a new review
   */
  static addNewReview(newReview) {
    const url = `${DBHelper.REVIEWS_URL}/`;
    const id = newReview.restaurant_id;
    let review = JSON.stringify(newReview);
    const options = {
      method: "POST",
      body: review
    };
    DBHelper.addReviewToIDB(newReview);
    DBHelper.addToOutbox(url, options);
  }
  /**
   *Add a new review to idb
   */
  static addReviewToIDB(review) {
    review.updatedAt = Date.now();
    dbPromise.then(db => {
      let tx = db
        .transaction("reviews", "readwrite")
        .objectStore("reviews")
        .put({
          id: Date.now(),
          restaurant_id: review.restaurant_id,
          data: review
        });
      return tx.complete;
    });
  }
  /**
   *Add request to outbox
   */
  static addToOutbox(url, options) {
    dbPromise
      .then(db => {
        const tx = db.transaction("outbox", "readwrite");
        const store = tx.objectStore("outbox");
        store.put({
          data: { url, options }
        });
      })
      .catch(error => {
        console.log(error);
      })
      .then(DBHelper.tryCommit());
  }
  /**
   *Try to commit the changes to the backend.
   */
  static tryCommit() {
    dbPromise
      .then(db => {
        const tx = db.transaction("outbox", "readonly");
        const store = tx.objectStore("outbox");
        return store.getAll();
      })
      .then(messages => {
        if (!messages) return;
        messages.map(function(message) {
          const props = {
            method: message.data.options.method,
            body: message.data.options.body
          };
          return fetch(message.data.url, props)
            .then(response => {
              if (!response.ok && !response.redirected) return;
              return response.json();
            })
            .then(data => {
              // Delete the message from the outbox.
              return dbPromise.then(db => {
                return db
                  .transaction("outbox", "readwrite")
                  .objectStore("outbox")
                  .delete(message.id);
              });
            })
            .catch(err => console.log(err));
        });
      });
  }
  /**
   * Update the main restaurants object
   */
  static updateRestaurantsInIDB(restaunt, object) {
    dbPromise.then(db => {
      const tx = db.transaction("restaurants", "readwrite");
      const resObj = tx
        .objectStore("restaurants")
        .get(-1)
        .then(resObj => {
          if (!resObj) return;
          const resArr = resObj.data.filter(o => o.id == restaunt.id);
          let updateObj = resArr[0];
          if (!updateObj) return;
          const objKeys = Object.keys(object);
          // do the update
          objKeys.forEach(k => (updateObj[k] = object[k]));
          // put the updated object back in idb
          dbPromise.then(db => {
            return db
              .transaction("restaurants", "readwrite")
              .objectStore("restaurants")
              .put({ id: -1, data: resObj.data });
          });
        });
    });
  }
};
