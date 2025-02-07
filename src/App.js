// import React, { useState, useEffect } from 'react';
// import Navbar from './Navbar';
// import Map from './pages/Map';
// import Home from './pages/Home';
// import About from './pages/About';
// import Dashboard from './pages/Dashboard';
// import { Flex, Box, SkeletonText } from '@chakra-ui/react';

// const App = () => {
//   // const [activeTab, setActiveTab] = useState('home');
//   const [activeTab, setActiveTab] = useState('home');

//   return (
//     <Flex flexDirection="column" h="100vh" w="100vw" bg="background">
//       {/* Pass setActiveTab to Navbar */}
//       <Navbar setActiveTab={setActiveTab}/>

//       <Box flex="1" position="relative" mt="60px">
//         {/* Conditionally render components based on the active tab */}
//         {activeTab === 'home' && <Home setActiveTab={setActiveTab} />} {/* Pass setActiveTab to Home */}
//         {activeTab === 'map' && <Map/>}
//         {activeTab === 'about' && <About />}
//         {activeTab === 'dashboard' && <Dashboard />}

//       </Box>
//     </Flex>
//   );
// };

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route,useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Map from './pages/Map';
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import UploadInventory from './pages/UploadInventory';
import { Flex, Box } from '@chakra-ui/react';

// Helper component to conditionally render the Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  const showNavbar = !['/upload'].includes(location.pathname); // Exclude Navbar on GIXPantry page

  return (
    <Flex flexDirection="column" h="100vh" w="100vw" bg="background">
      {showNavbar && <Navbar />}
      <Box flex="1" position="relative" mt={showNavbar ? "60px" : "0"}>
        {children}
      </Box>
    </Flex>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadInventory />} />  {/* New route for GIXPantry */}
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
