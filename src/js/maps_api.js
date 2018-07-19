module.exports = function loadMaps(){
    let s = document.getElementsByTagName('script')[3];
    let googleScript = document.createElement('script');
    googleScript.async;
    googleScript.defer;
    googleScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.KEY}&libraries=places&callback=initMap`;
    s.parentNode.insertBefore(googleScript, s);
}

