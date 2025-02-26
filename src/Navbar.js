import React, { useState } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Image, 
  Link,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useDisclosure
} from '@chakra-ui/react';
import { NavLink as RouterLink } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box w="100%" px={{base:"4", md:"8"}} py="3" zIndex="1000" position="fixed" bg="rgba(246,246,246,0.7)" backdropFilter="blur(30px)" shadow="sm">
        <Flex justify="space-between" align="center">
          {/* Website Logo */}
          <Flex align="center" gap="2">
            <Image src="/icons/logo.svg" alt="Logo" width="35" height="35" />
            <Text fontFamily="Krona One" fontSize="lg" color="text">
              Little Pantry
            </Text>
          </Flex>

          {/* Desktop Navigation Links */}
          <Flex gap="4" display={{ base: 'none', md: 'flex' }}>
            <Link as={RouterLink} to="/"
              fontWeight="medium"
              _hover={{ textDecoration: 'underline', fontWeight: "bold" }}
              _focus={{outline:"none"}}
              style={({ isActive }) => isActive ? { textDecoration: 'underline', fontWeight: "medium" } : undefined}>
              Home
            </Link>
            <Text mx="2">·</Text>
            <Link as={RouterLink} to="/map"
              fontWeight="medium"
              _hover={{ textDecoration: 'underline', fontWeight: "bold" }}
              _focus={{outline:"none"}}
              style={({ isActive }) => isActive ? { textDecoration: 'underline', fontWeight: "medium" } : undefined}>
              Map
            </Link>
            <Text mx="2">·</Text>
            <Link as={RouterLink} to="/about"
              fontWeight="medium"
              _hover={{ textDecoration: 'underline', fontWeight: "bold" }}
              _focus={{outline:"none"}}
              style={({ isActive }) => isActive ? { textDecoration: 'underline', fontWeight: "medium" } : undefined}>
              About
            </Link>
          </Flex>

          {/* Desktop Login Button */}
          <Flex width="221px" justify="end" display={{ base: 'none', md: 'flex' }}>
            <Box borderWidth="1px" borderColor="text.300" borderRadius="3xl" px="4" py="1" >
              <Link as={RouterLink} to="/dashboard"
                fontWeight="medium"
                _hover={{ textDecoration: 'underline', fontWeight: "bold" }}
                _focus={{outline:"none"}}
                style={({ isActive }) => isActive ? { textDecoration: 'underline', fontWeight: "medium" } : undefined}>
                Log in
              </Link>
            </Box>
          </Flex>

          {/* Mobile Menu Button */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            aria-label="Open menu"
            icon={<FiMenu size={24}/>}
            variant="ghost"
            onClick={onOpen}
          />
        </Flex>
      </Box>

      {/* Mobile Menu Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Little Pantry</DrawerHeader>
          <DrawerBody>
            <VStack spacing="4" align="start" pt="4">
              <Link as={RouterLink} to="/" onClick={onClose}
                fontWeight="medium"
                _hover={{ textDecoration: 'underline' }}>
                Home
              </Link>
              <Link as={RouterLink} to="/map" onClick={onClose}
                fontWeight="medium"
                _hover={{ textDecoration: 'underline' }}>
                Map
              </Link>
              <Link as={RouterLink} to="/about" onClick={onClose}
                fontWeight="medium"
                _hover={{ textDecoration: 'underline' }}>
                About
              </Link>
              <Link as={RouterLink} to="/dashboard" onClick={onClose}
                fontWeight="medium"
                _hover={{ textDecoration: 'underline' }}>
                Log in
              </Link>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Navbar;
