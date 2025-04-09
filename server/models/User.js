const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  role: {
    type: String,
    enum: ['admin', 'beautician'],
    default: 'beautician'
  },
  phone: {
    type: String,
    trim: true
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  availability: {
    monday: [{ start: String, end: String }],
    tuesday: [{ start: String, end: String }],
    wednesday: [{ start: String, end: String }],
    thursday: [{ start: String, end: String }],
    friday: [{ start: String, end: String }],
    saturday: [{ start: String, end: String }],
    sunday: [{ start: String, end: String }]
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    console.log('Hashing password for user:', this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Add a method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Update the pre-remove middleware to include appointment deletion
userSchema.pre('remove', async function(next) {
  try {
    const userId = this._id;
    
    // Delete associated blockouts and appointments if user is a beautician
    if (this.role === 'beautician') {
      // Delete blockouts
      const StaffBlockout = require('./StaffBlockout');
      await StaffBlockout.deleteMany({ beautician: userId });
      console.log(`Deleted blockouts for beautician ${userId}`);
      
      // Delete appointments
      const Appointment = require('./Appointment');
      await Appointment.deleteMany({ beautician: userId });
      console.log(`Deleted appointments for beautician ${userId}`);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Update the pre-findOneAndDelete middleware
userSchema.pre('findOneAndDelete', async function(next) {
  try {
    const doc = await this.model.findOne(this.getFilter());
    if (doc && doc.role === 'beautician') {
      // Delete blockouts
      const StaffBlockout = require('./StaffBlockout');
      await StaffBlockout.deleteMany({ beautician: doc._id });
      console.log(`Deleted blockouts for beautician ${doc._id}`);
      
      // Delete appointments
      const Appointment = require('./Appointment');
      await Appointment.deleteMany({ beautician: doc._id });
      console.log(`Deleted appointments for beautician ${doc._id}`);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Update the pre-findOneAndRemove middleware
userSchema.pre('findOneAndRemove', async function(next) {
  try {
    const doc = await this.model.findOne(this.getFilter());
    if (doc && doc.role === 'beautician') {
      // Delete blockouts
      const StaffBlockout = require('./StaffBlockout');
      await StaffBlockout.deleteMany({ beautician: doc._id });
      console.log(`Deleted blockouts for beautician ${doc._id}`);
      
      // Delete appointments
      const Appointment = require('./Appointment');
      await Appointment.deleteMany({ beautician: doc._id });
      console.log(`Deleted appointments for beautician ${doc._id}`);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Check if model already exists to prevent the OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User; 