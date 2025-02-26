import React, {useState} from 'react';
import { Box, Text, VStack, HStack, Image, Button, Icon, Flex} from '@chakra-ui/react';
import { FiArrowUpRight } from "react-icons/fi";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { IoMdShare } from "react-icons/io";
import { FaPeopleGroup } from "react-icons/fa6";


const Home = ({ setActiveTab }) => {
  const handleNavigateToMap = () => {
    setActiveTab('map'); // Switch to the map tab
  };

  return (
    <Box bg="background"  h="100%">
      <Box px="8" py="4"  maxW="1600px" mx="auto">
      <HStack spacing="4" w="100%" align="stretch">
         {/* Left Section */}
        <Box bg="babyblue" p="4" borderRadius="3xl" flex="3">
          {/* Left Section */}
          <HStack w="100%" justifyContent={"flex-end"} p="4">
            <Image
              src="https://archive.org/download/placeholder-image/placeholder-image.jpg"
              alt="placeholder"
              height="200px" // Adjust the height here
              width="350px" // Adjust the width here
              objectFit="cover" // Ensures the image fills the container appropriately
              borderRadius="100px"
            />
          </HStack>
          <VStack spacing="4" align="start" p="6">
            <Text fontSize="6xl" fontWeight="medium" color="text.500">
              Share. Sustain. Support.
            </Text>
            <Text fontSize="2xl" color="text.400" pb="4">
              Connect with your community through local micro-pantries.
            </Text>
            <Button 
              size="lg" 
              bg="white" 
              borderRadius="3xl"
              px="8"
              display="flex" 
              alignItems="center" 
              gap="2" 
              onClick={handleNavigateToMap}  // Navigate to the map tab
            >
              Find a pantry
              <Icon as={FiArrowUpRight} boxSize="6" strokeWidth="3"/>
            </Button>
          </VStack>
        </Box>
        {/* Right Section */}
        {/* <Box flex="2" h="100%">
          <Flex flexDirection="column" h="100%" gap="4">
              <Box bg="babyblue" p="4" borderRadius="3xl">
                <Text fontSize="xl" fontWeight="medium">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </Text>
              </Box>
              <VStack bg="darkGreen" p="4" borderRadius="3xl" flex="1">
                <Text fontSize="xl" fontWeight="medium" color="white">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </Text>
                <HStack spacing="4">
                  <Button 
                    size="lg" 
                    bg="lightgreen" 
                    borderRadius="3xl"
                    px="8"
                    display="flex" 
                    alignItems="center" 
                    gap="2" 
                  >
                    Start a pantry
                  </Button>
                  <Button 
                    size="lg" 
                    bg="lightgreen" 
                    borderRadius="3xl"
                    px="8"
                    display="flex" 
                    alignItems="center" 
                    gap="2" 
                  >
                    Login
                  </Button>
                </HStack>
              </VStack>
          </Flex>
        </Box> */}

        <Box bg="lightgreen" p="4" borderRadius="3xl" flex="2">
        </Box>
      </HStack>


      <HStack spacing="8" my="40" w="100%" align="stretch">
        <VStack bg="white" p="8" borderRadius="3xl" flex="1" align="start">
          <Icon as={PiMagnifyingGlassBold} boxSize="8" strokeWidth="3"/>
          <Text fontSize="xl" fontWeight="semibold">
            Discover Local Pantries
          </Text>
          <Text fontSize="md">
            Find micro pantries in your neighborhood and see what's avilable.
          </Text>
        </VStack>
        <VStack bg="white" p="8" borderRadius="3xl" flex="1" align="start">
          <Icon as={IoMdShare} boxSize="8" strokeWidth="3"/>
          <Text fontSize="xl" fontWeight="semibold">
            Share Your Surplus
          </Text>
          <Text fontSize="md">
            Contribute your excess food items to local pantries and help reduce food waste.
          </Text>
        </VStack>
        <VStack bg="white" p="8" borderRadius="3xl" flex="1" align="start">
          <Icon as={FaPeopleGroup} boxSize="8" strokeWidth="3"/>
          <Text fontSize="xl" fontWeight="semibold">
            Join the Network
          </Text>
          <Text fontSize="md">
            Start your own pantry or list your business for food pickups to support sustainable living.
          </Text>
        </VStack>
      </HStack>



      <VStack spacing="4" align="start" py="4" my="32" maxW={["100%", "80%", "60%"]}>
        <Box bg="lightgreen" px="6" py="2" borderRadius="3xl">
          <Text fontSize="xl" fontWeight="semibold">
            Heading
          </Text>
        </Box>
        <Text fontSize="4xl" fontWeight="semibold">
        Lorem ipsum dolor sit amet. Qui quaerat eius ut nihil illo eos dolor nostrum nam minus nobis id placeat eligendi. Ut error soluta et perspiciatis rerum.
        </Text>
      </VStack>


      <HStack spacing="4" w="100%" align="stretch">
        <VStack spacing="4" align="start" flex="2">
          <HStack spacing="4" align="start" h="250px">
            <Box bg="white" p="8" borderRadius="3xl" flex="2" h="100%" >
              <Text fontSize="xl" fontWeight="extrabold">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </Text>
            </Box>
            <Box bg="lightgreen" p="2" borderRadius="3xl" flex="1" h="100%" align="center">
              <Image
                src="https://archive.org/download/placeholder-image/placeholder-image.jpg"
                alt="placeholder"
                height="100%"
                width="100%"
                objectFit="cover" // Ensures the image fills the container appropriately
                borderRadius="3xl"
              />
              
            </Box>
          </HStack>
          <HStack spacing="4" align="start" h="250px">
            <Box bg="babyblue" p="8" borderRadius="3xl" flex="1" h="100%">
              <Text fontSize="xl" fontWeight="extrabold">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </Text>
            </Box>
            <Box bg="white" p="8" borderRadius="3xl" flex="2" h="100%">
              <Text fontSize="xl" fontWeight="extrabold">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </Text>

            </Box>
          </HStack>
            
          </VStack>
            <Box bg="darkgreen" p="4" borderRadius="3xl" flex="1">
            </Box>
          </HStack>
    </Box>

    </Box>
    



  );
};

export default Home;
