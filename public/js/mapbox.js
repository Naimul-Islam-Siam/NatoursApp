export const displayMap = locations => {
   mapboxgl.accessToken = 'pk.eyJ1IjoibmFpbXVsLWlzbGFtLXNpYW0iLCJhIjoiY2tjaHVxZmYwMGUxYjJxbnZvOXpxYjVteiJ9.ClSugxDI-zJB0t0RyhkOuQ';

   var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/naimul-islam-siam/ckchv9xlx2gce1iphjiuz58m9',
      scrollZoom: false
   });

   const bounds = new mapboxgl.LngLatBounds();

   locations.forEach(location => {
      // create marker
      const el = document.createElement('div');
      el.className = 'marker';

      // add marker
      new mapboxgl.Marker({
         element: el,
         anchor: 'bottom'
      }).setLngLat(location.coordinates).addTo(map);

      //add popup
      new mapboxgl.Popup({ offset: 30 })
         .setLngLat(location.coordinates)
         .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
         .addTo(map);

      // extend map bounds to include current location
      bounds.extend(location.coordinates);


      map.fitBounds(bounds, {
         padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
         }
      });
   });
};