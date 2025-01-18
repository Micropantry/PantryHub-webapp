import React, { useState, useEffect } from 'react';

import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Icon,
  Input,
  Link,
  Image,
  Text,
  Select,
  VStack,
  Divider,
} from '@chakra-ui/react'

import { IoArrowBackOutline,IoNavigate } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { FiThumbsUp } from "react-icons/fi";
import { BiSolidFridge } from "react-icons/bi";
import { FaUser } from "react-icons/fa";
import { useJsApiLoader, GoogleMap, Marker} from '@react-google-maps/api'
import { doc, updateDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import db from '../firebaseConfig'; // Ensure the path to your Firebase config is correct
import AddItemDialog from '../components/AddItemDialog';





const lat_shift = 0.005
// const defaultCenter = { lat: 47.621484340052824, lng: -122.1766799767942 } //GIX
const defaultCenter = { lat: 47.621484340052824, lng: -122.1766799767942 - lat_shift } //GIX

  const Map = () => 
  {
    const {isLoaded} = useJsApiLoader({
      googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
    })

  
    const [locations, setLocations] = useState([]);
    const [selectedMarkerKey, setSelectedMarkerKey] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [filters, setFilters] = useState({
      type: "",
      stockLevel: "",
      lastRestockTime: "",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);


    // Fetch all locations from Firestore on component load
    const fetchLocations = async () => {
      try {
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
        setFilteredLocations(fetchedLocations); // Initialize filtered list
     
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };


    // Function to fetch and update the selected location
    const fetchAndSetSelectedLocation = async (location) => {
      try {
        const docRef = doc(db, 'locations', location.key); // Reference the document
        const docSnap = await getDoc(docRef); // Fetch the latest data

        if (docSnap.exists()) {
          setSelectedLocation({
            key: location.key,
            ...docSnap.data(), // Use the latest data
          });
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching pantry data:', error);
      }
    };

    // Function to fetch pantry data for the selected marker
    const fetchPantryData = async () => {
      if (selectedMarkerKey) {
        try {
          const docRef = doc(db, 'locations', selectedMarkerKey);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setSelectedLocation({
              key: selectedMarkerKey,
              ...docSnap.data(),
            });
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching pantry data:', error);
        }
      }
    };


  useEffect(() => {
    fetchLocations();
  }, []);

  // Filter the locations based on the selected criteria
  useEffect(() => {
    let updatedLocations = locations;

    if (filters.type) {
      updatedLocations = updatedLocations.filter(
        (location) => location.type === filters.type
      );
    }

    // if (filters.stockLevel) {
    //   updatedLocations = updatedLocations.filter((location) => {
    //     if (filters.stockLevel === "low") return location.stockLevel < 20;
    //     if (filters.stockLevel === "medium")
    //       return location.stockLevel >= 20 && location.stockLevel < 50;
    //     if (filters.stockLevel === "high") return location.stockLevel >= 50;
    //     return true;
    //   });
    // }

    // if (filters.lastRestockTime) {
    //   updatedLocations = updatedLocations.filter((location) => {
    //     const restockDate = new Date(location.lastRestockTime);
    //     const now = new Date();
    //     if (filters.lastRestockTime === "today") {
    //       return restockDate.toDateString() === now.toDateString();
    //     }
    //     if (filters.lastRestockTime === "thisWeek") {
    //       const weekAgo = new Date();
    //       weekAgo.setDate(now.getDate() - 7);
    //       return restockDate >= weekAgo;
    //     }
    //     if (filters.lastRestockTime === "older") {
    //       return restockDate < now.setDate(now.getDate() - 7);
    //     }
    //     return true;
    //   });
    // }

    setFilteredLocations(updatedLocations);
  }, [filters, locations]);

  // Fetch data for the selected marker
  useEffect(() => {
    fetchPantryData();
  }, [selectedMarkerKey]); // Runs whenever selectedMarkerKey changes

    
  if (!isLoaded) {
    return <Box>Loading Map...</Box>; // Render a loading message or skeleton while the API loads
  }
  

  const incrementQuantity = async (item) => {
    if (!selectedLocation || !selectedLocation.key || !selectedLocation.wishlist) return;

    // Update wishlist locally
    const updatedWishlist = {
      ...selectedLocation.wishlist,
      [item]: (selectedLocation.wishlist[item] || 0) + 1, // Increment the quantity
    };

    // Update Firestore
    const docRef = doc(db, 'locations', selectedLocation.key);
    await updateDoc(docRef, { wishlist: updatedWishlist });

    // Update state to reflect changes immediately
    setSelectedLocation((prevLocation) => ({
      ...prevLocation,
      wishlist: updatedWishlist,
    }));
  };

  


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
          zoom={16}
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
                // setSelectedLocation(location);
                // fetchLocations();
                fetchAndSetSelectedLocation(location);
              }}
            />
          ))}
        </GoogleMap>
      </Box>

      {/* Sidebar */}
      <Box
        position="fixed"
        left="4"
        mt="2"
        h="90%"
        w="410px"
        pb="2"
        overflow='hidden'
        borderRadius="24"
        bgColor="white"
        overflowY="auto" // Enable vertical scrolling
        shadow="md"
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
                  // fetchAndSetSelectedLocation(null);
                  setSelectedMarkerKey(null); // Reset selected marker
                  fetchLocations();
                }}
                aria-label="Back"
                position="absolute"
                top="4"
                left="4"
                zIndex="dropdown" // Ensure button appears above the image
                bg="rgba(59,61,62,0.5)"
                color='white'
                borderRadius={16}
                icon={<IoArrowBackOutline />}
              />

              <HStack 
                position="absolute" 
                bottom="4" 
                left="4" 
                px="2"
                py="1"
                spacing="1"
                bg="rgba(255,255,255,0.8)"
                color='primary'
                borderRadius={12}
                zIndex="dropdown">
                  {/* <BiSolidFridge /> */}
                  <Image src={`/icons/${selectedLocation.type}-icon.svg`}/>
                  <Text fontSize="md" fontWeight="medium" textTransform="capitalize">{selectedLocation.type}</Text>
              </HStack>
            </Box>

            {/* Text content with padding */}
            <Box py="3">
              <Box px="6" py="3">
                <HStack justifyContent="space-between" align='center' >
                  <Box>
                    <Text fontSize="2xl" fontWeight="bold">
                      {selectedLocation.name}
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="text.400">
                      {selectedLocation.address}
                    </Text>
                  </Box>
                  <IconButton
                    onClick={() => {
                      // setSelectedLocation(null); // Reset selected location
                      // setSelectedMarkerKey(null); // Reset selected marker
                      if (selectedLocation?.address) {
                        const destination = encodeURIComponent(selectedLocation.address);
                        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
                        window.open(googleMapsUrl, "_blank");
                      } else {
                        alert("Address not available for this location.");
                      }
                    }}
                    aria-label="Get Direction"
                    bg="#F5F7F5"
                    color='#009C1F'
                    borderRadius={16}
                    size='lg'
                    icon={<Icon as={IoNavigate} boxSize="6" />}
                  />
                </HStack>
                <Text my="2" fontSize="xs" color="text.300">
                  {selectedLocation.description}
                </Text>
                {/* <Text my="1" fontSize="sm">
                  <strong>Hours:</strong> {selectedLocation.hours}
                </Text> */}
                <HStack spacing="2" align='center'>
                  <Icon as={FaUser} color="primary"/>
                  <Text color="text.400" fontSize="sm" fontWeight="medium">{selectedLocation.operator} ({selectedLocation.contact})</Text>
                  {/* <Text> {selectedLocation.contact}(</Text> */}
                </HStack>
              </Box>

              <Divider boarderColor="#E4EBE4" borderWidth="4px"/>

              {/* Stock level & Traffic */}
              <HStack px="6" py="3" justifyContent={'space-between'}>
                <Box align="left" width="40%">
                  <Text fontSize="md" fontWeight="medium">
                    Stock level
                  </Text>
                  <Text fontSize="sm" color="text.400">
                    ? Items
                  </Text>
                </Box>
                <Divider orientation='vertical' boarderColor="#E4EBE4" height="50px"/>
                <Box align="left" width="40%">
                  <Text fontSize="md" fontWeight="medium">
                    Current traffic
                  </Text>
                  <Text fontSize="sm" color="text.400">
                    Light
                  </Text>
                </Box>
              </HStack>


              <Divider boarderColor="#E4EBE4" borderWidth="4px"/>

              {/* Pantry Wishlist */}
              <VStack px="6" py="3" spacing="3">
                <Box w="100%">
                  <HStack justifyContent="space-between" align='center' >
                    <Text my="2" fontSize="lg" fontWeight="medium">
                      Pantry Wishlist
                    </Text>
                    {/* <IconButton
                      onClick={() => {}}
                      aria-label="Add Item"
                      bg="transparent"
                      color='#009C1F'
                      borderRadius={16}
                      // size=''
                      icon={<Icon as={IoMdAdd} boxSize="6" />}
                    /> */}
                    <AddItemDialog
                      selectedLocation={selectedLocation}
                      onUpdateWishlist={(updatedWishlist) =>
                        setSelectedLocation((prev) => ({
                          ...prev,
                          wishlist: updatedWishlist,
                        }))
                      }
                    />

                  </HStack>
                  {selectedLocation.wishlist ? (
                    <Flex align="start" wrap='wrap' gap="1" justify='flex-start'>
                      {Object.entries(selectedLocation.wishlist)
                              .sort(([, quantityA], [, quantityB]) => quantityB - quantityA) // Sort by quantity descending
                              .map(([item, quantity]) => (
                        <Button
                          key={item}
                          size="sm"
                          variant="outline" // Change to 'solid' if you prefer filled buttons
                          fontSize="sm" // Text size
                          fontWeight="regular" // Text weight
                          px="2" // Horizontal padding
                          py="4" // Vertical padding
                          rightIcon={<FiThumbsUp />}
                          iconSpacing={1}
                          onClick={() => incrementQuantity(item)}
                        >
                          {/* {item} ({quantity}) */}
                          <HStack spacing="1"> 
                            <Text>{item}</Text>
                            <Text color="text.300">({quantity})</Text>
                          </HStack>
                        </Button>
                      ))}
                    </Flex>
                  ) : (
                    <Text>Loading wishlist...</Text>
                  )}
                </Box>
                
                {/* Support us */}
                <Box pb="1"> 
                  <Text fontSize="lg" fontWeight="medium">
                    Support us
                  </Text>
                  <Text fontSize="sm" color="text.300">
                    Every contribution makes a differnece
                  </Text>
                  <HStack mt="2" alignItems="stretch" h="auto" justify= "space-between">
                    <Flex px="2" py="5" alignItems="center" borderRadius="8" bg="#f5f5f5">
                      <Text fontSize="xs" fontWeight="bold" color="text.500" align="center">
                        Drop off at the pantry
                      </Text>
                    </Flex>
                    <Box px="2" py="5" align="center" borderRadius="8" bg="#f5f5f5">
                      <Text fontSize="xs" fontWeight="bold" color="text.500">
                        Ship to
                      </Text>
                      <Text fontSize="xs" fontWeight="regular" color="text.400">
                        {selectedLocation.address}
                      </Text>
                    </Box>
                    <Flex px="2" py="5" alignItems="center" borderRadius="8" bg="#f5f5f5">
                      <Link align="center" fontSize="xs" fontWeight="bold" color="text.500" href={selectedLocation.amazon_wishlist} isExternal>
                        Amazon Wishlist
                      </Link>
                    </Flex>
                  </HStack>
                </Box>
              </VStack>

              <Divider boarderColor="#E4EBE4" borderWidth="4px"/>

              {/* Messages */}
              <VStack  px="6" py="3" spacing="2" align="start">
                <Text fontSize="lg" fontWeight="medium">
                  Leave a message
                </Text>
                {/* Message input */}
                <Input 
                  placeholder="Leave a message to the host and the community..." 
                  size="sm" 
                  borderRadius="8"
                  _placeholder={{ fontSize: "xs", color: "text.300" }}
                  >
                </Input>
              </VStack>


            </Box>
          </>
        ) : (
          // Pantry List
          <Box py="5">
            <VStack spacing="2" align="start">
              <Text fontSize="xl" fontWeight="bold" px="5" py="3">
                Pantry List:
              </Text>

              {/* Filter Controls */}
              <HStack pl="5" spacing="1" mt="4">
                <Select
                  placeholder="Type"
                  size='sm'
                  w="fit-content"
                  borderRadius={8}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, type: e.target.value }))
                  }
                >
                  <option value="basic">Basic</option>
                  <option value="fridge">Fridge</option>
                </Select>
                <Select
                  placeholder="Stock Level"
                  size='sm'
                  w="fit-content"
                  borderRadius={8}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, stockLevel: e.target.value }))
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
                <Select
                  placeholder="Last Restock"
                  size='sm'
                  w="fit-content"
                  borderRadius={8}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      lastRestockTime: e.target.value,
                    }))
                  }
                >
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="older">Older</option>
                </Select>
              </HStack>


              {/* Filtered List */}
                {filteredLocations.map((location) => (
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
                    fetchAndSetSelectedLocation(location);
                    setSelectedMarkerKey(location.key); // Highlight the corresponding marker
                  }}
                >
                  <HStack spacing="4" align="center">
                    <VStack align="center" spacing="1"  w="8">
                      <Image
                        src={`/icons/${location.type}-icon.svg`} // Dynamic file path
                        alt={`${location.type} icon`}
                        boxSize="22px" // Adjust size as needed
                        objectFit="contain"
                      />
                      <Text fontSize="xs" color="text.300" textTransform="capitalize">{location.type}</Text>
                    </VStack>
                    <Box>
                      <Text fontSize="lg" fontWeight="semibold">{location.name}</Text>
                      <Text fontSize="sm" color="text.500">{location.address}</Text>
                    </Box>
                  </HStack>
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
