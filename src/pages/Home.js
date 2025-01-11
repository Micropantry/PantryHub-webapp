import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

const Home = () => {
  return (
    <Box p="5">
      <VStack spacing="4" align="start">
        <Text fontSize="2xl" fontWeight="bold">
          Welcome to the Home Page!
        </Text>
        <Text fontSize="md" color="gray.600">
          This is a placeholder for the Home page content. You can replace this with your actual content later.
        </Text>
      </VStack>
    </Box>
  );
};

export default Home;
