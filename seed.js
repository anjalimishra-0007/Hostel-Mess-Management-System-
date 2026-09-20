require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Block = require('./models/Block');
const Room = require('./models/Room');
const RoomRequest = require('./models/RoomRequest');
const MaintenanceRequest = require('./models/MaintenanceRequest');
const RoomChangeRequest = require('./models/RoomChangeRequest');
const MessMenu = require('./models/MessMenu');
const MealFeedback = require('./models/MealFeedback');

const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to MongoDB for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clean existing data
    console.log('🧹 Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Block.deleteMany({}),
      Room.deleteMany({}),
      RoomRequest.deleteMany({}),
      MaintenanceRequest.deleteMany({}),
      RoomChangeRequest.deleteMany({}),
      MessMenu.deleteMany({}),
      MealFeedback.deleteMany({})
    ]);
    console.log('✨ Cleared old database collections');

    // 1. Create Users
    console.log('👤 Creating users...');
    const admin = await User.create({
      name: 'Dr. Rajesh Warden',
      email: 'admin@hostel.com',
      password: 'password123',
      role: 'admin',
      phone: '9876543210'
    });

    const student1 = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav@student.com',
      password: 'password123',
      role: 'student',
      studentId: 'STU2026001',
      phone: '9876543211'
    });

    const student2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@student.com',
      password: 'password123',
      role: 'student',
      studentId: 'STU2026002',
      phone: '9876543212'
    });

    const student3 = await User.create({
      name: 'Rohan Verma',
      email: 'rohan@student.com',
      password: 'password123',
      role: 'student',
      studentId: 'STU2026003',
      phone: '9876543213'
    });

    const student4 = await User.create({
      name: 'Ananya Iyer',
      email: 'ananya@student.com',
      password: 'password123',
      role: 'student',
      studentId: 'STU2026004',
      phone: '9876543214'
    });

    console.log('✅ Created 1 Admin & 4 Students');

    // 2. Create Blocks
    console.log('🏢 Creating hostel blocks...');
    const blockA = await Block.create({
      name: 'Block A - Aryabhata',
      type: 'boys',
      totalRooms: 6,
      description: 'Boys North Wing - Senior Students'
    });

    const blockB = await Block.create({
      name: 'Block B - Gargi',
      type: 'girls',
      totalRooms: 6,
      description: 'Girls South Campus Wing'
    });

    const blockC = await Block.create({
      name: 'Block C - Ramanujan',
      type: 'boys',
      totalRooms: 4,
      description: 'Boys East Wing - Freshers Campus'
    });

    console.log('✅ Created 3 Blocks (Aryabhata, Gargi, Ramanujan)');

    // 3. Create Rooms
    console.log('🛏️ Creating rooms...');
    const roomA101 = await Room.create({
      roomNumber: 'A-101',
      block: blockA._id,
      type: 'double',
      capacity: 2,
      floor: 1,
      occupants: [student1._id] // Aarav is in A-101
    });

    const roomA102 = await Room.create({
      roomNumber: 'A-102',
      block: blockA._id,
      type: 'single',
      capacity: 1,
      floor: 1,
      occupants: []
    });

    const roomA201 = await Room.create({
      roomNumber: 'A-201',
      block: blockA._id,
      type: 'triple',
      capacity: 3,
      floor: 2,
      occupants: []
    });

    const roomA202 = await Room.create({
      roomNumber: 'A-202',
      block: blockA._id,
      type: 'double',
      capacity: 2,
      floor: 2,
      occupants: []
    });

    const roomB101 = await Room.create({
      roomNumber: 'B-101',
      block: blockB._id,
      type: 'single',
      capacity: 1,
      floor: 1,
      occupants: [student2._id] // Priya is in B-101
    });

    const roomB102 = await Room.create({
      roomNumber: 'B-102',
      block: blockB._id,
      type: 'double',
      capacity: 2,
      floor: 1,
      occupants: [student4._id] // Ananya is in B-102
    });

    const roomB201 = await Room.create({
      roomNumber: 'B-201',
      block: blockB._id,
      type: 'triple',
      capacity: 3,
      floor: 2,
      occupants: []
    });

    const roomC101 = await Room.create({
      roomNumber: 'C-101',
      block: blockC._id,
      type: 'double',
      capacity: 2,
      floor: 1,
      occupants: []
    });

    const roomC102 = await Room.create({
      roomNumber: 'C-102',
      block: blockC._id,
      type: 'triple',
      capacity: 3,
      floor: 1,
      occupants: []
    });

    console.log('✅ Created 9 Rooms with initial allotments');

    // 4. Create Room Requests
    console.log('📋 Creating room requests...');
    await RoomRequest.create({
      student: student1._id,
      preferredBlock: blockA._id,
      preferredRoomType: 'double',
      status: 'approved',
      allocatedRoom: roomA101._id,
      adminRemarks: 'Allocated bed in A-101.'
    });

    await RoomRequest.create({
      student: student2._id,
      preferredBlock: blockB._id,
      preferredRoomType: 'single',
      status: 'approved',
      allocatedRoom: roomB101._id,
      adminRemarks: 'Single room allocated.'
    });

    await RoomRequest.create({
      student: student3._id,
      preferredBlock: blockA._id,
      preferredRoomType: 'double',
      status: 'pending'
    });

    console.log('✅ Created Room Requests (2 approved, 1 pending for Rohan)');

    // 5. Create Maintenance Requests
    console.log('🔧 Creating maintenance requests...');
    await MaintenanceRequest.create({
      student: student1._id,
      room: roomA101._id,
      category: 'plumbing',
      description: 'Bathroom sink tap is continuously leaking and dripping water.',
      status: 'in_progress',
      adminRemarks: 'Plumber assigned, visiting today between 2-4 PM.'
    });

    await MaintenanceRequest.create({
      student: student2._id,
      room: roomB101._id,
      category: 'electrical',
      description: 'Ceiling fan regulator stuck at speed 2, cannot adjust.',
      status: 'pending'
    });

    console.log('✅ Created Maintenance Requests (1 in_progress, 1 pending)');

    // 6. Create Weekly Mess Menu
    console.log('🍽️ Creating weekly mess menu...');
    const weeklyMenu = [
      {
        day: 'Monday',
        breakfast: 'Aloo Paratha with Curd, Pickle, Boiled Eggs / Banana, Tea & Coffee',
        lunch: 'Paneer Butter Masala, Dal Tadka, Jeera Rice, Phulka Roti, Salad & Gulab Jamun',
        snacks: 'Veg Cutlet with Green Chutney, Masala Chai / Filter Coffee',
        dinner: 'Mix Veg Korma, Dal Palak, Steamed Rice, Tawa Roti, Papad, Fresh Fruit Custard',
        updatedBy: admin._id
      },
      {
        day: 'Tuesday',
        breakfast: 'Idli Sambar with Coconut & Tomato Chutneys, Medu Vada, Tea & Coffee',
        lunch: 'Rajma Masala, Aloo Gobi, Steamed Basmati Rice, Chapati, Boondi Raita',
        snacks: 'Onion Pakoda with Mint Dip, Hot Ginger Tea',
        dinner: 'Egg Curry / Malai Kofta, Moong Dal Fry, Steamed Rice, Butter Roti, Kheer',
        updatedBy: admin._id
      },
      {
        day: 'Wednesday',
        breakfast: 'Poha with Sev & Peanuts, Boiled Sprouts, Fresh Milk, Tea & Coffee',
        lunch: 'Chole Masala, Bhature / Puri, Jeera Pulao, Onion Salad, Roasted Papad',
        snacks: 'Samosa with Sweet Tamarind Chutney, Filter Coffee',
        dinner: 'Butter Chicken / Shahi Paneer, Dal Makhani, Garlic Naan / Tandoori Roti, Rice, Ice Cream',
        updatedBy: admin._id
      },
      {
        day: 'Thursday',
        breakfast: 'Masala Dosa with Potato Masala, Sambar, Coconut Chutney, Tea & Coffee',
        lunch: 'Kadhi Pakoda, Bhindi Masala, Steamed Rice, Phulka, Cucumber Salad',
        snacks: 'Grilled Cheese Sandwich, Lemon Iced Tea / Hot Tea',
        dinner: 'Dum Aloo Kashmiri, Chana Dal, Peas Pulao, Chapati, Moong Dal Halwa',
        updatedBy: admin._id
      },
      {
        day: 'Friday',
        breakfast: 'Uttapam with Sambar & Chutney, Boiled Eggs / Seasonal Fruit, Tea & Coffee',
        lunch: 'Veg Biryani / Chicken Biryani, Mirchi Ka Salan, Onion Raita, Boiled Egg',
        snacks: 'Pav Bhaji with Butter Pav, Masala Chai',
        dinner: 'Palak Paneer, Yellow Dal Tadka, Steamed Rice, Tawa Roti, Jalebi with Rabdi',
        updatedBy: admin._id
      },
      {
        day: 'Saturday',
        breakfast: 'Puri Bhaji (Halwa Puri style), Sprouts, Tea & Coffee',
        lunch: 'Sambhar Rice, Curd Rice, Potato Fry, Appalam, Pickle',
        snacks: 'Bhel Puri / Sev Puri, Cold Coffee / Hot Tea',
        dinner: 'Veg Manchurian / Chilli Chicken, Fried Rice, Hakka Noodles, Hot Sweet Corn Soup',
        updatedBy: admin._id
      },
      {
        day: 'Sunday',
        breakfast: 'Chole Kulche, Sweet Lassi, Fresh Fruits, Tea & Coffee',
        lunch: 'Special Sunday Feast: Paneer Tikka Masala / Mutton Rogan Josh, Pulao, Roti, Rasgulla',
        snacks: 'White Sauce Pasta / Red Sauce Pasta, Hot Chocolate / Chai',
        dinner: 'Light Khichdi / Dal Fry, Phulka, Aloo Methi, Roasted Papad, Ice Cream Sundae',
        updatedBy: admin._id
      }
    ];

    await MessMenu.insertMany(weeklyMenu);
    console.log('✅ Created 7-day Mess Menu (Monday - Sunday)');

    // 7. Create Meal Feedbacks
    console.log('⭐ Creating sample meal feedbacks...');
    await MealFeedback.create([
      {
        student: student1._id,
        day: 'Monday',
        mealType: 'lunch',
        rating: 5,
        comment: 'Paneer Butter Masala was delicious and fresh!'
      },
      {
        student: student2._id,
        day: 'Wednesday',
        mealType: 'dinner',
        rating: 4,
        comment: 'Shahi Paneer and Garlic Naan were awesome, but dessert arrived late.'
      },
      {
        student: student3._id,
        day: 'Tuesday',
        mealType: 'breakfast',
        rating: 4,
        comment: 'Idli was very soft and coconut chutney was great.'
      }
    ]);
    console.log('✅ Created Sample Meal Feedbacks');

    console.log('\n==========================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==========================================');
    console.log('Admin Credentials:');
    console.log('  Email:    admin@hostel.com');
    console.log('  Password: password123');
    console.log('\nStudent Credentials:');
    console.log('  Email:    aarav@student.com / priya@student.com / rohan@student.com');
    console.log('  Password: password123');
    console.log('==========================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
