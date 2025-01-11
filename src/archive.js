import Navbar from './Navbar'
import Home from './pages/Home'
import Map from './pages/Map'
import About from './pages/About'

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import db from './firebaseConfig'; // Import Firebase configuration


import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  Image,
  Text,
  SkeletonText,
  VStack,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react'

import { IoArrowBackOutline } from "react-icons/io5";
import {useJsApiLoader, GoogleMap, Marker} from '@react-google-maps/api'

const defaultCenter = { lat: 47.621484340052824, lng: -122.1766799767942 } //GIX

// const locations = [
//   {
//     key: 'gix',
//     location: { lat: 47.621461693309435, lng: -122.17661640099618 },
//     title: 'GIX',
//     type: 'basic',
//     imageUrl: 'https://bit.ly/2Z4KKcF',
//     description: 'Global Innovation Exchange in Bellevue.',
//   },
//   {
//     key: 'arras',
//     location: { lat: 47.62105405851598, lng: -122.17650512877522 },
//     title: 'Arras Apartments',
//     type: 'fridge',
//     imageUrl: 'https://bit.ly/2Z4KKcF',
//     description: 'Modern apartments near GIX.',
//   },
// ];



function App() {
  const {isLoaded} = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  })

  const [locations, setLocations] = useState([]); // Store locations
  const [selectedMarkerKey, setSelectedMarkerKey] = useState(null); // Track selected marker
  const [selectedLocation, setSelectedLocation] = useState(null);


  useEffect(() => {
    // Fetch data from Firestore
    const fetchLocations = async () => {
      const querySnapshot = await getDocs(collection(db, 'locations'));
      const fetchedLocations = querySnapshot.docs.map((doc) => ({
        key: doc.id, // Use document ID as key
        ...doc.data(),
        location: {
          lat: doc.data().location.latitude, // Extract GeoPoint latitude
          lng: doc.data().location.longitude, // Extract GeoPoint longitude
        },
      }));
      console.log('Converted Locations:', fetchedLocations); // Debugging log
      setLocations(fetchedLocations);
    };

    fetchLocations();
  }, []);



  // if (!isLoaded) {
  //   return <SkeletonText />
  //   // return <Text>Loading...</Text>
  // }

  if (!locations.length) {
    return <SkeletonText />;
  }

  return (
    
    <Flex
      
      flexDirection='column'
      h='100vh'
      w='100vw'
    >
      <Navbar />
      
      {/* Main Content */}
      <Box flex="1" position="relative">

        {/* Map */}
        <Box position='absolute' left={0} top={0} h='100%' w='100%'>
          {/* display Google Maps here */}
          <GoogleMap
            mapContainerStyle={{
              width: '100%',
              height: '100%',
            }}
            center={defaultCenter}
            zoom={17}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              mapId:"1ffb6a8e6175ac3"
            }}>
              {/* Render all markers */}
              {locations.map((location) => (
                <Marker
                key={location.key}
                position={location.location}
                icon={{
                  url: `/icons/${location.type}-pin.svg`,
                  scaledSize: new window.google.maps.Size(
                    location.key === selectedMarkerKey ? 60 : 45, // Larger size for selected marker
                    location.key === selectedMarkerKey ? 60 : 45
                  ),
                }}
                onClick={() => {
                  setSelectedMarkerKey(location.key);
                  setSelectedLocation(location);
                }}
              />
              ))}

          </GoogleMap>
        </Box>

        {/* Pantry Info Modal */}
        <Box
          // Pantry Info Modal
          position = "fixed"
          left = '0'
          h = '100%'
          w = '410px'
          bgColor='white'
          shadow='base'
          zIndex='modal'
        >
          {selectedLocation ? (
            <>
              <Box position="relative">
                {/* Image */}
                <Image
                  src={selectedLocation.image}
                  alt={selectedLocation.name}
                  w="100%"
                  h="225px"
                  objectFit="cover"
                />

                {/* Back Button */}
                <IconButton
                  onClick={() => {
                    setSelectedLocation(null); // Reset selected location
                    setSelectedMarkerKey(null); // Reset selected marker
                  }}
                  aria-label="Back"
                  position="absolute"
                  top="10px"
                  left="10px"
                  zIndex="dropdown" // Ensure button appears above the image
                >
                  <IoArrowBackOutline />
                </IconButton>
              </Box>

              {/* Text content with padding */}
              <Box p="5">
                <Text fontSize="2xl" fontWeight="bold" mt="4">
                  {selectedLocation.name}
                </Text>
                <Text mt="2" fontSize="lg" color="gray.600">
                  {selectedLocation.address}
                </Text>
                <Text mt="2" fontSize="md">
                  <strong>Hours:</strong> {selectedLocation.hours}
                </Text>
                <Text mt="2" fontSize="md">
                  <strong>Contact:</strong> {selectedLocation.contact}
                </Text>
                <Text mt="2" fontSize="md">
                  <strong>Operator:</strong> {selectedLocation.operator}
                </Text>
                <Text mt="2" fontSize="md">
                  <strong>Type:</strong> {selectedLocation.type}
                </Text>
              </Box>
            </>
          ) : (
            <Box py="5">
              <VStack spacing="2" align="start">
              <Text fontSize="xl" fontWeight="bold" px="5" py="3">
                Pantry List:
              </Text>

              {locations.map((location) => (
                <Box
                  key={location.key}
                  w="100%"
                  px="5"
                  py="3"
                  borderBottom="1px solid #E2E8F0"
                  cursor="pointer"
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => {
                    setSelectedLocation(location); // Set the clicked location as selected
                    setSelectedMarkerKey(location.key); // Highlight the corresponding marker
                  }}
                >
                  <Text fontSize="md" fontWeight="semibold">{location.name}</Text>
                  <Text fontSize="sm" color="gray.600">{location.address}</Text>
                </Box>
              ))}
              
            </VStack>
            </Box>
          )}

        </Box>
      </Box>

    </Flex>
  )
  
}

export default App