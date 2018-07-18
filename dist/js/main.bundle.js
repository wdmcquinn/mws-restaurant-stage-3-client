/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/js/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/js/main.js":
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("let restaurants,\r\n  neighborhoods,\r\n  cuisines\r\nvar map\r\nvar markers = []\r\n\r\n\r\n/**\r\n * Register Service Worker\r\n */\r\nif ('serviceWorker' in navigator){ // Check to see if the browser supports service workers\r\n  navigator.serviceWorker\r\n  .register('./sw.js')\r\n  .then((registration) => {\r\n\r\n  }).catch((err) => {\r\n    console.log(err);\r\n  })\r\n}\r\n\r\n\r\n/**\r\n * Fetch neighborhoods and cuisines as soon as the page is loaded.\r\n */\r\ndocument.addEventListener('DOMContentLoaded', (event) => {\r\n  fetchNeighborhoods();\r\n  fetchCuisines();\r\n});\r\n\r\n/**\r\n * Fetch all neighborhoods and set their HTML.\r\n */\r\nfetchNeighborhoods = () => {\r\n  DBHelper.fetchNeighborhoods((error, neighborhoods) => {\r\n    if (error) { // Got an error\r\n      console.error(error);\r\n    } else {\r\n      self.neighborhoods = neighborhoods;\r\n      fillNeighborhoodsHTML();\r\n    }\r\n  });\r\n}\r\n\r\n/**\r\n * Set neighborhoods HTML.\r\n */\r\nfillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {\r\n  const select = document.getElementById('neighborhoods-select');\r\n  neighborhoods.forEach(neighborhood => {\r\n    const option = document.createElement('option');\r\n    option.innerHTML = neighborhood;\r\n    option.value = neighborhood;\r\n    select.append(option);\r\n  });\r\n}\r\n\r\n/**\r\n * Fetch all cuisines and set their HTML.\r\n */\r\nfetchCuisines = () => {\r\n  DBHelper.fetchCuisines((error, cuisines) => {\r\n    if (error) { // Got an error!\r\n      console.error(error);\r\n    } else {\r\n      self.cuisines = cuisines;\r\n      fillCuisinesHTML();\r\n    }\r\n  });\r\n}\r\n\r\n/**\r\n * Set cuisines HTML.\r\n */\r\nfillCuisinesHTML = (cuisines = self.cuisines) => {\r\n  const select = document.getElementById('cuisines-select');\r\n\r\n  cuisines.forEach(cuisine => {\r\n    const option = document.createElement('option');\r\n    option.innerHTML = cuisine;\r\n    option.value = cuisine;\r\n    select.append(option);\r\n  });\r\n}\r\n\r\n/**\r\n * Initialize Google map, called from HTML.\r\n */\r\nwindow.initMap = () => {\r\n  let loc = {\r\n    lat: 40.722216,\r\n    lng: -73.987501\r\n  };\r\n  self.map = new google.maps.Map(document.getElementById('map'), {\r\n    zoom: 12,\r\n    center: loc,\r\n    scrollwheel: false\r\n  });\r\n  updateRestaurants();\r\n}\r\n\r\n/**\r\n * Update page and map for current restaurants.\r\n */\r\nupdateRestaurants = () => {\r\n  const cSelect = document.getElementById('cuisines-select');\r\n  const nSelect = document.getElementById('neighborhoods-select');\r\n\r\n  const cIndex = cSelect.selectedIndex;\r\n  const nIndex = nSelect.selectedIndex;\r\n\r\n\r\n  const cuisine = cSelect[cIndex].value;\r\n  const neighborhood = nSelect[nIndex].value;\r\n\r\n  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {\r\n    if (error) { // Got an error!\r\n      console.error(error);\r\n    } else {\r\n      resetRestaurants(restaurants);\r\n      fillRestaurantsHTML();\r\n    }\r\n  })\r\n}\r\n\r\n/**\r\n * Clear current restaurants, their HTML and remove their map markers.\r\n */\r\nresetRestaurants = (restaurants) => {\r\n  // Remove all restaurants\r\n  self.restaurants = [];\r\n  const ul = document.getElementById('restaurants-list');\r\n  ul.innerHTML = '';\r\n\r\n  // Remove all map markers\r\n  self.markers.forEach(m => m.setMap(null));\r\n  self.markers = [];\r\n  self.restaurants = restaurants;\r\n}\r\n\r\n/**\r\n * Create all restaurants HTML and add them to the webpage.\r\n */\r\nfillRestaurantsHTML = (restaurants = self.restaurants) => {\r\n  const ul = document.getElementById('restaurants-list');\r\n  restaurants.forEach(restaurant => {\r\n    ul.append(createRestaurantHTML(restaurant));\r\n  });\r\n  addMarkersToMap();\r\n}\r\n\r\n/**\r\n * Create restaurant HTML.\r\n */\r\ncreateRestaurantHTML = (restaurant) => {\r\n  const li = document.createElement('li');\r\n\r\n  const image = document.createElement('img');\r\n  image.className = 'restaurant-img';\r\n  image.alt = `Image of ${restaurant.name} restauraunt.`;\r\n  image.src = DBHelper.imageUrlForRestaurant(restaurant);\r\n  image.srcset = `/img/${restaurant.id}.jpg 1x, /img/${restaurant.id}_large_2x.jpg 2x`;\r\n  li.append(image);\r\n\r\n  const name = document.createElement('h1');\r\n  name.innerHTML = restaurant.name;\r\n  li.append(name);\r\n\r\n  const neighborhood = document.createElement('p');\r\n  neighborhood.innerHTML = restaurant.neighborhood;\r\n  li.append(neighborhood);\r\n\r\n  const address = document.createElement('p');\r\n  address.innerHTML = restaurant.address;\r\n  li.append(address);\r\n\r\n  const more = document.createElement('a');\r\n  more.innerHTML = 'View Details';\r\n  more.href = DBHelper.urlForRestaurant(restaurant);\r\n  li.append(more)\r\n\r\n  return li\r\n}\r\n\r\n/**\r\n * Add markers for current restaurants to the map.\r\n */\r\naddMarkersToMap = (restaurants = self.restaurants) => {\r\n  restaurants.forEach(restaurant => {\r\n    // Add marker to the map\r\n    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);\r\n    google.maps.event.addListener(marker, 'click', () => {\r\n      window.location.href = marker.url\r\n    });\r\n    self.markers.push(marker);\r\n  });\r\n}\r\n\r\n/**\r\n * Set focus based on url.\r\n*/\r\nfunction setFocus(event){\r\n  const url = location.href;\r\n  const target = '';\r\n  if (url.endsWith('8000/')){\r\n    const target = document.querySelector('#neighborhoods-select');\r\n    target.focus();\r\n  }\r\n}\r\n\r\n\n\n//# sourceURL=webpack:///./src/js/main.js?");

/***/ })

/******/ });