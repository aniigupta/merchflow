import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Successful', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    paymentDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index({ order: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
