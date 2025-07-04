# Frontend Setup Instructions
## 1. Prerequisites
- Node.js and npm installed

## 2. Install Dependencies
Open a terminal in the project root and run:
```
npm install --prefix frontend
```

## 3. Start the Frontend Development Server
```
npm start --prefix frontend
```
This will start the React app on [http://localhost:3000](http://localhost:3000) by default.

## 4. API Configuration
- The frontend expects the backend API to be running (see backend instructions).
- If you need to change the backend API URL, update the relevant code in `frontend/src/api.js` or wherever the API base URL is set.

## 5. Build for Production
To build the app for production, run:
```
npm run build --prefix frontend
```
The production-ready files will be in the `frontend/build` directory. 
