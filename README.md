# Mobile Web Specialist Certification Course
---
#Restaurant Reviews App -- Stage 3

## Project Overview
For the Restaurant Reviews projects, you will incrementally convert a static webpage to a mobile-ready web application. In Stage Two, you will take the responsive, accessible design you built in Stage One and connect it to an external server. You’ll begin by using asynchronous JavaScript to request JSON data from the server. You’ll store data received from the server in an offline database using IndexedDB, which will create an app shell architecture. Finally, you’ll work to optimize your site to meet performance benchmarks, which you’ll test using Lighthouse.

## Getting Started

###### Prerequisites
Node and NPM are required to run this project instruction for installation can be found at [nodejs.org](https://nodejs.org/en/).

###### Install project dependancies
```Install project dependancies
# npm i
```
###### Create the env file
```
#Create a file named .env in the root directory and insert you api key for Mapbox.
#ex.. TOKEN='YOUR_API_KEY'

```
##### Webpack Details
The current state of the project is in production mode to allow the compiler to minify the javascript files and optimize the image files. If you would like to change this the very last line of the webpack.config.js file should be changed to development. This will allow for faster compile times but slower performance on the site.

###### Start the server
```
# npm start
```
### After a short build process You should be able to access the client at http://localhost:8000


