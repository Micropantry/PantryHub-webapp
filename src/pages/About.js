import React , { useEffect, useState } from 'react';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import mqtt from 'mqtt';
import axios from 'axios';
import { format } from 'date-fns';


const About = () => {
  
  return (
    <Box px="8" py="4"  maxW="1600px" mx="auto">
      <VStack spacing="4" align="start">
        <Text fontSize="2xl" fontWeight="bold">
          About Us
        </Text>
      </VStack>

    </Box>
  );
};

export default About;



