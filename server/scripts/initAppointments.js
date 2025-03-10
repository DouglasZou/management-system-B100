require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Use the direct connection string instead of importing from config
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/Salon-management';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB Connected...');
  
  // Create the appointments collection if it doesn't exist
  mongoose.connection.db.listCollections({name: 'appointments'})
    .next((err, collinfo) => {
      if (err) {
        console.error('Error checking collections:', err);
        mongoose.connection.close();
        return;
      }
      
      if (!collinfo) {
        mongoose.connection.db.createCollection('appointments', (err, res) => {
          if (err) {
            console.error('Error creating collection:', err);
          } else {
            console.log("Appointments collection created!");
          }
          mongoose.connection.close();
        });
      } else {
        console.log("Appointments collection already exists");
        mongoose.connection.close();
      }
    });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}); 