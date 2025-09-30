# JT Dashboard

A dashboard application with a Svelte frontend and FastAPI backend.

## Project Structure

- **Frontend**: Svelte with TypeScript and Vite
- **Backend**: FastAPI with Python
- **Components**: Home, Mental Model, Sunburst, and Linking views

## Getting Started

### Prerequisites

- Node.js (for the frontend)
- Python 3.8+ (for the backend)

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI server:
   ```bash
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at:
- **API**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

### Development

To run both frontend and backend simultaneously:

1. In one terminal, start the backend:
   ```bash
   cd server
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

2. In another terminal, start the frontend:
   ```bash
   npm run dev
   ```

The frontend is configured to work with the backend API, and CORS is enabled for all origins during development.