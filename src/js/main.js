//css imports
import '../css/styles.css';

const DBHelper = require('./dbhelper');
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

// Add onchange event for each select.
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
    accessToken: process.env.TOKEN
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
  li.append(image);


  const d = document.createElement('div');
  d.classList.add('tile-header');

  // Name of Restaurant
  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  d.appendChild(name);

  //Is the restaurant a favorite
  const fav_image = document.createElement('img');
  const is_fav = !restaurant.is_favorite || restaurant.is_favorite.toString() == "false" ? false : true;
  console.log(is_fav);
  fav_image.src = is_fav ? '../icons/favorite.png': '../icons/not_favorite.png' ;
  fav_image.alt = is_fav ? 'Restaurant is a favorite.' : 'Restaurant is not a favorite.';
  fav_image.classList.add('is_fav');
  fav_image.id = `fav${restaurant.id}`;

  fav_image.addEventListener('click', function(){
    DBHelper.change_fav_status(restaurant);
    updateFavStatus(restaurant);
  });

  d.appendChild(fav_image);
  li.append(d);




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
 * Change the favorite icon and alt text
 */
let updateFavStatus = (restaurant) =>{
  let is_fav = restaurant.is_favorite.toString();
  let imgTag = document.querySelector(`#fav${restaurant.id}`);
    if (is_fav == 'true'){
      imgTag.src = '../icons/favorite.png';
      imgTag.alt = 'This restaurant is a favorite.';
    } else {
      imgTag.src = '../icons/not_favorite.png';
      imgTag.alt = 'This restaurant is not a favorite';
    }
}
/**
 * Set focus based on url.
*/
function setFocus(event) {
    const target = document.querySelector('#neighborhoods-select');
    target.focus();
}

