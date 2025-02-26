import React, { useEffect, useState, useRef } from 'react';
import { Box, Flex, Text, VStack, Modal, ModalOverlay, ModalContent, ModalBody, useDisclosure, HStack, Icon, Image ,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  IconButton,
  SimpleGrid,
} from '@chakra-ui/react';
import mqtt from 'mqtt';
import axios from 'axios';
import { format, subDays, addDays, isToday, parseISO } from 'date-fns';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import {  doc, getDoc, deleteField, updateDoc } from 'firebase/firestore';
import {db} from '../firebaseConfig';
import { FiZoomIn, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const Dashboard = () => {
  const [intervals, setIntervals] = useState([]);
  const [latestTemp, setLatestTemp] = useState(null);
  const [latestHumidity, setLatestHumidity] = useState(null);
  const [latestItemCount, setLatestItemCount] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [wishlist, setWishlist] = useState({});
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [inventoryUpdate, setInventoryUpdate] = useState(null);
  const [doorEvents, setDoorEvents] = useState([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const cancelRef = useRef();

  const [chartData, setChartData] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const EARLIEST_DATE = parseISO('2025-02-19'); // Set the earliest available date


  // Define constants for the Adafruit IO credentials and feed details
  const AIO_KEY = process.env.REACT_APP_AIO_KEY;
  const OWNER_USERNAME = 'luoyi';
  const WEIGHT_FEED_KEY = 'total-weight';
  const DOOR_FEED_KEY = 'door-status';
  const ITEM_COUNT_FEED_KEY = 'item-count';
  const TEMPERATURE_FEED_KEY = 'temperature';
  const HUMIDITY_FEED_KEY = 'humidity';
  const AIO_USERNAME = 'luoyi';


  // Add this new function to fetch wishlist
  const fetchPantryData = async () => {
    try {
      const docRef = doc(db, 'locations', '1iRz80rI3ruAGtk6CPQU');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWishlist(data.wishlist || {});
        setInventoryUpdate(data.inventoryImage || null);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const getDateRange = (dateStr) => {
    let start, end;
    
    if (dateStr === 'today') {
      // Get start of today in local time
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date(); // current time
    } else {
      // For specific date, create local dates
      start = new Date(dateStr + 'T00:00:00'); // Add time to ensure correct date parsing
      end = new Date(dateStr + 'T23:59:59');
    }
  
    // Convert to UTC for API request
    const startStr = start.toISOString().split('.')[0] + 'Z';
    const endStr = end.toISOString().split('.')[0] + 'Z';
  
    console.log('Date Range Request:', {
      requestedDate: dateStr,
      localStart: start.toLocaleString(),
      localEnd: end.toLocaleString(),
      apiStartStr: startStr,
      apiEndStr: endStr
    });
  
    return { startStr, endStr };
  };
// Update fetchDoorEvents to use UTC dates
const fetchDoorEvents = async (dateStr = 'today') => {
  try {
    const { startStr, endStr } = getDateRange(dateStr);
    
    const response = await axios.get(
      `https://io.adafruit.com/api/v2/${OWNER_USERNAME}/feeds/${DOOR_FEED_KEY}/data`, {
        headers: { 'X-AIO-Key': AIO_KEY },
        params: {
          start_time: startStr,
          end_time: endStr,
          limit: 1000
        }
      }
    );

    const events = response.data.map(event => ({
      time: new Date(event.created_at),
      value: event.value
    }));

    setDoorEvents(events);

    // Process data for chart
    const hourlyVisits = processHourlyVisits(events);
    setChartData({
      labels: Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`),
      datasets: [
        {
          label: 'Visits',
          data: hourlyVisits,
          backgroundColor: '#95B791',
          // borderColor: 'rgb(53, 162, 235)',
          // borderWidth: 1,
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching door events:', error);
  }
};


// Add chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      position: 'top',
    },
    title: {
      display: false,
      text: 'Visits per Hour',  // Updated title
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.parsed.y} events`,  // Updated tooltip
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
    },
  },
};


  // Add date selection handler
  const handleDateChange = (direction) => {
    let newDate;
    if (direction === 'prev') {
      newDate = subDays(selectedDate, 1);
      // Prevent selecting dates before the earliest date
      if (newDate < EARLIEST_DATE) {
        return;
      }
    } else if (direction === 'next') {
      newDate = addDays(selectedDate, 1);
      // Prevent selecting future dates
      if (newDate > new Date()) {
        return;
      }
    }
    setSelectedDate(newDate);
    fetchDoorEvents(format(newDate, 'yyyy-MM-dd'));
  };

  const formatPSTTime = (date) => {
    const d = date.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    // Convert from "MM/DD/YYYY, HH:MM" to "YYYY-MM-DD HH:MM"
    const [datePart, timePart] = d.split(', ');
    const [month, day, year] = datePart.split('/');
    return `${year}-${month}-${day} ${timePart}`;

  };




  const stockLevelText = (count) => {
    if (count < 10) {
      return { text: "Low Stock", color: "red.500" };
    } else if (count >= 10 && count < 20) {
      return { text: "Medium Stock", color: "orange.500" };
    } else  if (count >= 20){
      return { text: "Full Stock", color: "green.500" };
    }
    else {
      return { text: "No Data", color: "gray.500" };
    }
  };

  
  // Update Firebase Stock
  const updateFirebaseStock = async (newCount) => {
    try {
      const docRef = doc(db, 'locations', '1iRz80rI3ruAGtk6CPQU');
      await updateDoc(docRef, {
        currentStock: newCount
      });
      console.log('Stock updated in Firebase:', newCount);
    } catch (error) {
      console.error('Error updating stock in Firebase:', error);
    }
  };

  const fetchLatestSensorData = async () => {
    try {
      const [tempResponse, humidityResponse, itemCountResponse] = await Promise.all([
        axios.get(
          `https://io.adafruit.com/api/v2/${OWNER_USERNAME}/feeds/${TEMPERATURE_FEED_KEY}/data?limit=1`,
          { headers: { 'X-AIO-Key': AIO_KEY } }
        ),
        axios.get(
          `https://io.adafruit.com/api/v2/${OWNER_USERNAME}/feeds/${HUMIDITY_FEED_KEY}/data?limit=1`,
          { headers: { 'X-AIO-Key': AIO_KEY } }
        ),
        axios.get(
          `https://io.adafruit.com/api/v2/${OWNER_USERNAME}/feeds/${ITEM_COUNT_FEED_KEY}/data?limit=1`,
          { headers: { 'X-AIO-Key': AIO_KEY } }
        ),
      ]);
      console.log(tempResponse.data[0].value);
      console.log(humidityResponse.data[0].value);
      console.log(itemCountResponse.data[0].value);

      if (tempResponse.data && tempResponse.data.length > 0) {
        setLatestTemp({
          value: parseFloat(tempResponse.data[0].value),
          timestamp: new Date(tempResponse.data[0].created_at)
        });
      }

      if (humidityResponse.data && humidityResponse.data.length > 0) {
        setLatestHumidity({
          value: parseFloat(humidityResponse.data[0].value),
          timestamp: new Date(humidityResponse.data[0].created_at)
        });
      }

      if (itemCountResponse.data && itemCountResponse.data.length > 0) {
        const newCount = parseInt(itemCountResponse.data[0].value);
        setLatestItemCount({
          value: newCount,
          timestamp: new Date(itemCountResponse.data[0].created_at)
        });
        // Update Firebase when item count changes
        updateFirebaseStock(newCount);
      }

    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };


  // Function to process events into daily hourly data
  const processHourlyVisits = (events) => {
    // Initialize array with 24 zeros for each hour
    const hourlyData = new Array(24).fill(0);
  
    // Count each door event for each hour
    events.forEach(event => {
      const hour = event.time.getHours();
      hourlyData[hour]++;
    });
  
    return hourlyData;
  };



  useEffect(() => {
    fetchLatestSensorData();
    fetchPantryData(); 
    fetchDoorEvents();
    const client = mqtt.connect('wss://io.adafruit.com:443/mqtt', {
      username: AIO_USERNAME,
      password: AIO_KEY,
    });

    client.on('connect', () => {
      console.log('MQTT Connected');
      client.subscribe([
        `${OWNER_USERNAME}/feeds/${WEIGHT_FEED_KEY}`,
        `${DOOR_FEED_KEY}`,
        `${ITEM_COUNT_FEED_KEY}`,
        `${TEMPERATURE_FEED_KEY}`,
        `${HUMIDITY_FEED_KEY}`,
      ]);
    });

    client.on('message', (topic, message) => {
      if (topic.includes(TEMPERATURE_FEED_KEY) || topic.includes(HUMIDITY_FEED_KEY)) {
        fetchLatestSensorData();
      } else if (topic.includes(DOOR_FEED_KEY)) {
        fetchDoorEvents();
      }
    });

    return () => {
      if (client) {
        client.end();
      }
    };
  }, []);


  // Add this function to handle item deletion
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const docRef = doc(db, 'locations', '1iRz80rI3ruAGtk6CPQU');
      await updateDoc(docRef, {
        [`wishlist.${itemToDelete}`]: deleteField()
      });
      
      // Refresh wishlist data
      fetchPantryData();
      setIsDeleteOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
    }
  };

  // Update the renderWishlistItems function
  const renderWishlistItems = () => (
    <VStack spacing="2" align="start" w="100%">
      {Object.entries(wishlist).map(([item, quantity]) => (
        <Flex 
          key={item} 
          w="100%" 
          justify="space-between" 
          py="1" 
          borderBottom="1px" 
          borderColor="gray.200"
          align="center"
        >
          <Text fontSize="sm" fontWeight="medium">{item}</Text>
          <Flex align="center" gap="4">
            <Text fontSize="sm" color="gray.500">{quantity} wanted</Text>
            <IconButton
              icon={<FiTrash2 />}
              variant="ghost"
              colorScheme="gray"
              size="sm"
              aria-label="Delete item"
              onClick={() => {
                setItemToDelete(item);
                setIsDeleteOpen(true);
              }}
            />
          </Flex>
        </Flex>
      ))}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          setIsDeleteOpen(false);
          setItemToDelete(null);
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Wishlist Item
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to remove "{itemToDelete}" from the wishlist?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => {
                setIsDeleteOpen(false);
                setItemToDelete(null);
              }}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteItem} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );

  

  return (
    <Box px={{base:"4", md:"8"}} py="4" maxW="1600px" mx="auto" bg="background" h="calc(100vh - 64px)" overflowY="auto" >
      <VStack spacing="4" align="start" h="100%" >
        <Text fontSize="2xl" fontWeight="bold">
          GIX Pantry's Dashboard
        </Text>

        {/* Status Cards */}
        <Flex direction={{base: "column", md: "row"}} gap="4" w="100%"  >
          

          {/* Inventory Update Card */}
          {inventoryUpdate && (
            <HStack 
              flex="2"
              px="4" 
              py="4" 
              justifyContent="space-between" 
              align="center" 
              bg="white"
              borderWidth="1px"
              borderColor="grey.500"
              borderRadius="3xl"
              maxH="150px"
              minH="150px"
            >
              <VStack align="start" h="100%" justifyContent="space-between" flex="2">
                <VStack gap="1" align="start">
                  <Text fontSize="sm">Inventory Update</Text>
                
                  <Text fontSize="md" fontWeight="medium">
                    "{inventoryUpdate.message}"
                  </Text>
                </VStack>
                  <Text fontSize="sm" color="gray.500">
                    {/* {inventoryUpdate.time?.toDate().toLocaleString()} */}
                    {inventoryUpdate.time ? formatPSTTime(inventoryUpdate.time.toDate()) : 'No data'}
                  </Text>
                
              </VStack>
              
              <Box position="relative" flex="1.5" h="100%">
                <Image
                  src={inventoryUpdate.imageURL}
                  h="100%"
                  w="100%"
                  borderRadius="2xl"
                  objectFit="cover"
                  cursor="pointer"
                  onClick={onOpen}
                />
                <Icon
                  as={FiZoomIn}
                  position="absolute"
                  right="5px"
                  bottom="5px"
                  color="white"
                  w={6}
                  h={6}
                  onClick={onOpen}
                  cursor="pointer"
                />
              </Box>
            </HStack>
          )}

          {/* Modal for enlarged image */}
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalBody>
                <Image
                  src={inventoryUpdate?.imageURL}
                  maxW="100%"
                  maxH="100%"
                  borderRadius="8"
                />
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Current Stock Card */}
          <VStack 
            flex="1" 
            background="white" 
            borderWidth="1px" 
            borderColor="grey.500" 
            borderRadius="3xl" 
            px="4" 
            py="4" 
            gap="1" 
            align="start"
            justifyContent="space-between"
          >
            <VStack align="start" gap="1">
              <Text fontSize="sm">Current Stock</Text>
            
              <Flex direction="row" align="end" gap="2">
                <Text fontSize="3xl" fontWeight="bold" lineHeight="1">
                  {latestItemCount ? latestItemCount.value : '--'}
                </Text>
                items
              </Flex>
              
            </VStack>
            <Text fontSize="sm" color={stockLevelText(latestItemCount?.value || 0).color}>
                {/* {latestItemCount ? formatPSTTime(latestItemCount.timestamp) : 'No data'} */}
                {stockLevelText(latestItemCount?.value|| 0).text}
            </Text>
          </VStack>

          {/* Temperature Card */}
          <VStack 
            flex="1" 
            background="white" 
            borderWidth="1px" 
            borderColor="grey.500" 
            borderRadius="3xl" 
            px="4" 
            py="4" 
            gap="1" 
            align="start"
            justifyContent="space-between"
          >
            <VStack align="start" gap="1">
              <Text fontSize="sm">Temperature</Text>
            
              <Flex direction="row" align="end" gap="2">
                <Text fontSize="3xl" fontWeight="bold" lineHeight="1">
                  {latestTemp ? latestTemp.value.toFixed(1): '--'}
                </Text>
                °C
              </Flex>
              
            </VStack>
            <Text fontSize="sm" color="gray.500">
                {latestTemp ? formatPSTTime(latestTemp.timestamp) : 'No data'}
            </Text>
          </VStack>

          {/* Humidity Card */}
          <VStack 
            flex="1" 
            background="white" 
            borderWidth="1px" 
            borderColor="grey.500" 
            borderRadius="3xl" 
            px="4" 
            py="4" 
            gap="1" 
            align="start"
            justifyContent="space-between"
          >
            <VStack align="start" gap="1">
              <Text fontSize="sm">Humidity</Text>
            
              <Flex direction="row" align="end" gap="2">
                <Text fontSize="3xl" fontWeight="bold" lineHeight="1">
                {latestHumidity ? latestHumidity.value.toFixed(1) : '--'}
              </Text>
              %
            </Flex>
            </VStack>
            <Text fontSize="sm" color="gray.500">
              {latestHumidity ? formatPSTTime(latestHumidity.timestamp) : 'No data'}
            </Text>
          </VStack>
        </Flex>

        {/* Activity Log and Wishlist Container */}
        <Flex direction={{base: "column", md: "row"}} gap="4" w="100%" flex="1" minH={{base:"600px", md:"400px"}} maxH={{base:"none", md:"600px"}}>
          {/* Activity Log */}
          <VStack 
            spacing="2" 
            background="white" 
            borderWidth="1px" 
            borderColor="grey.500" 
            borderRadius="3xl" 
            px="4" 
            py="4" 
            gap="2" 
            align="start" 
            h="100%"
            flex={{base:"1", md:"3"}}
          >
            <Flex w="100%" justify="space-between" align="center" >
              <Text fontSize={{base:"md", md:"lg"}} fontWeight="bold">
                Visitor Activity Log
              </Text>
              <HStack spacing={2}>
                <IconButton
                  icon={<FiChevronLeft />}
                  onClick={() => handleDateChange('prev')}
                  variant="ghost"
                  aria-label="Previous day"
                  size="sm"
                  isDisabled={selectedDate.getTime() <= EARLIEST_DATE.getTime()} 
                />
                <Text fontSize="sm" minW="100px" textAlign="center">
                  {isToday(selectedDate) 
                    ? 'Today' 
                    : format(selectedDate, 'MM/dd/yyyy')}
                </Text>
                <IconButton
                  icon={<FiChevronRight />}
                  onClick={() => handleDateChange('next')}
                  variant="ghost"
                  aria-label="Next day"
                  size="sm"
                  isDisabled={isToday(selectedDate)}
                />
              </HStack>
            </Flex>

            {/* Conditionally render chart only when there's data */}
            {doorEvents.length > 0 ? (
              <Box w="100%" h="200px" pr="4" flex="1">
                <Bar data={chartData} options={chartOptions} />
              </Box>
            ) : (
              <Box w="100%" h="90%" display="flex" justifyContent="center" alignItems="center">
                <Text fontSize="lg" color="gray.500">No events found</Text>
              </Box>
            )}


            {/* Activity Log List */}
            <VStack 
              w="100%" 
              flex="1"
              overflowY="auto" 
              spacing="2"
              align="start"
              minH="0"
            >
              {doorEvents.length === 0 ? (
                <Box w="100%" h="90%" display="flex" justifyContent="center" alignItems="center">
                  <Text fontSize="lg" color="gray.500">No events found</Text>
                </Box>
                
              ) : (
                doorEvents
                  .sort((a, b) => b.time - a.time)
                  .map((event, index) => (
                    <Flex 
                      key={index}
                      w="100%" 
                      justify="space-between" 
                      py="2" 
                      pr="4"
                      borderBottom="1px" 
                      borderColor="gray.200"
                    >
                      <Text fontSize="sm" >
                        {format(event.time, 'HH:mm')}
                      </Text>
                      <Text 
                        fontSize="sm"
                        color={"gray.500"}
                      >
                        {event.value}
                      </Text>
                    </Flex>
                  ))
              )}
            </VStack>

          
          </VStack>

          {/* Wishlist Section */}
          <VStack
            flex={{base:"1", md:"2"}}
            spacing="2"
            background="white"
            borderWidth="1px"
            borderColor="grey.500"
            borderRadius="3xl"
            px="4"
            py="4"
            gap="2"
            align="start"
            h="100%"
          >
            <Text fontSize="lg" fontWeight="bold">
              Pantry Wishlist
            </Text>
            {Object.keys(wishlist).length === 0 ? (
              <Text fontSize="sm" color="gray.500">No items in wishlist</Text>
            ) : (
              renderWishlistItems()
            )}
          </VStack>
      
        </Flex>
      </VStack>
    </Box>
  );
};

export default Dashboard;