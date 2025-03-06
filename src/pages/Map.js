import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getDistance } from 'geolib';

import {
  Box, Button, ButtonGroup,
  Flex, HStack,
  IconButton, Icon,
  Input,
  Link,
  Image,
  Text,
  Select,
  VStack,
  Divider,
  useDisclosure, Modal, ModalOverlay, ModalContent, ModalBody
} from '@chakra-ui/react'

import { IoArrowBackOutline,IoNavigate } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { FiThumbsUp, FiZoomIn } from "react-icons/fi";
import { BiSolidFridge } from "react-icons/bi";
import { FaUser,FaBook } from "react-icons/fa";
import { MdExposurePlus1 } from "react-icons/md";
import { useJsApiLoader, GoogleMap, Marker} from '@react-google-maps/api'
import { doc, updateDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import {db} from '../firebaseConfig'; // Ensure the path to your Firebase config is correct
import AddItemDialog from '../components/AddItemDialog';
import {onSnapshot } from 'firebase/firestore';


function calculateDistance(lat1, lng1, lat2, lng2) {
  const distance = getDistance(
    { latitude: lat1, longitude: lng1 },
    { latitude: lat2, longitude: lng2 }
  );
  return (distance / 1609.34).toFixed(1);  // Converts meters to miles
}

function getIconUrl(locationType, isSelected) {
  let filename;
  if (locationType === "Shared Pantry") {
      filename = isSelected ? 'pantry-pin-selected.svg' : 'pantry-pin-default.svg';
  } else if (locationType === "Shared Fridge") {
      filename = isSelected ? 'fridge-pin-selected.svg' : 'fridge-pin-default.svg';
  } else if (locationType === "Business Partner") {
      filename = isSelected ? 'business-pin-selected.svg' : 'business-pin-default.svg';
  }
  return `/icons/${filename}`;
}



// const lat_shift = 0.005
const defaultCenter = { lat: 47.621484340052824, lng: -122.1766799767942 } //GIX
// const defaultCenter = { lat: 47.621484340052824, lng: -122.1766799767942 - lat_shift } //GIX

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
    const { isOpen, onOpen, onClose } = useDisclosure();


    // Fetch all locations from Firestore on component load
    const fetchLocations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'locations'));
        const fetchedLocations = querySnapshot.docs.map((doc) => {
          const currentStock = doc.data().currentStock; // Assuming currentStock is part of the document data

          // Determine stock level based on currentStock value
          let stockLevel = "Low Stock";
          if (currentStock >= 10 && currentStock < 20) {
            stockLevel = "Medium Stock";
          } else if (currentStock >= 20) {
            stockLevel = "Full Stock";
          }
          // Calculate distance from defaultCenter
          const distance = calculateDistance(
            defaultCenter.lat, defaultCenter.lng,
            doc.data().location.latitude, doc.data().location.longitude
          );

          return {
            key: doc.id,
            ...doc.data(),
            stockLevel,
            location: {
              lat: doc.data().location.latitude,
              lng: doc.data().location.longitude,
          },
            distance,
          
          };
        });

        // Sort locations by distance (ascending)
        const sortedLocations = fetchedLocations.sort(
          (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
        );

        setLocations(sortedLocations);
        setFilteredLocations(sortedLocations); // Initialize filtered list
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

    if (filters.stockLevel) {
      updatedLocations = updatedLocations.filter((location) => {
        if (filters.stockLevel === "low") return location.currentStock < 10;
        if (filters.stockLevel === "medium")
          return location.stockLevel >= 10 && location.currentStock < 20;
        if (filters.stockLevel === "high") return location.currentStock >= 20;
        return true;
      });
    }

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
  // useEffect(() => {
  //   fetchPantryData();
  // }, [selectedMarkerKey]); // Runs whenever selectedMarkerKey changes
  useEffect(() => {
    let unsubscribe;
  
    if (selectedMarkerKey) {
      console.log("Setting up real-time listener for:", selectedMarkerKey); // Debug log
      const locationRef = doc(db, 'locations', selectedMarkerKey);
      
      unsubscribe = onSnapshot(locationRef, (docSnap) => {
        console.log("Received update for:", selectedMarkerKey); // Debug log
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("New data:", data); // Debug log
          
          // Calculate distance
          const distance = calculateDistance(
            defaultCenter.lat, defaultCenter.lng,
            data.location.latitude, data.location.longitude
          );
  
          // Determine stock level
          let stockLevel = "Low Stock";
          if (data.currentStock >= 10 && data.currentStock < 20) {
            stockLevel = "Medium Stock";
          } else if (data.currentStock >= 20) {
            stockLevel = "Full Stock";
          }
  
          setSelectedLocation({
            key: selectedMarkerKey,
            ...data,
            stockLevel,
            location: {
              lat: data.location.latitude,
              lng: data.location.longitude,
            },
            distance,
          });
        } else {
          console.log('No such document!');
        }
      }, (error) => {
        console.error('Error listening to location updates:', error);
      });
    }
  
    // Cleanup function
    return () => {
      if (unsubscribe) {
        console.log("Cleaning up listener for:", selectedMarkerKey); // Debug log
        unsubscribe();
      }
    };
  }, [selectedMarkerKey]);
    
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
    <Box flex="1" position="relative" display="flex" h="calc(100vh - 64px)">
       {/* Sidebar */}
       <Box
        // position="fixed"
        // left="4"
        // mt="2"
        // h="90%"
        // w="440px"
        // pb="2"
        // overflow='hidden'
        // borderRadius="24"
        // bgColor="white"
        // overflowY="auto" // Enable vertical scrolling
        // shadow="md"
        // zIndex="modal"
        position={{ base: "fixed", md: "relative" }}
        left={0}
        bottom={{ base: 0, md: "auto" }}
        width={{ base: "100%", md: "440px" }}
        height={{ base: "50vh", md: "100%" }}
        display="flex"
        overflow="hidden"
        overflowY="auto"
        flexDirection="column"
        borderRadius={{ base: "24px 24px 0 0", md: "0" }}
        bgColor="white"
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
                icon={<Icon as={IoArrowBackOutline} boxSize="5" />}
                size='lg'
              />
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
                  <Text color="text.400" fontSize={{base: "xs", md: "sm"}} fontWeight="medium">{selectedLocation.operator} ({selectedLocation.contact})</Text>
                  {/* <Text> {selectedLocation.contact}(</Text> */}
                </HStack>

                <Box my="4" >
                <Flex justifyContent="space-between" p={{base: "2", md: "3"}} align='center' direction="row" borderTop={'1px #E4EBE4 solid'} borderBottom={'1px #E4EBE4 solid'}>
                  <Box>
                    <Text fontSize={{base: "xs", md: "sm"}} fontWeight="medium" color="text.400"> Type </Text>
                    <HStack mt="1" spacing="1" align='center'>
                      <Image 
                          src={
                              selectedLocation.type === "Shared Pantry" ? "/icons/pantry-icon.svg" :
                              selectedLocation.type === "Shared Fridge" ? "/icons/fridge-icon.svg" :
                              selectedLocation.type === "Business Partner" ? "/icons/business-icon.svg" :
                              "/icons/pantry-icon.svg"  // Fallback icon in case of an unexpected type
                          }
                          boxSize={"18px"}
                      />
                      <Text fontSize={{base: "xs", md: "sm"}} fontWeight="medium"
                            color={
                              selectedLocation.type === "Business Partner"
                                ? "#F7A016" //orange
                                : selectedLocation.type === "Shared Fridge"
                                ? "#63BB2E" //green
                                : "#4E7BFE" //blue
                            }>
                              {selectedLocation.type}
                          </Text>
                    </HStack>
                  </Box>
                  <Divider orientation='vertical' borderColor="#E4EBE4"  borderWidth="1px" h="10"/>
                  <Box>
                    <Text fontSize={{base: "xs", md: "sm"}} fontWeight="medium" color="text.400"> Hours </Text>
                    <Text mt="1" color="green" fontWeight="medium" fontSize={{base: "xs", md: "sm"}}> Open 24/7</Text>
                  </Box>
                  <Divider orientation='vertical' borderColor="#E4EBE4"  borderWidth="1px" h="10"/>
                  <Box>
                    <Text fontSize={{base: "xs", md: "sm"}} fontWeight="medium" color="text.400"> Current Stock </Text>
                    <Text mt="1" fontSize={{base: "xs", md: "sm"}} fontWeight="medium" color={
                            selectedLocation.stockLevel === "Full"
                              ? "green.500"
                              : selectedLocation.stockLevel === "Medium"
                              ? "orange.500"
                              : "red.500"
                          }>
                      {selectedLocation.currentStock} Items
                    </Text>
                  </Box>
                </Flex>
              </Box>

              {selectedLocation && selectedLocation.inventoryImage ? (
                  <HStack px={{base: "2", md: "3"}} py={{base: "2", md: "3"}} mb="2" justifyContent={'space-between'} h={{base: "120px", md: "150px"}}align='center' bg="background" borderRadius="8">
                    <VStack align="left" h="100%" justifyContent={'space-between'} flex="2">
                      <Text fontSize={{base: "xs", md: "sm"}} fontWeight="medium" color="text.400">
                        Inventory Update
                      </Text>
                      <VStack spacing="1" align={"left"}>
                        <Text fontSize="sm" fontWeight={"medium"} color="text">
                          "{selectedLocation.inventoryImage.message}"
                        </Text>
                        <Text fontSize="xs" color="text.400">
                          {selectedLocation.inventoryImage.time.toDate().toLocaleString()}
                        </Text>
                      </VStack>
                    </VStack>
                  {/* <Image
                      src={selectedLocation.inventoryImage.imageURL}
                      h="100%"
                      borderRadius={"8"}
                      objectFit="cover"
                      flex="1"
                      onClick={onOpen} // Making the image clickable to open the modal
                  /> */}
                  <Box position="relative" flex="1" height="100%">
                    <Image
                        src={selectedLocation.inventoryImage.imageURL}
                        h="100%"
                        w="100%"
                        borderRadius="8"
                        objectFit="cover"
                        cursor="pointer" // Changes cursor to pointer on hover
                        onClick={onOpen}
                    />
                    <Icon
                        as={FiZoomIn}
                        position="absolute"
                        right="5px"
                        bottom="5px"
                        color="white"
                        w={6}
                        h={6}
                        onClick={onOpen}
                        cursor="pointer" // Ensure the icon also shows a pointer cursor
                    />
                </Box>

                  {/* Modal to display enlarged image */}
                  <Modal isOpen={isOpen} onClose={onClose} size="xl">
                      <ModalOverlay />
                      <ModalContent>
                          <ModalBody>
                              <Image
                                  src={selectedLocation.inventoryImage.imageURL}
                                  maxW="100%"
                                  maxH="100%"
                                  borderRadius="8"
                              />
                          </ModalBody>
                      </ModalContent>
                  </Modal>
                </HStack>
              ) : (
                <div></div>
              )}
                
              </Box>




              <Divider borderWidth="4px"/>

              {/* Pantry Wishlist */}
              <VStack px="6" py="3" spacing="3">
                <Box w="100%">
                  <HStack justifyContent="space-between" align='center' >
                    <Text my="2" fontSize={{base: "md", md: "lg"}} fontWeight="medium">
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
                          fontSize={{base: "xs", md: "sm"}} // Text size
                          fontWeight="regular" // Text weight
                          px={{base: "2", md: "3"}} // Horizontal padding
                          py={{base: "2", md: "4"}} // Vertical padding
                          // rightIcon={<FiThumbsUp />}
                          rightIcon={<MdExposurePlus1 size="18" color="#009C1F"/>}
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
                    <Text fontSize="sm" color="text.300">Nothing in wishlist yet...</Text>
                  )}
                </Box>
                
                {/* Support us */}
                <Box pb="1"> 
                  <Text fontSize={{base: "md", md: "lg"}} fontWeight="medium">
                    Support us
                  </Text>
                  <Text fontSize={{base: "xs", md: "sm"}} color="text.300">
                    Every contribution makes a difference!
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

                  <Link href="" mt="2" display="flex" alignItems="center" isExternal>
                    <Text  fontSize={{base: "xs", md: "sm"}} color="primary" > Safety Guidelines </Text>
                  </Link>
                </Box>
              </VStack>

              <Divider borderWidth="4px"/>

              {/* Messages */}
              <VStack  px="6" py="3" spacing="2" align="start">
                <Text fontSize={{base: "md", md: "lg"}} fontWeight="medium">
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
                  placeholder="All Type"
                  size='sm'
                  w="fit-content"
                  borderRadius={8}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, type: e.target.value }))
                  }
                >
                  <option value="Shared Pantry">Shared Pantry</option>
                  <option value="Shared Fridge">Shared Fridge</option>
                  <option value="Business Partner">Business Partner</option>
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
                {/* <Select
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
                </Select> */}
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
                  <Flex align="center" justify="space-between"gap="4">
                    {/* <VStack align="center" spacing="1"  flex="1">
                      <Image
                        src={`/icons/${location.type}-icon.svg`} // Dynamic file path
                        alt={`${location.type} icon`}
                        boxSize="22px" // Adjust size as needed
                        objectFit="contain"
                      />
                      <Text fontSize="xs" color="text.300">{location.distance} mi</Text>
                    </VStack> */}
                    <VStack align="center" spacing="1"  flex="1">
                      <Image
                          src={location.image} // Dynamic file path
                          boxSize="50px" // Adjust size as needed
                          objectFit="cover"
                          borderRadius='lg'
                        />

                      <Text fontSize="xs" color="text.300">{location.distance} mi</Text>
                      
                    </VStack>
                    <Box flex="5">
                        <Text fontSize="lg" fontWeight="semibold">{location.name}</Text>
                      <Text fontSize="sm" color="text.500">{location.address}</Text>
                      <Flex gap='1' align="center">
                        <Flex gap='1' align="center">
                          <Image 
                              src={
                                location.type === "Shared Pantry" ? "/icons/pantry-icon.svg" :
                                location.type === "Shared Fridge" ? "/icons/fridge-icon.svg" :
                                location.type === "Business Partner" ? "/icons/business-icon.svg" :
                                  "/icons/pantry-icon.svg"  // Fallback icon in case of an unexpected type
                              }
                              alt={`${location.type} icon`}
                                boxSize="14px" // Adjust size as needed
                                objectFit="contain"
                          />
                          <Text fontSize="xs"
                            color={
                              location.type === "Business Partner"
                                ? "#F7A016" //orange
                                : location.type === "Shared Fridge"
                                ? "#63BB2E" //green
                                : "#4E7BFE" //blue
                            }>
                              {location.type}
                          </Text>
                        </Flex>
                        ·
                        <Text 
                          fontSize="xs"
                          color={
                            location.stockLevel === "Full Stock"
                              ? "green.500"
                              : location.stockLevel === "Medium Stock"
                              ? "orange.500"
                              : "red.500"
                          }
                        >{location.stockLevel}</Text>
                      </Flex>
                      
                    </Box>
                  </Flex>
                </Box>
              ))}
              
            </VStack>
          </Box>
        )}
      </Box>
      
      {/* Google Map */}
      <Box flex={1} position="relative" h={{ base: "50vh", md: "100%" }}>
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
          {/* {locations.map((location) => (
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
          ))} */}
          {locations.map((location) => (
            <Marker
              key={location.key}
              position={location.location}
              icon={{
                url: getIconUrl(location.type, location.key === selectedMarkerKey),
                scaledSize: new window.google.maps.Size(
                  location.key === selectedMarkerKey ? 60 : 45,
                  location.key === selectedMarkerKey ? 60 : 45
                ),
              }}
              onClick={() => {
                setSelectedMarkerKey(location.key);
                fetchAndSetSelectedLocation(location);
              }}
            />
          ))}
        </GoogleMap>
      </Box>

     
    </Box>

  );
};

export default Map;
