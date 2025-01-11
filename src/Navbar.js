// export default function Navbar() {
//     return <nav className="navbar">
//         <a href="/" className="site-title">Little Pantry</a>
//         <ul>
//             <li><a href="/">Home</a></li>
//             <li><a href="/">Map</a></li>
//             <li><a href="/">About</a></li>
//         </ul>
//         </nav>
// }

// Navbar.js
import React from 'react';
import { Box, Flex, Link, Text } from '@chakra-ui/react';

const Navbar = ({ setActiveTab }) => {
  return (
    <Box bg="black" w="100%" p="4" color="white" shadow="md">
      <Flex justify="space-between" align="center">
        {/* Logo or Title */}
        <Text fontSize="xl" fontWeight="bold">
          Little Pantry
        </Text>

        {/* Navigation Links */}
        {/* <Flex gap="4">
          <Link href="/map" color="white" _hover={{ textDecoration: 'underline' }}>
            Home
          </Link>
          <Link href="/map" color="white" _hover={{ textDecoration: 'underline' }}>
            Map
          </Link>
          <Link href="/about" color="white" _hover={{ textDecoration: 'underline' }}>
            About
          </Link>
        </Flex> */}
        <Flex gap="4">
          <Link onClick={() => setActiveTab('home')} color="white" _hover={{ textDecoration: 'underline' }}>Home</Link>
          <Link onClick={() => setActiveTab('map')} color="white" _hover={{ textDecoration: 'underline' }}>Map</Link>
          {/* <Link href="/about" color="white" _hover={{ textDecoration: 'underline' }}>About</Link> */}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
