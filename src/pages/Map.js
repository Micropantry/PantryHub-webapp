import React, { useState, useEffect } from 'react';

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

const Map = ({ locations, selectedMarkerKey, setSelectedMarkerKey, setSelectedLocation, selectedLocation }) => {
  const {isLoaded} = useJsApiLoader({
      googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
    })
    
  if (!isLoaded) {
    return <Box>Loading Map...</Box>; // Render a loading message or skeleton while the API loads
  }

  return (
    <Box flex="1" position="relative" h="100%">
      {/* Google Map */}
      <Box position="absolute" left={0} top={0} h="100%" w="100%">
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
            mapId: "1ffb6a8e6175ac3",
          }}
        >
          {locations.map((location) => (
            <Marker
              key={location.key}
              position={location.location}
              icon={{
                url: `/icons/${location.type}-pin.svg`,
                scaledSize: new window.google.maps.Size(
                  location.key === selectedMarkerKey ? 60 : 45,
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

      {/* Sidebar */}
      <Box
        position="fixed"
        left="0"
        h="100%"
        w="410px"
        bgColor="white"
        shadow="base"
        zIndex="modal"
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
                icon={<IoArrowBackOutline />}
              />
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
  );
};

export default Map;
