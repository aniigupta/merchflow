import mongoose from 'mongoose';

const shippingSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
    },
    courierName: {
      type: String,
      required: [true, 'Courier name is required'],
    },
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
    },
    shipmentId: {
      type: String,
      required: true,
      unique: true,
    },
    estimatedDeliveryDate: {
      type: Date,
      required: true,
    },
    shippingStatus: {
      type: String,
      enum: ['Packed', 'Shipment Created', 'Shipped', 'Out for Delivery', 'Delivered'],
      default: 'Shipment Created',
    },
  },
  { timestamps: true }
);

// Indexes
shippingSchema.index({ order: 1 });
shippingSchema.index({ trackingNumber: 1 });

const Shipping = mongoose.model('Shipping', shippingSchema);
export default Shipping;
