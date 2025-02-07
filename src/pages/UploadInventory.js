// import React, { useState } from 'react';
// import { Box, VStack, Text, Button, Input } from '@chakra-ui/react';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import modular functions
// import { storage } from '../firebaseConfig'; // Ensure this path is correct


// import { format } from 'date-fns';


// const GIXPantry = () => {
//   const [image, setImage] = useState(null);
//   const [url, setUrl] = useState("");

//   const handleChange = (e) => {
//     if (e.target.files[0]) {
//       setImage(e.target.files[0]);
//     }
//   };

//   const handleUpload = () => {
//     if (!image) {
//       alert("Please select an image first!");
//       return;
//     }
    
//     const storageRef = ref(storage, `1iRz80rI3ruAGtk6CPQU/inventory`);
//     uploadBytes(storageRef, image).then((snapshot) => {
//       getDownloadURL(snapshot.ref).then((downloadURL) => {
//         setUrl(downloadURL);
//         console.log("File available at", downloadURL);
//       }).catch(error => {
//         console.error('Error getting download URL:', error);
//       });
//     }).catch(error => {
//       console.error('Upload error:', error);
//     });
//   };
  
//   return (
//     <Box px="8" py="4"  maxW="1600px" mx="auto">
//       <VStack spacing="4" align="start">
//         <Text fontSize="2xl" fontWeight="bold">
//           GIX Pantry
//         </Text>
//         <div>
//           <Input type="file" onChange={handleChange} />
//           <Button onClick={handleUpload} colorScheme="blue">Upload Image</Button>
//           {url && <img src={url} alt="Uploaded" style={{ marginTop: "20px", maxWidth: "100%" }} />}
//         </div>
//       </VStack>

//     </Box>
//   );
// };

// export default GIXPantry;



import React, { useState } from 'react';
import { Box, VStack, Text, Button, Input, Textarea } from '@chakra-ui/react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../firebaseConfig'; // Ensure these imports are correct

const pantryID = "1iRz80rI3ruAGtk6CPQU"; // Example pantry ID

const UploadInventory = () => {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");


  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!image) {
      alert("Please select an image first!");
      return;
    }

    const storageRef = ref(storage, `/${pantryID}/inventoryImg`);
    uploadBytes(storageRef, image).then(snapshot => {
      getDownloadURL(snapshot.ref).then(downloadURL => {
        const locationRef = doc(db, "locations", pantryID); // Reference to your specific document

        // ✅ Create Firestore update object
        const updateData = {
          inventoryImage: {
            imageURL: downloadURL,
            time: serverTimestamp(), // Always store timestamp
          }
        };

        // ✅ Only add message if it is not empty
        if (message.trim()) {
          updateData.inventoryImage.message = message.trim();
        }

        // ✅ Update Firestore document with conditionally added message
        setDoc(locationRef, updateData, { merge: true })
        .then(() => {
          setUploadStatus(`Uploaded successfully at ${new Date().toLocaleTimeString()}`);

          setImage(null); // Clear the image state after upload
          setMessage(""); // Clear the message state after upload

          console.log(image);
          console.log(message);

          // ✅ Clear file input field
          document.getElementById("fileInput").value = "";

        }).catch(error => {
          setUploadStatus("Error storing image data.");
          console.error("Error storing image URL in Firestore:", error);
        });
      });
    }).catch(error => {
      console.error("Upload error:", error);
      setUploadStatus("Failed to upload image.");
    });
  };

  return (
    
    <Box px="8" py="4" maxW="1600px" mx="auto">
      <VStack spacing="4" align="start">
        <Text fontSize="2xl" fontWeight="bold">GIX Pantry</Text>

        {/* Input for Uploading Image */}
        <Text>Select an image:</Text>
        <Input id="fileInput" type="file" accept="image/*" onChange={handleChange} />

        {/* Input for Description */}
        <Text>Enter a description:</Text>
        <Textarea 
          placeholder="Add a short description of what you donated or took..." 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
        />

        {/* Upload Button */}
        <Button onClick={handleUpload} colorScheme="blue">Upload</Button>
        
        {/* Upload Status */}
        <Text>{uploadStatus}</Text>
      </VStack>
    </Box>
  );
};

export default UploadInventory;
