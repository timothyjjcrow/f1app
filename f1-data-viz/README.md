# F1 Data Visualizer

A modern web application for visualizing Formula 1 racing data, featuring driver standings, race results, and interactive data visualizations. Built with React and Node.js, consuming data from the Ergast F1 API.

<!-- Add a screenshot of your application here:
![F1 Data Visualizer Screenshot](./screenshot.png)
-->

## Features

- **Driver Standings Visualization**

  - Tabular view of current driver standings
  - Interactive bar chart visualization
  - Historical data access from 1950 to present
  - Toggle between table and chart views

- **Race Results Explorer**

  - Detailed race results for each Grand Prix
  - Season and race selection
  - Performance comparison between drivers
  - Position changes from qualifying highlighted

- **Interactive UI Components**

  - Season selector for historical data
  - Race selector for specific Grand Prix results
  - Data refresh functionality
  - Responsive design for all device sizes

- **Performance Optimizations**
  - API response caching
  - Error boundaries for fault tolerance
  - Optimized data loading states

## Project Architecture

The application follows a modern client-server architecture:

```
f1-data-viz/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── contexts/    # React context providers
│   │   ├── services/    # API client and data fetching
│   │   └── assets/      # Static assets
│   └── ...
├── backend/           # Express.js backend application
│   ├── src/
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API route handlers
│   │   └── utils/       # Utility functions and helpers
│   └── ...
└── README.md          # Project documentation
```

### Frontend Architecture

- **Context API** for global state management
- **Component-based** architecture with reusable UI elements
- **Error Boundaries** for graceful error handling
- **Responsive design** using Tailwind CSS
- **Data visualization** with Recharts

### Backend Architecture

- **Express.js** for RESTful API endpoints
- **Route-based** organization of API handlers
- **Middleware pattern** for cross-cutting concerns
- **In-memory caching** for performance optimization
- **Proxy/adapter pattern** for Ergast API integration

## Tech Stack

### Frontend

- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Composable charting library
- **Vite** - Frontend build tool and dev server

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Axios** - HTTP client for API requests
- **CORS** - Cross-Origin Resource Sharing support

### Development Tools

- **ESLint** - Code linting
- **Jest** - Testing framework
- **Nodemon** - Development server auto-restart

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/f1-data-viz.git
   cd f1-data-viz
   ```

2. Install dependencies:

   **Option 1: Using root-level scripts (recommended)**

   ```bash
   # Install dependencies for both frontend and backend
   npm run install:all

   # Or install them separately
   npm run install:backend
   npm run install:frontend
   ```

   **Option 2: Manual installation**

   ```bash
   # Install backend dependencies
   cd backend
   npm install
   cd ..

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

### Running the Application

#### Option 1: Using root-level scripts (recommended)

```bash
# Run both frontend and backend concurrently
npm start

# Or run them separately
npm run start:frontend
npm run start:backend
```

#### Option 2: Running manually in separate terminals

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend:**

```bash
cd frontend
npm run dev
```

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## API Endpoints

| Endpoint                        | Description                                    |
| ------------------------------- | ---------------------------------------------- |
| `GET /api/standings/:year`      | Get driver standings for a specific year       |
| `GET /api/schedule/:year`       | Get race schedule for a specific year          |
| `GET /api/results/:year/:round` | Get race results for a specific year and round |

## Error Handling

The application includes comprehensive error handling:

### Backend Error Handling

- **Centralized Error Middleware**: All API endpoints use a centralized error handling middleware
- **Standardized Error Responses**: Consistent format for all error responses
- **Input Validation**: Request parameters are validated before processing
- **API Error Handling**: Errors from the Ergast API are properly caught and formatted

### Frontend Error Handling

- **React Error Boundaries**: Strategically placed error boundaries to isolate errors:
  - Application-level error boundary
  - Context provider error boundary
  - Component-level error boundaries for each major UI section
  - Visualization-specific error boundaries
- **Graceful Degradation**: Components fail independently without crashing the entire application
- **User-Friendly Error Messages**: Contextual error messages that explain the issue
- **Recovery Options**: "Try Again" buttons to allow users to recover from errors
- **Loading States**: Clear loading indicators during data fetching operations

### Development Tools

- **Error Simulation**: Test components are available to trigger errors for testing error boundaries
- **Error Logging**: Comprehensive error logging for debugging purposes
- **Error Reporting**: Configurable error reporting callbacks

## Future Enhancements

- Constructor standings visualization
- Circuit information and track maps
- Historical statistics comparison
- User authentication for saved preferences
- Lap time analysis and comparison
- PWA support for offline capability

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## Acknowledgements

- [Ergast F1 API](http://ergast.com/mrd/) for providing the Formula 1 data
- [Formula 1](https://www.formula1.com/) for the inspiration

## Performance Optimizations

### Backend Caching

- **In-Memory Cache**: Reduces redundant external API calls to the Ergast F1 API
- **Time-Based Expiration**: Cache entries automatically expire after 10 minutes
- **Cache Management API**: Endpoints to view cache statistics and clear the cache
- **Automatic Cleanup**: Background process removes expired cache entries every 15 minutes
- **Response Flagging**: API responses include a `cached` flag indicating whether data came from cache

### Frontend Optimizations

- **Conditional Rendering**: Components only render when necessary
- **Memoization**: Expensive calculations are memoized to prevent redundant processing
- **Code Splitting**: Future implementation will include code splitting for optimized loading
- **Responsive Design**: UI adapts to different screen sizes for optimal user experience
