import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Map from './pages/Map';
import Home from './pages/Home';
import { collection, getDocs } from 'firebase/firestore';
import db from './firebaseConfig';
import { Flex, Box, SkeletonText } from '@chakra-ui/react';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [locations, setLocations] = useState([]);
  const [selectedMarkerKey, setSelectedMarkerKey] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    // Fetch data from Firestore
    const fetchLocations = async () => {
      const querySnapshot = await getDocs(collection(db, 'locations'));
      const fetchedLocations = querySnapshot.docs.map((doc) => ({
        key: doc.id,
        ...doc.data(),
        location: {
          lat: doc.data().location.latitude,
          lng: doc.data().location.longitude,
        },
      }));
      setLocations(fetchedLocations);
    };

    fetchLocations();
  }, []);

  if (!locations.length) {
    return <SkeletonText />;
  }

  return (
    <Flex flexDirection="column" h="100vh" w="100vw">
      <Navbar setActiveTab={setActiveTab} />

      <Box flex="1" position="relative">
        {activeTab === 'home' && <Home />}
        {activeTab === 'map' && (
          <Map
            locations={locations}
            selectedMarkerKey={selectedMarkerKey}
            setSelectedMarkerKey={setSelectedMarkerKey}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
          />
        )}
      </Box>
    </Flex>
  );
};

export default App;