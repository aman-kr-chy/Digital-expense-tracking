import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Group from './models/Group.js';
import Expense from './models/Expense.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Group.deleteMany();
    await Expense.deleteMany();

    const createdUsers = await User.insertMany([
      { name: 'Aman', email: 'aman@example.com', password: 'password123' }, // Note: password will be hashed via pre-save middleware? No, insertMany doesn't trigger pre-save! Let's do create
    ]);
    
    // Doing it properly with create to hash passwords
    await User.deleteMany();
    const aman = await User.create({ name: 'Aman', email: 'aman@example.com', password: 'password123' });
    const rahul = await User.create({ name: 'Rahul', email: 'rahul@example.com', password: 'password123' });
    const priya = await User.create({ name: 'Priya', email: 'priya@example.com', password: 'password123' });
    const ravi = await User.create({ name: 'Ravi', email: 'ravi@example.com', password: 'password123' });

    aman.friends.push(rahul._id, priya._id, ravi._id);
    await aman.save();
    rahul.friends.push(aman._id);
    await rahul.save();

    const goaTrip = await Group.create({
      name: 'Goa Trip',
      description: 'Trip to Goa in Dec',
      category: 'Travel',
      createdBy: aman._id,
      members: [aman._id, rahul._id, priya._id, ravi._id],
    });

    aman.groups.push(goaTrip._id);
    rahul.groups.push(goaTrip._id);
    priya.groups.push(goaTrip._id);
    ravi.groups.push(goaTrip._id);
    await Promise.all([aman.save(), rahul.save(), priya.save(), ravi.save()]);

    const expense1 = await Expense.create({
      title: 'Dinner at Taj',
      amount: 1200,
      description: 'First night dinner',
      category: 'Food',
      paidBy: aman._id,
      group: goaTrip._id,
      splitMethod: 'EQUAL',
      splits: [
        { user: aman._id, amount: 300 },
        { user: rahul._id, amount: 300 },
        { user: priya._id, amount: 300 },
        { user: ravi._id, amount: 300 },
      ]
    });

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
