import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroText,
  ViroTrackingReason,
  ViroTrackingStateConstants,
} from "@reactvision/react-viro";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";

interface Location {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface GeoPosition {
  coords: {
    latitude: number;
    longitude: number;
  };
}

interface GeoError {
  code: number;
  message: string;
}

// Target location (Hello World location)
const TARGET_LOCATION: Location = {
  latitude: 37.7749, // Replace with your target latitude
  longitude: -122.4194, // Replace with your target longitude
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const HelloWorldSceneAR = () => {
  const [text, setText] = useState("Initializing AR...");

  function onInitialized(state: any, reason: ViroTrackingReason) {
    console.log("onInitialized", state, reason);
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setText("Hello World!");
    } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
      // Handle loss of tracking
    }
  }

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
      <ViroText
        text={text}
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0, -1]}
        style={styles.helloWorldTextStyle}
      />
    </ViroARScene>
  );
};

const App = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [showAR, setShowAR] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [isARMode, setIsARMode] = useState(false);

  useEffect(() => {
    // Get current location
    Geolocation.getCurrentPosition(
      (position: GeoPosition) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setCurrentLocation(newLocation);

        // Calculate distance to target
        const calculatedDistance = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          TARGET_LOCATION.latitude,
          TARGET_LOCATION.longitude
        );

        setDistance(calculatedDistance);
        setShowAR(calculatedDistance < 0.1); // Show AR button if within 100 meters
      },
      (error: GeoError) => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, []);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  if (isARMode) {
    return (
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: HelloWorldSceneAR,
        }}
        style={styles.f1}
      />
    );
  }

  if (!currentLocation) {
    return (
      <View style={styles.container}>
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={currentLocation}>
        <Marker
          coordinate={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          }}
          title="You are here"
          pinColor="blue"
        />
        <Marker
          coordinate={{
            latitude: TARGET_LOCATION.latitude,
            longitude: TARGET_LOCATION.longitude,
          }}
          title="Hello World Location"
          pinColor="red"
        />
      </MapView>

      {showAR && (
        <TouchableOpacity
          style={styles.arButton}
          onPress={() => {
            setIsARMode(true);
          }}
        >
          <Text style={styles.arButtonText}>Show AR</Text>
        </TouchableOpacity>
      )}

      {distance !== null && (
        <Text style={styles.distanceText}>
          Distance to target: {distance.toFixed(2)} km
        </Text>
      )}
    </View>
  );
};

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  arButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  arButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  distanceText: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "white",
    padding: 10,
    borderRadius: 5,
  },
  f1: { flex: 1 },
  helloWorldTextStyle: {
    fontFamily: "Arial",
    fontSize: 30,
    color: "#ffffff",
    textAlignVertical: "center",
    textAlign: "center",
  },
});

export default App;
