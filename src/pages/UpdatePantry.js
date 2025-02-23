import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  Text, 
  Button, 
  Input, 
  Textarea,
  SimpleGrid,
  Heading,
  List,
  ListItem,
  IconButton,
  HStack,
  Flex,
} from '@chakra-ui/react';
import { FiPlus, FiArrowLeft } from 'react-icons/fi';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../firebaseConfig';

const pantryID = "1iRz80rI3ruAGtk6CPQU";

const UpdatePantry = () => {
  const [view, setView] = useState('main'); // 'main', 'wishlist', or 'inventory'
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [wishlistItems, setWishlistItems] = useState({});
  const [newWishlistItem, setNewWishlistItem] = useState("");

  // Fetch existing wishlist on component mount
  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const docRef = doc(db, "locations", pantryID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const wishlist = docSnap.data().wishlist || {};
        setWishlistItems(wishlist);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlistItems({});
    }
  };

  const addToWishlist = async () => {
    if (!newWishlistItem.trim()) return;
    
    try {
      const docRef = doc(db, "locations", pantryID);
      const updatedWishlist = {
        ...wishlistItems,
        [newWishlistItem.trim()]: 1
      };
      
      await updateDoc(docRef, {
        wishlist: updatedWishlist
      });
      
      setWishlistItems(updatedWishlist);
      setNewWishlistItem("");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };

  const incrementCount = async (item) => {
    try {
      const docRef = doc(db, "locations", pantryID);
      const updatedWishlist = {
        ...wishlistItems,
        [item]: (wishlistItems[item] || 0) + 1
      };
      
      await updateDoc(docRef, {
        wishlist: updatedWishlist
      });
      
      setWishlistItems(updatedWishlist);
    } catch (error) {
      console.error("Error incrementing count:", error);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first!");
      return;
    }

    try {
      const storageRef = ref(storage, `/${pantryID}/inventoryImg`);
      const snapshot = await uploadBytes(storageRef, image);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const locationRef = doc(db, "locations", pantryID);
      const updateData = {
        inventoryImage: {
          imageURL: downloadURL,
          time: serverTimestamp(),
        }
      };

      if (message.trim()) {
        updateData.inventoryImage.message = message.trim();
      }

      await setDoc(locationRef, updateData, { merge: true });
      setUploadStatus(`Updated successfully at ${new Date().toLocaleTimeString()}`);
      setImage(null);
      setMessage("");
      document.getElementById("fileInput").value = "";
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("Failed to update inventory.");
    }
  };

  // Main view with two cards
  if (view === 'main') {
    return (
      <Box px={{ base: "4", md: "8" }} py="4" maxW="1600px" mx="auto">
        <Heading size="md" my={4}>Welcome to GIX Pantry</Heading>
        <SimpleGrid 
          columns={{ base: 1, md: 2 }} 
          spacing={{ base: 4, md: 10 }} 
          mt={10}
        >
          <Box 
            p={6} 
            borderWidth="1px" 
            borderRadius="lg" 
            bg="white"
            cursor="pointer" 
            onClick={() => setView('wishlist')}
            _hover={{ 
              transform: 'scale(1.02)',
              shadow: 'md',
              borderColor: 'primary'
            }}
            transition="all 0.2s"
          >
            <Heading size="md" mb={4}>Add to Wishlist</Heading>
            <Text>Let donors and hosts know what's needed.</Text>
          </Box>
          <Box 
            p={6} 
            borderWidth="1px" 
            borderRadius="lg" 
            bg="white"
            cursor="pointer" 
            onClick={() => setView('inventory')}
            _hover={{ 
              transform: 'scale(1.02)',
              shadow: 'md',
              borderColor: 'primary'
            }}
            transition="all 0.2s"
          >
            <Heading size="md" mb={4}>Update Inventory</Heading>
            <Text>Snap a photo to help the community see what's available.</Text>
          </Box>
        </SimpleGrid>
      </Box>
    );
  }

  // Wishlist view
  if (view === 'wishlist') {
    return (
      <Box px="8" py="4" maxW="1600px" mx="auto">
        <VStack spacing="4" align="start">
          <IconButton
            icon={<FiArrowLeft />}
            onClick={() => setView('main')}
            aria-label="Back"
          />
            
          <Heading size="md">Pantry Wishlist</Heading>
          
          <VStack  py="3" spacing="3" w="100%" align="start">
              {Object.entries(wishlistItems).length > 0 ? (
                <Flex align="start" wrap='wrap' gap="1" justify='flex-start' my="2">
                  {Object.entries(wishlistItems)
                    .sort(([, countA], [, countB]) => countB - countA)
                    .map(([item, count]) => (
                      <Button
                        key={item}
                        size="sm"
                        variant="outline"
                        fontSize="sm"
                        fontWeight="regular"
                        px="2"
                        py="4"
                        bg="white"
                        rightIcon={<FiPlus />}
                        iconSpacing={1}
                        onClick={() => incrementCount(item)}
                      >
                        <HStack spacing="1">
                          <Text>{item}</Text>
                          <Text color="text.300">({count})</Text>
                        </HStack>
                      </Button>
                    ))}
                </Flex>
              ) : (
                <Text fontSize="sm" color="text.300" mt="4">Nothing in wishlist yet...</Text>
              )}

              <HStack w="100%" maxW="500px">
                <Input
                  value={newWishlistItem}
                  bg="white"
                  onChange={(e) => setNewWishlistItem(e.target.value)}
                  placeholder="Add new item to wishlist..."
                  size="md"
                  borderRadius="8"
                  _placeholder={{ fontSize: "sm", color: "text.300" }}
                />
                <Button
                  onClick={addToWishlist}
                  size="md"
                  variant="ghost"
                  bg="#009C1F"
                  color="white"
                  fontWeight="medium"
                  fontSize="sm"
                >
                  Add Item
                </Button>
              </HStack>
          </VStack>
        </VStack>
      </Box>
    );
  }

  // Inventory update view
  if (view === 'inventory') {
    return (
      <Box px="8" py="4" maxW="1600px" mx="auto">
        <VStack spacing="4" align="start">
          <IconButton
            icon={<FiArrowLeft />}
            onClick={() => setView('main')}
            aria-label="Back"
          />
            
          <Heading size="md">Update Inventory</Heading>
          <Text>Select an image:</Text>
          <Input id="fileInput" bg="white" p="1" type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />

          <Text>Enter a description:</Text>
          <Textarea 
            placeholder="Add a short description of what you donated or took..." 
            value={message} 
            bg="white"
            onChange={(e) => setMessage(e.target.value)} 
          />

          <Button onClick={handleUpload} colorScheme="green">Upload</Button>
          <Text>{uploadStatus}</Text>
        </VStack>
      </Box>
    );
  }
};

export default UpdatePantry;
