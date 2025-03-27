# F1 Data Visualizer - Frontend

This is the frontend application for the F1 Data Visualizer project. It provides a user interface for visualizing Formula 1 racing data fetched from the Ergast API through our backend server.

## Technologies Used

- React 19 - UI library
- TypeScript - Type-safe JavaScript
- Vite - Build tool and development server
- Tailwind CSS - Utility-first CSS framework
- Recharts - Charting library for data visualization
- Axios - HTTP client for API requests

## Prerequisites

- Node.js (v14 or higher recommended)
- npm (Node Package Manager)
- Backend server running (see backend README.md)

## Installation

1. Navigate to the frontend directory:

   ```bash
   cd f1-data-viz/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Development Server

Start the development server with:

```bash
npm run dev
```

This will start the Vite development server, typically on http://localhost:5173. The page will automatically reload when you make changes to the code.

Note: The backend server should be running at http://localhost:5001 for API requests to work properly.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview the production build locally

## Project Structure

- `src/` - Source code
  - `assets/` - Static assets like images
  - `components/` - Reusable React components
  - `services/` - API services and data fetching logic
  - `App.tsx` - Main application component
  - `index.css` - Global styles with Tailwind directives
  - `main.tsx` - Application entry point

## Features

- Responsive layout with Tailwind CSS
- Data visualization of F1 driver standings
- API integration with the backend server
- Real-time data fetching from Ergast F1 API

## Development

To extend this frontend:

1. Add new components in the `src/components` directory
2. Create additional API services in `src/services`
3. Update the main App component or create new pages as needed
4. Install additional dependencies as required

## Connecting to the Backend

The frontend is configured to connect to the backend server at `http://localhost:5001/api`. If your backend is running on a different URL, update the `baseURL` in `src/services/api.ts`.
