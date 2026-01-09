const dotenv = require('dotenv');
const http = require('http'); 
const connectDB = require('./src/config/db.js'); 

// Load environment variables before requiring the app so they are available during app initialization
dotenv.config();

const app = require('./src/app.js'); 

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB(process.env.MONGO_URI);

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`API server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
