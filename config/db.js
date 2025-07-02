const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGODB_URI = 'mongodb+srv://signpdf:before@cluster0.ub6ipqr.mongodb.net/signature-app?retryWrites=true&w=majority&appName=Cluster0';
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 