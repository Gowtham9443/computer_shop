const mongoose = require('mongoose');

// Every time a customer submits the "Book an Engineer" / booking modal on the
// public site, a record is saved here so the admin panel can track and manage
// service requests (in addition to the WhatsApp message that is also sent).
const ServiceRequestSchema = new mongoose.Schema(
  {
    service: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    deviceBrand: { type: String, trim: true, default: 'Not specified' },
    urgency: { type: String, trim: true, default: 'Normal (2-3 Days)' },
    issue: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'NEW',
    },
    notes: { type: String, trim: true, default: '' }, // internal admin notes
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
