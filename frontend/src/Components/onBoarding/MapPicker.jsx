import React, { useEffect, useRef, useState } from "react";

const MapPicker = ({ onLocationSelect, currentLocation }) => {
  const mapRef = useRef(null);
  const [markerPosition, setMarkerPosition] = useState(currentLocation);
  
  useEffect(() => {
    // Initialize Google Maps
    const googleMapScript = document.createElement('script');
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    googleMapScript.async = true;
    googleMapScript.defer = true;
    window.document.body.appendChild(googleMapScript);
    
    googleMapScript.addEventListener('load', () => {
      initializeMap();
    });
    
    return () => {
      // Cleanup script when component unmounts
      window.document.body.removeChild(googleMapScript);
    };
  }, []);

  useEffect(() => {
    // Update marker if currentLocation changes
    if (mapRef.current && window.google) {
      setMarkerPosition(currentLocation);
      updateMarkerPosition(currentLocation);
    }
  }, [currentLocation]);

  const initializeMap = () => {
    // Default to a central location if coordinates are [0,0]
    const center = currentLocation[0] === 0 && currentLocation[1] === 0 
      ? { lat: 20.5937, lng: 78.9629 } // Default to center of India
      : { lat: currentLocation[1], lng: currentLocation[0] };
    
    const mapOptions = {
      center: center,
      zoom: 10,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    };
    
    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    
    // Create a marker
    const marker = new window.google.maps.Marker({
      position: center,
      map: map,
      draggable: true,
      title: "Your location"
    });
    
    // Handle map click to move marker
    map.addListener('click', (e) => {
      const position = [e.latLng.lng(), e.latLng.lat()];
      marker.setPosition(e.latLng);
      setMarkerPosition(position);
      onLocationSelect(position);
    });
    
    // Handle marker drag
    marker.addListener('dragend', (e) => {
      const position = [e.latLng.lng(), e.latLng.lat()];
      setMarkerPosition(position);
      onLocationSelect(position);
    });
    
    // Add search box
    const input = document.createElement("input");
    input.className = "w-full p-2 border border-gray-300 rounded-md";
    input.placeholder = "Search for a location";
    
    const searchBox = new window.google.maps.places.SearchBox(input);
    map.controls[window.google.maps.ControlPosition.TOP_CENTER].push(input);
    
    // Bias search results to current map viewport
    map.addListener("bounds_changed", () => {
      searchBox.setBounds(map.getBounds());
    });
    
    // Listen for search results
    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();
      
      if (places.length === 0) return;
      
      const place = places[0];
      
      if (!place.geometry || !place.geometry.location) return;
      
      // Center map on search result
      map.setCenter(place.geometry.location);
      map.setZoom(15);
      
      // Update marker
      marker.setPosition(place.geometry.location);
      
      // Update coordinates
      const position = [place.geometry.location.lng(), place.geometry.location.lat()];
      setMarkerPosition(position);
      onLocationSelect(position);
    });
  };
  
  const updateMarkerPosition = (coords) => {
    if (!mapRef.current || !window.google) return;
    
    // Get the map instance and marker
    const map = mapRef.current.map;
    const marker = mapRef.current.marker;
    
    if (map && marker) {
      const latLng = { lat: coords[1], lng: coords[0] };
      marker.setPosition(latLng);
      map.setCenter(latLng);
    }
  };

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-md"
      aria-label="Map location picker"
    >
      {!window.google && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default MapPicker;