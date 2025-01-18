import React, { useState } from 'react';
import {
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Input,
  FormControl,
  FormLabel,
  VStack,
  Button,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react';
import { IoMdAdd } from 'react-icons/io';
import { doc, updateDoc } from 'firebase/firestore';
import db from '../firebaseConfig'; // Adjust path as needed

const AddItemDialog = ({ selectedLocation, onUpdateWishlist }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [itemName, setItemName] = useState('');

  const handleAddItem = async () => {
    if (!itemName || !selectedLocation) return;

    const updatedWishlist = {
      ...selectedLocation.wishlist,
      [itemName]: (selectedLocation.wishlist[itemName] || 0) + 1, // Automatically set quantity to 1
    };

    // Update Firebase
    const docRef = doc(db, 'locations', selectedLocation.key);
    await updateDoc(docRef, { wishlist: updatedWishlist });

    // Call callback to update local state
    onUpdateWishlist(updatedWishlist);

    // Reset form and close modal
    setItemName('');
    onClose();
  };
  
  // Clear input on modal close
  const handleModalClose = () => {
    setItemName(''); // Reset input
    onClose(); // Close modal
  };

  return (
    <>
      <IconButton
        onClick={onOpen}
        aria-label="Add Item"
        bg="transparent"
        color="#009C1F"
        borderRadius={16}
        icon={<Icon as={IoMdAdd} boxSize="6" />}
      />

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Item to Wishlist</ModalHeader>
          <ModalBody>
            <VStack spacing="4">
              <FormControl isRequired>
                <FormLabel>Item Name</FormLabel>
                <Input
                  placeholder="Enter item name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleModalClose} variant="outline" mr="3">
              Cancel
            </Button>
            <Button 
              colorScheme="green" 
              onClick={handleAddItem} 
              isDisabled={!itemName.trim()} // Disable if itemName is empty or whitespace
            >
              Add Item
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddItemDialog;
