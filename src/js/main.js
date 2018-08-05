//css imports
import '../css/styles.css';
import idb from 'idb';

const DBHelper = require('./dbhelper');
//const loadGoogleMapsApi = require('load-google-maps-api');


const path = require('path');

let restaurants,
  neighborhoods,
  cuisines
let newMap
let markers = []


/**
 * Register Service Worker
 */
if ('serviceWorker' in navigator) { // Check to see if the browser supports service workers
  navigator.serviceWorker
    .register(path.resolve(__dirname, 'sw.js'))
    .then((registration) => {
    }).catch((err) => {
      console.log(err);
    })
}


/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */


document.addEventListener('DOMContentLoaded', (event) => {
  fetchFilters();
  updateRestaurants();
  setFocus();
  initMap();
});

document.querySelectorAll('select').forEach(select => {
  select.addEventListener('change', function(){
    updateRestaurants();
  });
});

let fetchFilters = () => {
  DBHelper.fetchFilters((error, neighborhoods, cuisines) => {
    if (error) console.log(error);
    self.neighborhoods = neighborhoods;
    self.cuisines = cuisines;
    fillNeighborhoodsHTML();
    fillCuisinesHTML();
  })
}


/**
 * Set neighborhoods HTML.
 */
let fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Set cuisines HTML.
 */
let fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

function initMap() {
  newMap = L.map('mapid', {
    center: [40.722216, -73.987501],
    zoom: 12,
  });
  newMap.scrollWheelZoom.disable();
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoid2RtY3F1aW5uIiwiYSI6ImNqa2UxOTl0ODFuMWkzd21pMjhnd2tmMHAifQ.YG7Lj9VtsRfZZbmkqQjQQQ'
  }).addTo(newMap);
}


/**
 * Update page and map for current restaurants.
 */
function updateRestaurants() {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;


  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
let resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
let fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
let createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.classList.add('lazyload');
  image.alt = `Image of ${restaurant.name} restauraunt.`;
  image.src = '/img/ph.png';
  image.setAttribute('data-src', DBHelper.imageUrlForRestaurant(restaurant));
  image.setAttribute('data-srcset', `/img/${restaurant.id}.jpg 1x, /img/${restaurant.id}_large_2x.jpg 2x`);
  //image.srcset = `/img/${restaurant.id}.jpg 1x, /img/${restaurant.id}_large_2x.jpg 2x`;
  li.append(image);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
let addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });
}

/**
 * Set focus based on url.
*/
function setFocus(event) {
  const url = location.href;
  const target = '';
  if (url.endsWith('8080')) {
    const target = document.querySelector('#neighborhoods-select');
    target.focus();
  }
}

