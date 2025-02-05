import React from 'react';
import { Box, Flex, Link, Text, Image } from '@chakra-ui/react';
import './index.css';


const Navbar = ({ setActiveTab }) => {
  return (
    <Box w="100%" px="8" py="3" zIndex={"1000"} position="fixed" bg="rgba(246,246,246,0.7)" backdropFilter="blur(30px)" shadow={"sm"}>
      <Flex justify="space-between" align="center">

        {/* Website Logo */}
        <Flex align="center" gap="2">
          <Image src="/icons/logo.svg" alt="Logo" width="35" height="35" />
          <Text fontFamily="Krona One" fontSize="lg" color="text">
            Little Pantry
          </Text>
        </Flex>

        {/* Navigation Links */}
        <Flex gap="4">
          <Link onClick={() => setActiveTab('home')} fontWeight="medium" _hover={{ textDecoration: 'underline', fontWeight:"bold"}}>Home</Link>
          ·
          <Link onClick={() => setActiveTab('map')} fontWeight="medium"   _hover={{ textDecoration: 'underline' , fontWeight:"bold"}}>Map</Link>
          ·
          <Link onClick={() => setActiveTab('about')} fontWeight="medium"  _hover={{ textDecoration: 'underline' , fontWeight:"bold"}}>About</Link>
        </Flex>

        {/* Login Link */}
        <Flex width="221px" justify="end">
          <Box borderWidth={"1px"} borderColor="text.300" borderRadius="3xl" px="4" py="1" >
            <Link onClick={() => setActiveTab('dashboard')} fontWeight="semibold"  _hover={{ textDecoration: 'underline' , fontWeight:"bold"}}>Log in</Link>
          </Box>
        </Flex>
        

      </Flex>
    </Box>
  );
};

export default Navbar;
