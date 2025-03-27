# F1 Data Visualization API

A backend API for F1 data visualization, built with Express.js. This API serves as a proxy to the Ergast F1 API, providing formatted data for the frontend application.

## Features

- Driver Standings by Season
- Race Schedules by Season
- Race Results by Season and Round
- In-memory Caching with Expiration
- Error Handling and Response Formatting
- API Documentation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd f1-data-viz/backend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The server will start on port 5001 by default (http://localhost:5001).

## API Endpoints

All endpoints are prefixed with `/api`.

### Driver Standings

- **GET `/api/standings/:year`** - Get driver standings for a specific year
  - Parameters:
    - `year` - Year between 1950 and current year
  - Example: `GET /api/standings/2023`

### Race Schedule

- **GET `/api/schedule/:year`** - Get race schedule for a specific year
  - Parameters:
    - `year` - Year between 1950 and current year
  - Example: `GET /api/schedule/2023`

### Race Results

- **GET `/api/results/:year/:round`** - Get race results for a specific year and round
  - Parameters:
    - `year` - Year between 1950 and current year
    - `round` - Round number between 1 and 30
  - Example: `GET /api/results/2023/1`

### Cache Management

- **GET `/api/cache/stats`** - Get cache statistics (total, active, expired items)
- **POST `/api/cache/clear`** - Clear the entire cache

## Caching

The API implements in-memory caching to reduce redundant calls to the Ergast API:

- **Cache Duration**: 10 minutes (configurable)
- **Cache Key**: Based on the API endpoint parameters
- **Automatic Cleanup**: Expired cache entries are automatically cleaned every 15 minutes
- **Cache Information**: All API responses include a `cached` flag indicating whether the data came from cache

Example response with cache information:

```json
{
  "success": true,
  "data": {
    "season": "2023",
    "standings": [...],
    "cached": true
  }
}
```

## Project Structure

```
backend/
├── src/
│   ├── middleware/
│   │   ├── errorHandler.js      # Error handling middleware
│   │   └── responseFormatter.js # Response formatting middleware
│   ├── routes/
│   │   ├── index.js             # Main router
│   │   ├── standings.js         # Standings routes
│   │   ├── schedule.js          # Schedule routes
│   │   ├── results.js           # Results routes
│   │   └── cache.js             # Cache management routes
│   └── utils/
│       ├── ergastApi.js         # Ergast API utilities
│       └── cacheManager.js      # In-memory cache utilities
├── .gitignore
├── package.json
├── README.md
└── server.js                   # Main application entry point
```

## Development

### Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot-reloading
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm test` - Run tests

## Error Handling

The API includes centralized error handling that returns formatted JSON error responses. All API responses include a `success` boolean field and either a `data` object (for successful responses) or an `error` object (for error responses).

## Data Sources

This API uses the [Ergast F1 API](http://ergast.com/mrd/) as its data source.

## License

This project is licensed under the ISC License.
