const mongoose = require('mongoose');

// "type" here is the product category (Computers, Laptops, Printers, CCTV Cameras, ...).
// It is a free-text field (not a hard enum) so the admin panel can introduce new
// product types at any time without a code change - this is the "update type / change type"
// function requested for the admin panel.
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true, index: true }, // e.g. Computers, Laptops, Printers, CCTV Cameras
    brand: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0, default: null },
    icon: { type: String, trim: true, default: 'fa-solid fa-box' }, // FontAwesome class shown as product image
    imageUrl: { type: String, trim: true, default: '' }, // optional real image, overrides icon on the site
    stockStatus: {
      type: String,
      enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'],
      default: 'IN_STOCK',
    },
    quantity: { type: Number, min: 0, default: 0 },
    featured: { type: Boolean, default: true }, // shown on the public Sales section
    isActive: { type: Boolean, default: true }, // soft delete / hide from storefront
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
