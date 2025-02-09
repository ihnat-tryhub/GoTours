/* eslint-disable*/

console.log('hello from the client side');
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken = 'pk.eyJ1Ijoic2xlZXB3YWxrZXJ1YSIsImEiOiJjbTZ6bGx4c2wwNmJsMm1zODJkZ2psdzZ6In0.UVK9IEJQB6oOwcJ-XMKyEw';

const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
});
