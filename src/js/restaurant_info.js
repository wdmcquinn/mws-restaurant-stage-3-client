//css imports
import '../css/styles.css';
// import javascript files
const DBHelper = require('./dbhelper');

let restaurant;
let newMap;
let id;

/**
 * Initialize LeafletJS and Mapbox, called from HTML.
 */
function initMap(){
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      newMap = L.map('mapid', {
        center: restaurant.latlng,
        zoom: 12,
      });
      newMap.scrollWheelZoom.disable();
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1Ijoid2RtY3F1aW5uIiwiYSI6ImNqa2UxOTl0ODFuMWkzd21pMjhnd2tmMHAifQ.YG7Lj9VtsRfZZbmkqQjQQQ'
    }).addTo(newMap);
      DBHelper.mapMarkerForRestaurant(self.restaurant, newMap);
    }
    fillBreadcrumb();
    DBHelper.tryCommit();
  });
}
/**
 * Get current restaurant from page URL.
 */
let fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = parseInt(getParameterByName('id'));
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
}
/**
 * Create restaurant HTML and add it to the webpage
 */
let fillRestaurantHTML = (restaurant = self.restaurant) => {

  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  //Is the restaurant a favorite
  restaurant.id = parseInt(restaurant.id);
  const d = document.querySelector('.name-header');
  const fav_image = document.createElement('img');
  const is_fav = !restaurant.is_favorite || restaurant.is_favorite.toString() == "false" ? false : true;
  fav_image.src = is_fav ? '../icons/favorite.png': '../icons/not_favorite.png' ;
  fav_image.alt = is_fav ? 'Restaurant is a favorite.' : 'Restaurant is not a favorite.';
  fav_image.classList.add('is_fav');
  fav_image.id = `fav${restaurant.id}`;

  fav_image.addEventListener('click', function(){
    DBHelper.change_fav_status(restaurant);
    updateFavStatus(restaurant);
  });

  d.appendChild(fav_image);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.alt = `Image of ${restaurant.name} restauraunt.`;
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = `/img/${restaurant.id}.jpg 1x, /img/${restaurant.id}_large_2x.jpg 2x`;
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  DBHelper.fetchReviewsById(restaurant.id, function(error, reviews){
    if(error) return;
    fillReviewsHTML(reviews);
  });
}
/**
 * Update the favorite status of the restaurant.
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
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
let fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}
/**
 * Create all reviews HTML and add them to the webpage.
 */
let fillReviewsHTML = (reviews) => {
  self.restaurant.reviews = reviews;
  const br = document.createElement('br');
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);
  // Create the form for users to submit thier reviews
 
  const reviewForm = document.createElement('form');
  reviewForm.id = 'frm-review';
  reviewForm.innerHTML = `
      <label for="name">Name</label><br>
      <input type="text" id="name">
    <br>
    <label for="rating">Rating</label><br>
      <select id="rating">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
    <br>
      <label for="comments">Comments</label><br>
      <textarea id="comments"></textarea>
    <br>
      <button type="button" id="addreview">Submit</button>
  `;
  container.appendChild(reviewForm);
  document.querySelector('#addreview').addEventListener('click', addReview);
  container.appendChild(br);


  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');

   reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}
/**
 * Create review HTML and add it to the webpage.
 */
let createReviewHTML = (review) => {
  let updatedDate = new Date(review.updatedAt);
  let lastUpdate = `${updatedDate.getMonth()}/${updatedDate.getDay()}/${updatedDate.getFullYear()}`;

  const li = document.createElement('li');
  const d = document.createElement('div');
  d.classList.add('review-header');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  d.appendChild(name);


  const date = document.createElement('p');
  date.innerHTML = `${lastUpdate}`;
  d.appendChild(date);

  li.appendChild(d);

  const rating = document.createElement('p');
  rating.innerHTML = `<em>Rating: ${review.rating}</em>`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.id ='user-comments';
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}
/**
 * Add restaurant name to the breadcrumb navigation menu
 */
let fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}
/**
 * Get a parameter by name from page URL.
 */
let getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
/**
 *Add a new Review
 */
let addReview = () =>{
let name = document.querySelector('#name').value;
let rating = document.querySelector('#rating').value
let comments = document.querySelector('#comments').value;
let newReview = {
  restaurant_id: self.restaurant.id,
  name,
  rating,
  comments,
};


DBHelper.addNewReview(newReview);
document.forms[0].reset();
location.reload();
}
// Call the initMap Function
initMap();
