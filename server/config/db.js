const mongoose = require('mongoose');
let MongoMemoryServer;
try {
  MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
} catch (e) {
  // Graceful handling if not installed
}

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Atlas Connection Error: ${error.message}`);
    
    if (MongoMemoryServer) {
      console.log('Falling back to local in-memory database so you can continue testing...');
      try {
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log('✅ Local MongoDB Memory Server Connected! You can now register and login.');
      } catch (fallbackError) {
        console.error('Local DB fallback also failed:', fallbackError.message);
      }
    } else {
      console.error('Please whitelist your IP address in MongoDB Atlas.');
    }
  }
};

module.exports = connectDB; 