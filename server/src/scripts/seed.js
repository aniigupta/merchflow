import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Shipping from '../models/Shipping.js';

// Resolve directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/merch_ecom';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    // ── 1. Clear Database Collections ─────────────────────────────
    console.log('Clearing old database records (Users, Categories, Products, Orders, Payments, Shippings)...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await Shipping.deleteMany({});
    console.log('✅ Collections cleared.');

    // ── 2. Seed Users (Admin & 3 Customers) ────────────────────────
    console.log('Seeding users...');
    
    // Hash is handled automatically by the userSchema.pre('save') hook
    const adminUser = await User.create({
      name: 'MerchFlow Admin',
      email: 'admin@demo.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+919999999999',
    });

    const customersData = [
      {
        name: 'Alex Johnson',
        email: 'customer1@demo.com',
        password: 'Customer@123',
        role: 'customer',
        phone: '+919876543210',
        addresses: [
          {
            fullName: 'Alex Johnson',
            phone: '+919876543210',
            line1: '102, Blue Wave Apartments',
            line2: 'Carter Road, Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400050',
            country: 'India',
            isDefault: true,
          }
        ]
      },
      {
        name: 'Sarah Connor',
        email: 'customer2@demo.com',
        password: 'Customer@123',
        role: 'customer',
        phone: '+918765432109',
        addresses: [
          {
            fullName: 'Sarah Connor',
            phone: '+918765432109',
            line1: '405, Cyber Towers',
            line2: 'Madhapur',
            city: 'Hyderabad',
            state: 'Telangana',
            postalCode: '500081',
            country: 'India',
            isDefault: true,
          }
        ]
      },
      {
        name: 'Bruce Wayne',
        email: 'customer3@demo.com',
        password: 'Customer@123',
        role: 'customer',
        phone: '+917654321098',
        addresses: [
          {
            fullName: 'Bruce Wayne',
            phone: '+917654321098',
            line1: 'Wayne Manor',
            line2: 'Palace Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560001',
            country: 'India',
            isDefault: true,
          }
        ]
      }
    ];

    const seededCustomers = await User.create(customersData);
    console.log(`✅ Seeded ${seededCustomers.length} customers and 1 admin.`);

    // ── 3. Seed Categories ─────────────────────────────────────────
    console.log('Seeding categories...');
    const categoriesData = [
      { name: 'T-Shirts', description: 'Premium custom printed and embroidered tees' },
      { name: 'Hoodies', description: 'Cozy and heavy fleece winter wear merchandise' },
      { name: 'Caps', description: 'Stylish baseball caps and snapbacks' },
      { name: 'Mugs', description: 'Durable ceramic mugs for sublimation prints' },
      { name: 'Bottles', description: 'Insulated stainless steel water bottles' },
      { name: 'Tote Bags', description: 'Eco-friendly canvas bags for daily use' },
      { name: 'Stickers', description: 'Waterproof die-cut vinyl stickers' }
    ];

    const seededCategories = await Category.create(categoriesData);
    console.log(`✅ Seeded ${seededCategories.length} categories.`);

    const catMap = {};
    seededCategories.forEach(cat => {
      catMap[cat.name] = cat._id;
    });

    // ── 4. Seed Products (at least 3-4 per category, ~22 total) ──────
    console.log('Seeding products...');
    const productsData = [
      // 1. T-Shirts
      {
        name: 'Premium Cotton Custom Tee',
        description: 'A heavyweight 100% combed cotton crewneck t-shirt perfect for custom DTF transfers. Preshrunk fabric, double-needle stitched sleeves.',
        category: catMap['T-Shirts'],
        price: 599,
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        availableColors: [
          { name: 'Pitch Black', hex: '#1E293B' },
          { name: 'Classic White', hex: '#F8FAFC' },
          { name: 'Navy Blue', hex: '#1E3A8A' }
        ],
        stockQuantity: 120,
        sku: 'TSH-PREM-001',
        printTypes: ['DTF Printing', 'Screen Printing'],
        images: [{ url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800', alt: 'Premium Tee', isPrimary: true }],
        isActive: true,
        isFeatured: true,
        tags: ['cotton', 'unisex', 'tshirt']
      },
      {
        name: 'V-Neck Custom Designer Tee',
        description: 'Stylish v-neck cotton t-shirt with premium finishing. Fits perfectly and looks great with direct-to-garment or screen prints.',
        category: catMap['T-Shirts'],
        price: 649,
        availableSizes: ['S', 'M', 'L', 'XL'],
        availableColors: [
          { name: 'Crimson Red', hex: '#EF4444' },
          { name: 'Olive Green', hex: '#84CC16' }
        ],
        stockQuantity: 4, // LOW STOCK
        sku: 'TSH-VNECK-002',
        printTypes: ['Screen Printing'],
        images: [{ url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800', alt: 'V-Neck Tee', isPrimary: true }],
        isActive: true,
        isFeatured: false,
        tags: ['cotton', 'v-neck']
      },
      {
        name: 'Tri-Blend Athletic Tee',
        description: 'Ultra-soft tri-blend athletic wear built for sweat-wicking performance and comfortable fit. Designed for sublimation and vinyl transfers.',
        category: catMap['T-Shirts'],
        price: 699,
        availableSizes: ['M', 'L', 'XL'],
        availableColors: [
          { name: 'Heather Grey', hex: '#9CA3AF' },
          { name: 'Ocean Blue', hex: '#3B82F6' }
        ],
        stockQuantity: 95,
        sku: 'TSH-ATHLETIC-003',
        printTypes: ['Sublimation', 'DTF Printing'],
        images: [{ url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800', alt: 'Athletic Tee', isPrimary: true }],
        isActive: true,
        isFeatured: false,
        tags: ['athletic', 'sportswear']
      },

      // 2. Hoodies
      {
        name: 'Cozy Oversized Fleece Hoodie',
        description: 'Super cozy heavy-brushed fleece hoodie. Dual front pockets, heavy-duty drawstring, and double-layered cuffs. Perfect for embroidery.',
        category: catMap['Hoodies'],
        price: 1399,
        availableSizes: ['M', 'L', 'XL', 'XXL'],
        availableColors: [
          { name: 'Midnight Charcoal', hex: '#334155' },
          { name: 'Sand Beige', hex: '#D1FAE5' }
        ],
        stockQuantity: 65,
        sku: 'HUD-COZY-001',
        printTypes: ['Embroidery', 'DTF Printing'],
        images: [{ url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800', alt: 'Cozy Hoodie', isPrimary: true }],
        isActive: true,
        isFeatured: true,
        tags: ['hoodie', 'winter', 'fleece']
      },
      {
        name: 'Zip-Up Classic Hoodie',
        description: 'Classic fitted full zipper hoodie made from organic cotton blend. Features YKK metal zippers and rib-knit cuffs.',
        category: catMap['Hoodies'],
        price: 1499,
        availableSizes: ['S', 'M', 'L', 'XL'],
        availableColors: [
          { name: 'Forest Green', hex: '#065F46' },
          { name: 'Classic Black', hex: '#0F172A' }
        ],
        stockQuantity: 3, // LOW STOCK
        sku: 'HUD-ZIP-002',
        printTypes: ['Screen Printing', 'Embroidery'],
        images: [{ url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800', alt: 'Zip Hoodie', isPrimary: true }],
        isActive: true,
        isFeatured: false,
        tags: ['hoodie', 'zip-up']
      },
      {
        name: 'Streetwear Graphic Hoodie',
        description: 'Relaxed drop-shoulder streetwear hoodie optimized for large screen prints or premium DTF graphics.',
        category: catMap['Hoodies'],
        price: 1299,
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        availableColors: [
          { name: 'Cyber Purple', hex: '#6D28D9' },
          { name: 'Mustard Yellow', hex: '#D97706' }
        ],
        stockQuantity: 40,
        sku: 'HUD-STREET-003',
        printTypes: ['DTF Printing', 'Screen Printing'],
        images: [{ url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800', alt: 'Streetwear Hoodie', isPrimary: true }],
        isActive: true,
        isFeatured: false,
        tags: ['streetwear', 'fashion']
      },

      // 3. Caps
      {
        name: 'Structured Retro Baseball Cap',
        description: 'Six-panel structured retro baseball cap with antique brass side buckle. High crown and stiff visor, perfect for bold embroidery.',
        category: catMap['Caps'],
        price: 399,
        availableSizes: ['One Size'],
        availableColors: [
          { name: 'Navy Blue', hex: '#1E3A8A' },
          { name: 'Burgundy', hex: '#7F1D1D' }
        ],
        stockQuantity: 150,
        sku: 'CAP-RETRO-001',
        printTypes: ['Embroidery'],
        images: [{ url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800', alt: 'Baseball Cap', isPrimary: true }],
        isActive: true,
        isFeatured: true,
        tags: ['cap', 'accessories']
      },
      {
        name: 'Flat Visor Snapback Cap',
        description: 'Urban flat-brim snapback cap with adjustable plastic snap closure. Features a wool-blend structured front panel.',
        category: catMap['Caps'],
        price: 449,
        availableSizes: ['One Size'],
        availableColors: [
          { name: 'Solid Black', hex: '#000000' },
          { name: 'Black & Grey', hex: '#4B5563' }
        ],
        stockQuantity: 5, // LOW STOCK
        sku: 'CAP-SNAP-002',
        printTypes: ['Embroidery', 'DTF Printing'],
        images: [{ url: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800', alt: 'Snapback Cap', isPrimary: true }],
        isActive: true,
        isFeatured: false,
        tags: ['snapback', 'urban']
      },
      {
        name: 'Outdoor Mesh Trucker Hat',
        description: 'Lightweight and breathable mesh-back trucker cap. Perfect for custom printed heat transfers.',
        category: catMap['Caps'],
        price: 349,
        availableSizes: ['One Size'],
        availableColors: [
          { name: 'Navy & White', hex: '#1D4ED8' },
          { name: 'Forest Mesh', hex: '#1E3F20' }
        ],
        stockQuantity: 80,
        sku: 'CAP-TRUCK-003',
        printTypes: ['Screen Printing', 'DTF Printing'],
        images: [{ url: 'https://images.unsplash.com/photo-1576871337622-98d48d4353d3?w=800', alt: 'Trucker Hat', isPrimary: true }],
        isActive: true,
        isFeatured: false,
        tags: ['trucker', 'outdoor']
      },

      // 4. Mugs
      {
        name: 'Classic White Ceramic Mug',
        description: 'Premium 11oz gloss white ceramic mug coated for vivid full-color dye sublimation. Dishwasher and microwave safe.',
        category: catMap['Mugs'],
        price: 299,
        availableSizes: ['One Size'],
        availableColors: [
          { name: 'Gloss White', hex: '#FFFFFF' }
        ],
        stockQuantity: 200,
        sku: 'MUG-CLASSIC-001',
        printTypes: ['Sublimation'],
        images: [{ url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800', alt: 'Ceramic Mug', isPrimary: true }],
        isActive: true,
        isFeatured: true,
        tags: ['mug', 'ceramic', 'office']
      },
      {
        name: 'Double-Tone Accent Mug',
        description: 'Ceramic mug with colorful handles and interiors. Highlights custom sublimation wrap prints.',
        category: catMap['Mugs'],
        price: 349,
        availableSizes: ['One Size'],
        availableColors: [
          { name: 'White & Red', hex: '#EF4444' },
          { name: 'White & Blue', hex: '#3B82F6' }
        ],
        stockQuantity: 110,
        sku: 'MUG-TONE-002',
        printTypes: ['Sublimation'],
        images: [{ url: 'https://images.unsplash.com/photo-1572119363156-e2140f5cb743?w=800', alt: 'Accent Mug', isPrimary: true }],
        isActive: true,
        isFeatured: false,
        tags: ['mug', 'colorful']
      },
      {
        name: 'Matte Finish Magic Mug',
        description: 'Heat-activated color changing ceramic mug. Reveals custom printed sublimation graphics when filled with hot liquid.',
        category: catMap['Mugs'],
        price: 499,
        availableSizes: ['One Size'],
        availableColors: [
          { name: 'Matte Black', hex: '#1E293B' }
        ],
        stockQuantity: 4, // LOW STOCK
        sku: 'MUG-MAGIC-003',
        printTypes: ['Sublimation'],
        images: [{ url: 'https://images.unsplash.com/photo-1539223470305-cd63673cf861?w=800', alt: 'Magic Mug', isPrimary: true }],
        isActive: true,
        isFeatured: false,
        tags: ['magic-mug', 'heat-sensitive']
      },

      // 5. Bottles
      {
        name: 'Insulated Stainless Steel Bottle',
        description: 'Double-wall vacuum insulated stainless steel water bottle. Keeps drinks cold for 24h or hot for 12h. Perfect for UV printing or laser engraving.',
        category: catMap['Bottles'],
        price: 899,
        availableSizes: ['One Size'],
        availableColors: [
          { name: 'Silver Steel', hex: '#E2E8F0' },
          { name: 'Matte Charcoal', hex: '#475569' }
        ],
        stockQuantity: 75,
        sku: 'BOT-STEEL-001',
        printTypes: ['UV Printing', 'Screen Printing'], // Laser Engraving fits but UV printing is standard print type
        images: [{ url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800', alt: 'Stainless Steel Bottle', isPrimary: true }],
        isActive: true,
        isFeatured: true,
        tags: ['bottle', 'vacuum', 'stainless']
      },
      {
        name: 'Eco Bamboo Flask',
        description: 'Stainless steel tea flask insulated with sustainable natural bamboo shell. Ideal for screen printing and laser branding.',
        category: catMap['Bottles'],
        price: 999,
        availableSizes: ['One Size'],
        availableColors: [
          { name: 'Bamboo Beige', hex: '#F5E0C3' }
        ],
        stockQuantity: 30,
        sku: 'BOT-BAMBOO-002',
        printTypes: ['Screen Printing', 'UV Printing'],
        images: [{ url: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800', alt: 'Bamboo Flask', isPrimary: true }],
        isActive: true,
        isFeatured: false,
        tags: ['eco', 'bamboo', 'flask']
      },
      {
        name: 'Aero Sports Straw Bottle',
        description: 'BPA-free Eastman Tritan sports bottle with straw lid. Impact-resistant and durable. Works best with silk screen printing.',
        category: catMap['Bottles'],
        price: 499,
        availableSizes: ['One Size'],
        availableColors: [
          { name: 'Clear Cyan', hex: '#06B6D4' },
          { name: 'Clear Pink', hex: '#EC4899' }
        ],
        stockQuantity: 2, // LOW STOCK
        sku: 'BOT-AERO-003',
        printTypes: ['Screen Printing'],
        images: [{ url: 'https://images.unsplash.com/photo-1544200175-ca6e80a7b325?w=800', alt: 'Sports Bottle', isPrimary: true }],
        isActive: true,
        isFeatured: false,
        tags: ['sports', 'straw-bottle']
      },

      // 6. Tote Bags
      {
        name: 'Heavyweight Canvas Tote Bag',
        description: 'Thick, heavyweight cotton canvas tote bag. Features a large print area on both front and back, spacious enough for standard laptops.',
        category: catMap['Tote Bags'],
        price: 299,
        availableSizes: ['One Size'],
        availableColors: [
          { name: 'Natural Ecru', hex: '#FEF3C7' },
          { name: 'Ink Black', hex: '#1C1917' }
        ],
        stockQuantity: 180,
        sku: 'BAG-CANVAS-001',
        printTypes: ['Screen Printing', 'DTF Printing'],
        images: [{ url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800', alt: 'Canvas Tote', isPrimary: true }],
        isActive: true,
        isFeatured: true,
        tags: ['tote', 'canvas', 'shopping']
      },
      {
        name: 'Zippered Canvas Tote Bag',
        description: 'Eco-friendly tote bag equipped with top metal zipper and internal pocket. High density fabric allows sharp screen-printed colors.',
        category: catMap['Tote Bags'],
        price: 349,
        availableSizes: ['One Size'],
        availableColors: [
          { name: 'Navy Stripes', hex: '#1E3A8A' }
        ],
        stockQuantity: 85,
        sku: 'BAG-ZIP-002',
        printTypes: ['Screen Printing'],
        images: [{ url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800', alt: 'Zipper Tote', isPrimary: true }],
        isActive: true,
        isFeatured: false,
        tags: ['tote', 'zipper']
      },

      // 7. Stickers
      {
        name: 'Vinyl Die-Cut Sticker Pack',
        description: 'Waterproof and weather-resistant vinyl stickers with matte laminate coat. Pack of 5 unique developer-themed designs.',
        category: catMap['Stickers'],
        price: 149,
        availableSizes: ['One Size'],
        availableColors: [
          { name: 'Multi-color Pack', hex: '#FDBA74' }
        ],
        stockQuantity: 500,
        sku: 'STK-DEV-001',
        printTypes: ['UV Printing'],
        images: [{ url: 'https://images.unsplash.com/photo-1589384267710-7a259678a59a?w=800', alt: 'Sticker Pack', isPrimary: true }],
        isActive: true,
        isFeatured: true,
        tags: ['stickers', 'vinyl', 'developers']
      },
      {
        name: 'Holographic Glitter Stickers',
        description: 'Shimmering rainbow holographic sticker film. Perfect for laptops and water bottles.',
        category: catMap['Stickers'],
        price: 199,
        availableSizes: ['One Size'],
        availableColors: [
          { name: 'Holo Rainbow', hex: '#F472B6' }
        ],
        stockQuantity: 120,
        sku: 'STK-HOLO-002',
        printTypes: ['UV Printing'],
        images: [{ url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800', alt: 'Glitter Stickers', isPrimary: true }],
        isActive: true,
        isFeatured: false,
        tags: ['stickers', 'holographic']
      }
    ];

    const seededProducts = await Product.create(productsData);
    console.log(`✅ Seeded ${seededProducts.length} custom products.`);

    const prodMap = {};
    seededProducts.forEach(prod => {
      prodMap[prod.sku] = prod;
    });

    // ── 5. Seed Orders, Payments & Shipments (~13 Orders) ──────────
    console.log('Seeding orders, payments, and shipments...');

    const c1 = seededCustomers[0]._id;
    const c2 = seededCustomers[1]._id;
    const c3 = seededCustomers[2]._id;

    // Time generation helper
    const getPastDate = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d;
    };

    const ordersToSeed = [
      // --- ORDER PLACED STAGE (NO SUCCESSFUL PAYMENT) ---
      {
        user: c1,
        items: [
          {
            product: prodMap['TSH-PREM-001']._id,
            name: prodMap['TSH-PREM-001'].name,
            sku: prodMap['TSH-PREM-001'].sku,
            size: 'M',
            color: 'Pitch Black',
            quantity: 2,
            printLocation: 'front',
            designImage: 'https://picsum.photos/300/300?random=1',
            unitPrice: 599
          }
        ],
        shippingAddress: seededCustomers[0].addresses[0],
        status: 'Order Placed',
        subtotal: 1198,
        tax: 59.9,
        shippingCharge: 50,
        totalAmount: 1307.9,
        createdAt: getPastDate(1),
        statusHistory: [
          { status: 'Order Placed', timestamp: getPastDate(1), note: 'Order initialized via checkout' }
        ],
        notes: 'Please print in high resolution.'
      },
      {
        user: c2,
        items: [
          {
            product: prodMap['HUD-COZY-001']._id,
            name: prodMap['HUD-COZY-001'].name,
            sku: prodMap['HUD-COZY-001'].sku,
            size: 'XL',
            color: 'Midnight Charcoal',
            quantity: 1,
            printLocation: 'back',
            designImage: 'https://picsum.photos/300/300?random=2',
            unitPrice: 1399
          }
        ],
        shippingAddress: seededCustomers[1].addresses[0],
        status: 'Order Placed',
        subtotal: 1399,
        tax: 69.95,
        shippingCharge: 50,
        totalAmount: 1518.95,
        createdAt: getPastDate(2),
        statusHistory: [
          { status: 'Order Placed', timestamp: getPastDate(2), note: 'Order initialized via checkout' }
        ],
        notes: 'Simulate failed payment on this order'
      },
      {
        user: c3,
        items: [
          {
            product: prodMap['CAP-RETRO-001']._id,
            name: prodMap['CAP-RETRO-001'].name,
            sku: prodMap['CAP-RETRO-001'].sku,
            size: 'One Size',
            color: 'Navy Blue',
            quantity: 3,
            printLocation: 'front',
            designImage: 'https://picsum.photos/300/300?random=3',
            unitPrice: 399
          }
        ],
        shippingAddress: seededCustomers[2].addresses[0],
        status: 'Order Placed',
        subtotal: 1197,
        tax: 59.85,
        shippingCharge: 50,
        totalAmount: 1306.85,
        createdAt: getPastDate(0.1), // 2.4 hours ago
        statusHistory: [
          { status: 'Order Placed', timestamp: getPastDate(0.1), note: 'Order initialized via checkout' }
        ],
        notes: 'Need this urgently'
      },

      // --- PAYMENT VERIFIED STAGE ---
      {
        user: c1,
        items: [
          {
            product: prodMap['MUG-CLASSIC-001']._id,
            name: prodMap['MUG-CLASSIC-001'].name,
            sku: prodMap['MUG-CLASSIC-001'].sku,
            size: 'One Size',
            color: 'Gloss White',
            quantity: 5,
            printLocation: 'full',
            designImage: 'https://picsum.photos/300/300?random=4',
            unitPrice: 299
          }
        ],
        shippingAddress: seededCustomers[0].addresses[0],
        status: 'Payment Verified',
        subtotal: 1495,
        tax: 74.75,
        shippingCharge: 50,
        totalAmount: 1619.75,
        createdAt: getPastDate(3),
        statusHistory: [
          { status: 'Order Placed', timestamp: getPastDate(3), note: 'Order initialized' },
          { status: 'Payment Verified', timestamp: getPastDate(2.9), note: 'Gateway verification completed' }
        ],
        notes: 'Corporate gift batch 1'
      },
      {
        user: c2,
        items: [
          {
            product: prodMap['BOT-STEEL-001']._id,
            name: prodMap['BOT-STEEL-001'].name,
            sku: prodMap['BOT-STEEL-001'].sku,
            size: 'One Size',
            color: 'Matte Charcoal',
            quantity: 2,
            printLocation: 'front',
            designImage: 'https://picsum.photos/300/300?random=5',
            unitPrice: 899
          }
        ],
        shippingAddress: seededCustomers[1].addresses[0],
        status: 'Payment Verified',
        subtotal: 1798,
        tax: 89.9,
        shippingCharge: 55,
        totalAmount: 1942.9,
        createdAt: getPastDate(4),
        statusHistory: [
          { status: 'Order Placed', timestamp: getPastDate(4), note: 'Order initialized' },
          { status: 'Payment Verified', timestamp: getPastDate(3.8), note: 'Gateway verification completed' }
        ]
      },

      // --- PRINTING IN PROGRESS STAGE ---
      {
        user: c3,
        items: [
          {
            product: prodMap['BAG-CANVAS-001']._id,
            name: prodMap['BAG-CANVAS-001'].name,
            sku: prodMap['BAG-CANVAS-001'].sku,
            size: 'One Size',
            color: 'Natural Ecru',
            quantity: 4,
            printLocation: 'front',
            designImage: 'https://picsum.photos/300/300?random=6',
            unitPrice: 299
          }
        ],
        shippingAddress: seededCustomers[2].addresses[0],
        status: 'Printing In Progress',
        subtotal: 1196,
        tax: 59.8,
        shippingCharge: 50,
        totalAmount: 1305.8,
        createdAt: getPastDate(6),
        statusHistory: [
          { status: 'Order Placed', timestamp: getPastDate(6), note: 'Order initialized' },
          { status: 'Payment Verified', timestamp: getPastDate(5.8), note: 'Payment Successful' },
          { status: 'Design Approved', timestamp: getPastDate(5.5), note: 'Custom design aspect-ratio approved' },
          { status: 'Printing In Progress', timestamp: getPastDate(5.0), note: 'Sent to screen printing press' }
        ]
      },
      {
        user: c1,
        items: [
          {
            product: prodMap['HUD-STREET-003']._id,
            name: prodMap['HUD-STREET-003'].name,
            sku: prodMap['HUD-STREET-003'].sku,
            size: 'L',
            color: 'Cyber Purple',
            quantity: 1,
            printLocation: 'left_sleeve',
            designImage: 'https://picsum.photos/300/300?random=7',
            unitPrice: 1299
          }
        ],
        shippingAddress: seededCustomers[0].addresses[0],
        status: 'Printing In Progress',
        subtotal: 1299,
        tax: 64.95,
        shippingCharge: 50,
        totalAmount: 1413.95,
        createdAt: getPastDate(7),
        statusHistory: [
          { status: 'Order Placed', timestamp: getPastDate(7), note: 'Order initialized' },
          { status: 'Payment Verified', timestamp: getPastDate(6.8), note: 'Payment Successful' },
          { status: 'Design Approved', timestamp: getPastDate(6.4), note: 'Embroidery stitch-count approved' },
          { status: 'Printing In Progress', timestamp: getPastDate(6.0), note: 'Stitching thread colors locked' }
        ]
      },

      // --- PACKED / SHIPMENT CREATED STAGE ---
      {
        user: c2,
        items: [
          {
            product: prodMap['BOT-BAMBOO-002']._id,
            name: prodMap['BOT-BAMBOO-002'].name,
            sku: prodMap['BOT-BAMBOO-002'].sku,
            size: 'One Size',
            color: 'Bamboo Beige',
            quantity: 1,
            printLocation: 'front',
            designImage: 'https://picsum.photos/300/300?random=8',
            unitPrice: 999
          }
        ],
        shippingAddress: seededCustomers[1].addresses[0],
        status: 'Shipment Created',
        subtotal: 999,
        tax: 49.95,
        shippingCharge: 50,
        totalAmount: 1098.95,
        createdAt: getPastDate(8),
        statusHistory: [
          { status: 'Order Placed', timestamp: getPastDate(8) },
          { status: 'Payment Verified', timestamp: getPastDate(7.8) },
          { status: 'Design Approved', timestamp: getPastDate(7.5) },
          { status: 'Printing In Progress', timestamp: getPastDate(7.0) },
          { status: 'Quality Check', timestamp: getPastDate(6.8) },
          { status: 'Packed', timestamp: getPastDate(6.5) },
          { status: 'Shipment Created', timestamp: getPastDate(6.2), note: 'Courier pickup scheduled' }
        ]
      },
      {
        user: c3,
        items: [
          {
            product: prodMap['STK-DEV-001']._id,
            name: prodMap['STK-DEV-001'].name,
            sku: prodMap['STK-DEV-001'].sku,
            size: 'One Size',
            color: 'Multi-color Pack',
            quantity: 10,
            printLocation: 'front',
            designImage: '',
            unitPrice: 149
          }
        ],
        shippingAddress: seededCustomers[2].addresses[0],
        status: 'Shipment Created',
        subtotal: 1490,
        tax: 74.5,
        shippingCharge: 30,
        totalAmount: 1594.5,
        createdAt: getPastDate(9),
        statusHistory: [
          { status: 'Order Placed', timestamp: getPastDate(9) },
          { status: 'Payment Verified', timestamp: getPastDate(8.8) },
          { status: 'Design Approved', timestamp: getPastDate(8.5) },
          { status: 'Printing In Progress', timestamp: getPastDate(8.0) },
          { status: 'Quality Check', timestamp: getPastDate(7.6) },
          { status: 'Packed', timestamp: getPastDate(7.2) },
          { status: 'Shipment Created', timestamp: getPastDate(7.0), note: 'Blue Dart AWB generated' }
        ]
      },

      // --- FULLY DELIVERED STAGE (COMPLETE HISTORY) ---
      {
        user: c1,
        items: [
          {
            product: prodMap['TSH-PREM-001']._id,
            name: prodMap['TSH-PREM-001'].name,
            sku: prodMap['TSH-PREM-001'].sku,
            size: 'L',
            color: 'Classic White',
            quantity: 2,
            printLocation: 'front',
            designImage: 'https://picsum.photos/300/300?random=9',
            unitPrice: 599
          }
        ],
        shippingAddress: seededCustomers[0].addresses[0],
        status: 'Delivered',
        subtotal: 1198,
        tax: 59.9,
        shippingCharge: 50,
        totalAmount: 1307.9,
        createdAt: getPastDate(14),
        statusHistory: [
          { status: 'Order Placed', timestamp: getPastDate(14) },
          { status: 'Payment Verified', timestamp: getPastDate(13.8) },
          { status: 'Design Approved', timestamp: getPastDate(13.5) },
          { status: 'Printing In Progress', timestamp: getPastDate(13.0) },
          { status: 'Quality Check', timestamp: getPastDate(12.5) },
          { status: 'Packed', timestamp: getPastDate(12.2) },
          { status: 'Shipment Created', timestamp: getPastDate(11.8) },
          { status: 'Shipped', timestamp: getPastDate(11.5) },
          { status: 'Out for Delivery', timestamp: getPastDate(10.2) },
          { status: 'Delivered', timestamp: getPastDate(10.0), note: 'Handed over directly to customer' }
        ]
      },
      {
        user: c2,
        items: [
          {
            product: prodMap['STK-HOLO-002']._id,
            name: prodMap['STK-HOLO-002'].name,
            sku: prodMap['STK-HOLO-002'].sku,
            size: 'One Size',
            color: 'Holo Rainbow',
            quantity: 5,
            printLocation: 'front',
            designImage: '',
            unitPrice: 199
          }
        ],
        shippingAddress: seededCustomers[1].addresses[0],
        status: 'Delivered',
        subtotal: 995,
        tax: 49.75,
        shippingCharge: 30,
        totalAmount: 1074.75,
        createdAt: getPastDate(16),
        statusHistory: [
          { status: 'Order Placed', timestamp: getPastDate(16) },
          { status: 'Payment Verified', timestamp: getPastDate(15.8) },
          { status: 'Design Approved', timestamp: getPastDate(15.5) },
          { status: 'Printing In Progress', timestamp: getPastDate(15.0) },
          { status: 'Quality Check', timestamp: getPastDate(14.6) },
          { status: 'Packed', timestamp: getPastDate(14.2) },
          { status: 'Shipment Created', timestamp: getPastDate(13.8) },
          { status: 'Shipped', timestamp: getPastDate(13.5) },
          { status: 'Out for Delivery', timestamp: getPastDate(12.2) },
          { status: 'Delivered', timestamp: getPastDate(12.0), note: 'Left at security gate desk' }
        ]
      },
      {
        user: c1,
        items: [
          {
            product: prodMap['BOT-STEEL-001']._id,
            name: prodMap['BOT-STEEL-001'].name,
            sku: prodMap['BOT-STEEL-001'].sku,
            size: 'One Size',
            color: 'Silver Steel',
            quantity: 1,
            printLocation: 'front',
            designImage: '',
            unitPrice: 899
          }
        ],
        shippingAddress: seededCustomers[0].addresses[0],
        status: 'Delivered',
        subtotal: 899,
        tax: 44.95,
        shippingCharge: 50,
        totalAmount: 993.95,
        createdAt: getPastDate(15),
        statusHistory: [
          { status: 'Order Placed', timestamp: getPastDate(15) },
          { status: 'Payment Verified', timestamp: getPastDate(14.8) },
          { status: 'Design Approved', timestamp: getPastDate(14.5) },
          { status: 'Printing In Progress', timestamp: getPastDate(14.0) },
          { status: 'Quality Check', timestamp: getPastDate(13.6) },
          { status: 'Packed', timestamp: getPastDate(13.2) },
          { status: 'Shipment Created', timestamp: getPastDate(12.8) },
          { status: 'Shipped', timestamp: getPastDate(12.5) },
          { status: 'Out for Delivery', timestamp: getPastDate(11.2) },
          { status: 'Delivered', timestamp: getPastDate(11.0), note: 'Signed by Alex Johnson' }
        ]
      },

      // --- CANCELLED STAGE (CANCELLED BEFORE PRINTING) ---
      {
        user: c2,
        items: [
          {
            product: prodMap['CAP-SNAP-002']._id,
            name: prodMap['CAP-SNAP-002'].name,
            sku: prodMap['CAP-SNAP-002'].sku,
            size: 'One Size',
            color: 'Solid Black',
            quantity: 1,
            printLocation: 'front',
            designImage: 'https://picsum.photos/300/300?random=10',
            unitPrice: 449
          }
        ],
        shippingAddress: seededCustomers[1].addresses[0],
        status: 'Cancelled',
        subtotal: 449,
        tax: 22.45,
        shippingCharge: 50,
        totalAmount: 521.45,
        createdAt: getPastDate(10),
        statusHistory: [
          { status: 'Order Placed', timestamp: getPastDate(10), note: 'Order initialized' },
          { status: 'Cancelled', timestamp: getPastDate(9.5), note: 'Cancelled by customer: Order placed by mistake.' }
        ]
      }
    ];

    const seededOrders = [];
    for (const ord of ordersToSeed) {
      const created = await Order.create(ord);
      seededOrders.push(created);
    }
    console.log(`✅ Seeded ${seededOrders.length} historical orders.`);

    // ── 6. Seed Payments & Shipments for Orders ───────────────────
    console.log('Seeding corresponding payments and shipping records...');

    for (let index = 0; index < seededOrders.length; index++) {
      const ord = seededOrders[index];

      // Retrieve customer index based on user ID
      const userRef = seededCustomers.find(c => c._id.toString() === ord.user.toString());
      const userName = userRef ? userRef.name.replace(/\s+/g, '').toLowerCase() : `cust${index}`;

      // A: Seeding corresponding Payments
      // Orders stuck at Placed generally do not have successful payment logs (except the one we fail explicitly)
      if (ord.status === 'Order Placed') {
        // Create 1 Failed Payment on the second Placed order (Bruce Wayne or Sarah Connor)
        if (index === 1) {
          await Payment.create({
            order: ord._id,
            paymentId: `pay_fail_${index}_${Date.now()}`,
            transactionId: `txn_fail_998822${index}`,
            amount: ord.totalAmount,
            status: 'Failed',
            paymentDate: ord.createdAt
          });
        }
      } else if (ord.status !== 'Cancelled') {
        // Paid orders ("Payment Verified", "Printing In Progress", "Shipment Created", "Delivered")
        await Payment.create({
          order: ord._id,
          paymentId: `pay_succ_${userName}_${index}_${Date.now()}`,
          transactionId: `txn_succ_776655${index}`,
          amount: ord.totalAmount,
          status: 'Successful',
          paymentDate: ord.statusHistory[1] ? ord.statusHistory[1].timestamp : ord.createdAt
        });
      }

      // B: Seeding corresponding Shippings (Shipment Created, Shipped, Out for Delivery, Delivered)
      const shippingRequiredStates = ['Shipment Created', 'Shipped', 'Out for Delivery', 'Delivered'];
      if (shippingRequiredStates.includes(ord.status)) {
        let shippingStatus = 'Shipment Created';
        if (ord.status === 'Delivered') shippingStatus = 'Delivered';

        await Shipping.create({
          order: ord._id,
          courierName: index % 2 === 0 ? 'Blue Dart' : 'Delhivery',
          trackingNumber: `TRACK${100000 + index}IN`,
          shipmentId: `SHPFORD${887700 + index}`,
          estimatedDeliveryDate: getPastDate(-2), // 2 days in future relative to order date
          shippingStatus: shippingStatus
        });
      }
    }

    console.log('✅ Payments and Shipments seeding completed.');
    console.log('🎉 DB SEEDING COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

seedDB();
