const mongoose = require('mongoose');

const officerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  department: String,
  designation: String,
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    default: "officer123"
  },
  role: {
    type: String,
    enum: ["officer", "admin"],
    default: "officer"
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Officer', officerSchema);
