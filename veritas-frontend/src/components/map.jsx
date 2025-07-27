import React, { useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
  InfoWindow,
} from "@react-google-maps/api";
import { GOOGLE_MAPS_API_KEY } from "../config";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const mapContainerWrapperStyle = {
  display: "flex",
  flexDirection: "row",
  width: "100%",
  marginTop: "20px",
};

const mapFlexItemStyle = {
  flex: 2,
};

const listContainerStyle = {
  flex: 1,
  marginLeft: "20px",
  maxHeight: "400px",
  overflowY: "auto",
  padding: "10px",
  borderLeft: "1px solid #ccc",
};

const libraries = ["places", "routes"];

const MapComponent = ({ location, searchKeyword }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [originalPlaces, setOriginalPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  // const [directions, setDirections] = useState(null);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const fetchPlaces = useCallback(() => {
    if (map && location && searchKeyword) {
      const placesService = new window.google.maps.places.PlacesService(map);
      const request = {
        location: new window.google.maps.LatLng(
          location.latitude,
          location.longitude
        ),
        radius: 5000, // 5km radius
        keyword: searchKeyword,
      };

      placesService.nearbySearch(request, (results, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          results
        ) {
          setPlaces(results);
          setOriginalPlaces(results);
        }
      });
    }
  }, [map, location, searchKeyword]);

  useEffect(() => {
    if (isLoaded && map) {
      fetchPlaces();
    }
  }, [map, isLoaded, fetchPlaces, searchKeyword]);

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    if (map && place.geometry?.location) {
      map.panTo(place.geometry.location);
    }
    setDirections(null);
  };

  // const handleGetDirections = (place) => {
  //   if (!location || !map || !place.geometry?.location) return;

  //   const directionsService = new window.google.maps.DirectionsService();
  //   directionsService.route(
  //     {
  //       origin: new window.google.maps.LatLng(
  //         location.latitude,
  //         location.longitude
  //       ),
  //       destination: place.geometry.location,
  //       travelMode: window.google.maps.TravelMode.DRIVING,
  //     },
  //     (result, status) => {
  //       if (status === window.google.maps.DirectionsStatus.OK) {
  //         setDirections(result);
  //         setPlaces([]); // Hide other places when showing directions
  //         setSelectedPlace(null); // Hide InfoWindow when showing directions
  //       } else {
  //         console.error(`error fetching directions ${result}`);
  //       }
  //     }
  //   );
  // };

  const handleBackToList = () => {
    setDirections(null);
    setSelectedPlace(null);
    setPlaces(originalPlaces);
    if (map && location) {
      map.panTo({ lat: location.latitude, lng: location.longitude });
      map.setZoom(12);
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading Maps...</div>;
  }

  return (
    <div style={mapContainerWrapperStyle}>
      <div style={mapFlexItemStyle}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: location.latitude, lng: location.longitude }}
          zoom={12}
          onLoad={onMapLoad}
        >
          {/* User's location marker */}
          <Marker
            position={{ lat: location.latitude, lng: location.longitude }}
            title="Your Location"
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "white",
            }}
          />

          {places.map((place, index) => (
            <Marker
              key={place.place_id}
              position={place.geometry.location}
              label={`${index + 1}`}
              title={place.name}
              onClick={() => handlePlaceClick(place)}
            />
          ))}

          {selectedPlace && (
            <InfoWindow
              position={selectedPlace.geometry.location}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div className="location-box">
                <h4>{selectedPlace.name}</h4>
                <p>{selectedPlace.vicinity}</p>
                {/* <button onClick={() => handleGetDirections(selectedPlace)}>
                  Get Directions
                </button> */}
              </div>
            </InfoWindow>
          )}

          {/* {directions && <DirectionsRenderer directions={directions} />} */}
        </GoogleMap>
      </div>
      <div style={listContainerStyle}>
        {/* {directions ? (
          <div>
            <h4>Directions</h4>
            <button onClick={handleBackToList}>Back to List</button>
          </div>
        ) : ( */}
          <>
            <h4>
              Nearby{" "}
              {searchKeyword &&
                searchKeyword.charAt(0).toUpperCase() +
                  searchKeyword.slice(1)}
            </h4>
            <ul>
              {places.map((place, index) => (
                <li
                  key={place.place_id}
                  onClick={() => handlePlaceClick(place)}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <strong>
                    {index + 1}. {place.name}
                  </strong>
                  <p style={{ margin: "5px 0 0" }}>{place.vicinity}</p>
                  {place.rating && (
                    <p style={{ margin: "5px 0 0" }}>
                      Rating: {place.rating} ({place.user_ratings_total}{" "}
                      reviews)
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </>
        {/* )} */}
      </div>
    </div>
  );
};

export default MapComponent;
