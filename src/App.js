import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Map from './pages/Map';
import Home from './pages/Home';
import { collection, getDocs} from 'firebase/firestore';
import db from './firebaseConfig';
import { Flex, Box, SkeletonText } from '@chakra-ui/react';

const App = () => {
  // const [activeTab, setActiveTab] = useState('home');
  const [activeTab, setActiveTab] = useState('map');

  return (
    <Flex flexDirection="column" h="100vh" w="100vw">
      <Navbar setActiveTab={setActiveTab} />

      <Box flex="1" position="relative">
        {activeTab === 'home' && <Home />}
        {activeTab === 'map' && <Map/>}

      </Box>
    </Flex>
  );
};

export default App;