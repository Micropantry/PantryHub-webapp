// Dashboard
import React , { useEffect, useState } from 'react';
import { Box, Flex, Text, VStack, HStack } from '@chakra-ui/react';
import mqtt from 'mqtt';
import axios from 'axios';
import { format } from 'date-fns';
import Papa from 'papaparse';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';


Chart.register(...registerables);

const Dashboard = () => {
//   const [weightData, setWeightData] = useState(['Loading...']);
//   const [temperatureData, setTemperatureData] = useState(['Loading...']);
//   const [door1Data, setDoor1Data] = useState(['Loading...']);
//   const [door2Data, setDoor2Data] = useState(['Loading...']);



//   // Define constants for the Adafruit IO credentials and feed details
//   const AIO_KEY = process.env.REACT_APP_AIO_KEY; // Ensure your AIO key is stored in .env.local
//   const OWNER_USERNAME = 'deeksha795'; // Replace with the actual feed owner's username
//   const WEIGHT_FEED_KEY = 'total-weight'; // Replace with the actual feed key
//   const DOOR1_FEED_KEY = 'door1-status'; // Replace with the actual feed key
//   const DOOR2_FEED_KEY = 'door2-status'; // Replace with the actual feed key
//   const TEMPERATURE_FEED_KEY = 'temperature'; // Replace with the actual feed key
//   const AIO_USERNAME = 'luoyi'; // Replace with the actual AIO username

  // // Function to fetch weight data
//   const fetchWeightData = async (start_time, end_time) => {
//     try {
//         const response = await axios.get(`https://io.adafruit.com/api/v2/${OWNER_USERNAME}/feeds/${WEIGHT_FEED_KEY}/data?start_time=${start_time}&end_time=${end_time}`, {
//             headers: { 'X-AIO-Key': AIO_KEY }
//         });
//         if (response.data && response.data.length > 0) {
//            console.log('start_time:', start_time);
//             console.log('end_time:', end_time);
//             console.log('return value:',response.data);
//             setWeightData(response.data);

//         } else {
//             setWeightData('No weight data available');
//         }
//     } catch (error) {
//         console.error('Error fetching weight data:', error);
//         setWeightData('Failed to load weight data');
//     }
//   };


//   // Fetch latest data
//   const fetchData = async (feedKey, setData) => {
//     try {
//       const response = await axios.get(`https://io.adafruit.com/api/v2/${OWNER_USERNAME}/feeds/${feedKey}/data?limit=1`, {
//           headers: { 'X-AIO-Key': AIO_KEY }
//       });
//       if (response.data && response.data.length > 0) {
//           setData(response.data);
//           console.log(feedKey, Array.isArray(response.data), response.data);

//       } else {
//           setData(`No ${feedKey} data available`);
//       }
//     } catch (error) {
//         console.error(`Error fetching ${feedKey}  data:`, error);
//         setData(`Failed to load ${feedKey}  data`);
//     }

//   };

  

//   useEffect(() => {

    // fetchData(WEIGHT_FEED_KEY, setWeightData);
    // fetchData(TEMPERATURE_FEED_KEY, setTemperatureData); 
    // fetchData(DOOR1_FEED_KEY, setDoor1Data);
    // fetchData(DOOR2_FEED_KEY, setDoor2Data);
    


    // // Set up MQTT client
    // const client = mqtt.connect('wss://io.adafruit.com:443/mqtt', {
    //     username: AIO_USERNAME,
    //     password: AIO_KEY,
    // });

    // client.on('connect', () => {
    //     console.log('MQTT Connected');
    //     client.subscribe([
    //       `${OWNER_USERNAME}/feeds/${WEIGHT_FEED_KEY}`,
    //       `${OWNER_USERNAME}/feeds/${TEMPERATURE_FEED_KEY}`,
    //       `${OWNER_USERNAME}/feeds/${DOOR1_FEED_KEY}`,
    //       `${OWNER_USERNAME}/feeds/${DOOR2_FEED_KEY}`,
    //     ]);
    // });

    // client.on('message', (topic, message) => {
    //     const payload = message.toString();
    //     const payloadJSON = JSON.parse(payload);
    //     console.log('Received message:', topic, payloadJSON);
    //     // Check the topic to determine which data feed it belongs to
    //     if (topic === `${OWNER_USERNAME}/feeds/${WEIGHT_FEED_KEY}`) {
    //       const receivedAt = format (new Date(), 'yyyy-MM-dd HH:mm');
    //       setWeightData(`${payload} (${receivedAt})`);
    //     } 
    //     else if (topic === `${OWNER_USERNAME}/feeds/${TEMPERATURE_FEED_KEY}`) {
    //       const receivedAt = format (new Date(), 'yyyy-MM-dd HH:mm');
    //       setTemperatureData(`${payload} °C (${receivedAt})`);
    //     }
    //     else if (topic === `${OWNER_USERNAME}/feeds/${DOOR1_FEED_KEY}`) {
    //       const receivedAt = format (new Date(), 'yyyy-MM-dd HH:mm');
    //       setDoor1Data(`${payload} (${receivedAt})`);
    //     }
    //     else if (topic === `${OWNER_USERNAME}/feeds/${DOOR2_FEED_KEY}`) {
    //       const receivedAt = format (new Date(), 'yyyy-MM-dd HH:mm');
    //       setDoor2Data(`${payload} (${receivedAt})`);
    //     }
    // });

    // return () => {
    //   if (client) {
    //       client.end();
    //       console.log('MQTT Disconnected');
    //   }
    // };




// }, []);

    const [intervals, setIntervals] = useState([]);
    const [filteredWeighs, setFilteredWeighs] = useState([]);
    let currentTotalItemCount = 0;  // Track the current total item count locally


    let lastKnownWeight = null;  // Persist the last known weight across intervals


    useEffect(() => {
        const fetchData = async () => {
            const doorResponse = await fetch('Door1_Status.csv');
            const doorCsvText = await doorResponse.text();

            const weighResponse = await fetch('Total_Weighs.csv');
            const weighCsvText = await weighResponse.text();

            Papa.parse(doorCsvText, {
                header: true,
                complete: (doorResults) => {
                    Papa.parse(weighCsvText, {
                        header: true,
                        complete: (weighResults) => {
                            const doorData = doorResults.data;
                            const tempIntervals = [];
                            let openTime = null;

                            doorData.forEach(item => {
                                if (item.value === 'Door 1 OPEN') {
                                    openTime = new Date(item.created_at);
                                } else if (item.value === 'Door 1 CLOSED' && openTime) {
                                    const endTime = new Date(item.created_at);
                                    endTime.setSeconds(endTime.getSeconds() + 30);  // Extend the close time by 30 seconds
                                    tempIntervals.push({
                                        start: openTime,
                                        end: endTime,
                                        weights: [],
                                        donationCount: 0,
                                        itemsRemovedCount: 0,
                                        totalItemCount: currentTotalItemCount
                                    });
                                    openTime = null;
                                }
                            });

                            const weighs = weighResults.data.map(weigh => ({
                                ...weigh,
                                created_at: new Date(weigh.created_at),
                                value: parseFloat(weigh.value)
                            }));

                            tempIntervals.forEach(interval => {
                                let previousWeight = lastKnownWeight;
                                interval.weights = weighs.filter(weigh =>
                                    weigh.created_at >= interval.start && weigh.created_at <= interval.end
                                );
                                interval.weights.forEach(weight => {
                                    if (previousWeight !== null) {
                                        if (weight.value > previousWeight) {
                                            interval.donationCount += 1;
                                            currentTotalItemCount += 1;
                                        } else if (weight.value < previousWeight) {
                                            interval.itemsRemovedCount += 1;
                                            currentTotalItemCount = Math.max(0, currentTotalItemCount - 1);
                                        }
                                    }
                                    previousWeight = weight.value;
                                });
                                interval.totalItemCount = currentTotalItemCount;  // Update the total item count at the end of this interval
                                lastKnownWeight = previousWeight;
                            });

                            setIntervals(tempIntervals);  // Update intervals state with all calculated data
                        
                        }
                    });
                }
            });
        };

        fetchData();
    }, []);

    const formatDateTime = (date) => {
        return date.toLocaleString('en-US', {
            timeZone: 'America/Los_Angeles',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            second: '2-digit'
        }); // Format: 'mm/dd/yyyy, hh:mm:ss'
    };

    const stockLevelText = (count) => {
        if (count < 10) {
            return { text: "Low Stock", color: "red.500" };
        } else if (count >= 10 && count < 20) {
            return { text: "Medium Stock", color: "orange.500" };
        } else {
            return { text: "Full Stock", color: "green.500" };
        }
    };
 
  
  return (
    <Box px="8" py="4"  maxW="1600px" mx="auto" bg="background">
      <VStack spacing="4" align="start">

        <Text fontSize="2xl" fontWeight="bold">
          GIX Pantry's Dashboard
        </Text>
        <Flex direction={"row"} gap="4" w="50%">
            <VStack flex="2" background="white" borderWidth={"1px"} borderColor="grey.500" borderRadius="3xl" px="4" py="4" gap="1" align="start">
                <Text fontSize="sm" >Current Stock</Text>
                <Flex direction="row" align={"end"} gap="2"> <Text fontSize="3xl" fontWeight="bold" lineHeight="1">{intervals[intervals.length - 1]?.totalItemCount}</Text> items</Flex>
                <Text fontSize="sm" color={stockLevelText(intervals[intervals.length - 1]?.totalItemCount).color}>{stockLevelText(intervals[intervals.length - 1]?.totalItemCount).text}</Text>
            </VStack>
            <VStack flex="2" background="white" borderWidth={"1px"} borderColor="grey.500" borderRadius="3xl" px="4" py="4" gap="1" align="start">
                <Text fontSize="sm" >Current Stock</Text>
                <Flex direction="row" align={"end"} gap="2"> <Text fontSize="3xl" fontWeight="bold" lineHeight="1">{intervals[intervals.length - 1]?.totalItemCount}</Text> items</Flex>
                <Text fontSize="sm" color={stockLevelText(intervals[intervals.length - 1]?.totalItemCount).color}>{stockLevelText(intervals[intervals.length - 1]?.totalItemCount).text}</Text>
            </VStack>
        </Flex>

        {/* <Text> latest weight data: {weightData[0]?.value} ({format (new Date(weightData[0].created_at), 'yyyy-MM-dd HH:mm')})</Text>
        <Text> latest temperature data: {temperatureData[0]?.value} ({temperatureData[0].created_at})°C </Text>
        <Text> latest door1 data: {door1Data[0]?.value}</Text>
        <Text> latest door2 data: {door2Data[0]?.value}</Text> */}

        <VStack spacing="2" background="white" borderWidth={"1px"} borderColor="grey.500" borderRadius="3xl" px="4" py="4" gap="2" align="start" h="900px" overflowY="auto" >
            <Text fontSize="lg" fontWeight="bold"> Visitor Activity Log</Text>
            {intervals.map((interval, index) => (
                <HStack key={index} justify="space-between" w="100%">
                    {/* <p><strong>Door Open Time:</strong> {formatDateTime(interval.start)}</p>
                    <p><strong>Door Close Time (plus 30s):</strong> {formatDateTime(interval.end)}</p>
                    <p><strong>Weight Data:</strong></p>
                    <ul>
                        {interval.weights.map((weight, idx) => (
                            <li key={idx}>{weight.value} at {formatDateTime(weight.created_at)}</li>
                        ))}
                    </ul>
                    <p><strong>Donation Count:</strong> {interval.donationCount}</p>
                    <p><strong>Items Removed Count:</strong> {interval.itemsRemovedCount}</p>
                    <p><strong>Total Item Count:</strong> {interval.totalItemCount}</p>
                    {interval.weights.length === 0 && <p>No weight data available for this interval.</p>} */}
                    <Text fontSize={"sm"}  color="text.500">{formatDateTime(interval.end)}</Text>
                    <Text fontSize={"sm"}  color="text.400">{interval.donationCount} donations, {interval.itemsRemovedCount} retrivals, {interval.totalItemCount} items left</Text>
                </HStack>
            ))}
        </VStack>


      </VStack>

    </Box>
  );
};

export default Dashboard;


