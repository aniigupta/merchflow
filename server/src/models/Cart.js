import mongoose from 'mongoose';
import { PRINT_LOCATIONS } from '../config/constants.js';

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    size: {
      type: String,
      required: [true, 'Size specification is required'],
    },
    color: {
      type: String,
      required: [true, 'Color specification is required'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    printLocation: {
      type: String,
      enum: PRINT_LOCATIONS,
      required: [true, 'Print location is required'],
    },
    designImage: {
      type: String, // uploaded artwork static URL
      default: '',
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price at the time of adding is required'],
      min: [0, 'Unit price cannot be negative'],
    },
  },
  { _id: true, timestamps: false }
);

// Virtual: line total
cartItemSchema.virtual('lineTotal').get(function () {
  return +(this.unitPrice * this.quantity).toFixed(2);
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
