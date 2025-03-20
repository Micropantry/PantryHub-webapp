# Pantry Hub

Pantry Hub is a web application designed to help users locate and monitor community pantries. The application provides real-time tracking of pantry conditions, inventory management, and an interactive map interface for easy pantry location.

## Features

### For Users
- **Find Nearby Pantries**: Interactive map with search functionality
- **Real-time Status**: Check current inventory levels and pantry conditions
- **Location Details**: View pantry addresses, inventory, and wishlist items

### For Pantry Managers
- **Inventory Management**: Update and track pantry stock levels
- **Activity Monitoring**: View visitor patterns and usage statistics
- **Environmental Tracking**: Monitor temperature and humidity conditions
- **Wishlist Management**: Maintain list of needed items

## Getting Started

### Prerequisites
- Node.js (>= 14.x)
- npm (Node Package Manager)
- Google Maps API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/Micropantry/PantryHub-webapp.git
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory
```bash
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

REACT_APP_AIO_KEY=your_adafruit_IO_key

REACT_APP_FIREBASE_API_KEY=your_firebase_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

4. Start the development server
```bash
npm start
```

## Project Structure

```
src/
├── pages/
│   ├── Map.js           # Main map interface
│   ├── Dashboard.js     # Monitoring dashboard
│   ├── UpdatePantry.js  # Inventory management
│   ├── About.js         # About page
│   └── Home.js          # Landing page
├── components/
│   ├── Navbar.js        # Navigation bar
│   └── Footer.js        # Footer component
└── icons/               # SVG icons and markers
```

## Pages Overview

### Map (Map.js)
<!-- - Interactive Google Maps interface
- Location search with Places API -->
- Responsive sidebar/bottom sheet design
- Features:
  <!-- - Address-based pantry search -->
  - Distance-based sorting
  - Pantry details view
  - Current inventory display

### Dashboard (Dashboard.js)
- Monitoring interface for pantry conditions
- Responsive card layout
- Features:
  - Temperature/humidity tracking
  - Visitor activity chart
  - Current inventory status
  - Latest update messages
  - Pantry wishlist

### Update Pantry (UpdatePantry.js)
- Interface for general pantry updates
- Features:
  - Add new items to the pantry wishlist
  - Update the pantry inventory

## Technical Details

### Built With
- React.js - Frontend framework
- Chakra UI - Component library
- Chart.js - Data visualization
- Google Maps API - Location services
- Firebase - Backend services

### API Integration

#### Google Maps
Required APIs:
- Maps JavaScript API
- Places API
- Geocoding API

#### Firebase
Used for:
- Real-time data storage


## Future Enhancements

- [ ] Sign up/sign in
- [ ] Register as a pantry host and add/claim a pantry
- [ ] Register as a local business partner
- [ ] Address-based pantry search
- [ ] "Leave a messages" feature in the pantry info page 
- [ ] Report issues to the pantry host
- [ ] Community messaging
- [ ] Advanced analytics
- [ ] Mobile/email notifications

## Resources

- [React Documentation](https://reactjs.org/)
- [Chakra UI](https://chakra-ui.com/)
- [Google Maps Platform](https://developers.google.com/maps)
- [Firebase Documentation](https://firebase.google.com/docs)
