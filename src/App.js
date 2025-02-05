import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Map from './pages/Map';
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import { collection, getDocs} from 'firebase/firestore';
import db from './firebaseConfig';
import { Flex, Box, SkeletonText } from '@chakra-ui/react';

const App = () => {
  // const [activeTab, setActiveTab] = useState('home');
  const [activeTab, setActiveTab] = useState('home');

  return (
    <Flex flexDirection="column" h="100vh" w="100vw" bg="background">
      {/* Pass setActiveTab to Navbar */}
      <Navbar setActiveTab={setActiveTab}/>

      <Box flex="1" position="relative" mt="60px">
        {/* Conditionally render components based on the active tab */}
        {activeTab === 'home' && <Home setActiveTab={setActiveTab} />} {/* Pass setActiveTab to Home */}
        {activeTab === 'map' && <Map/>}
        {activeTab === 'about' && <About />}
        {activeTab === 'dashboard' && <Dashboard />}

      </Box>
    </Flex>
  );
};

export default App;