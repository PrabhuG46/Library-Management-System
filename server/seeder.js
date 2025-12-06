require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Author = require('./models/Author');
const Book = require('./models/Book');

const seedData = async () => {
  // Only connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  try {
    // 1. Check & Create Admin
    const adminExists = await User.findOne({ role: 'ADMIN' });
    
    if (!adminExists) {
      console.log('Creating default admin...');
      // Password hashing handled by model pre-save hook
      await User.create({
        name: 'System Admin',
        email: 'admin@library.com',
        password: 'admin123',
        role: 'ADMIN'
      });
      console.log('Admin created');
    }

    // 2. Check & Create Sample User
    const userExists = await User.findOne({ email: 'user@library.com' });
    if (!userExists) {
      console.log('Creating default user...');
      await User.create({
        name: 'Test User',
        email: 'user@library.com',
        password: 'user123',
        role: 'USER'
      });
      console.log('User created');
    }

    // 3. Create Authors if empty
    const authorCount = await Author.countDocuments();
    if (authorCount === 0) {
      console.log('Seeding authors...');
      const authors = await Author.insertMany([
        { name: 'J.K. Rowling', bio: 'British author, best known for the Harry Potter series.' },
        { name: 'George Orwell', bio: 'English novelist and essayist, journalist and critic.' },
        { name: 'Isaac Asimov', bio: 'American writer and professor of biochemistry.' }
      ]);
      
      // 4. Create Books
      console.log('Seeding books...');
      await Book.insertMany([
        { 
          title: 'Harry Potter and the Philosopher\'s Stone', 
          authorId: authors[0]._id, 
          isbn: '978-0747532699', 
          publishedYear: 1997, 
          status: 'AVAILABLE' 
        },
        { 
          title: '1984', 
          authorId: authors[1]._id, 
          isbn: '978-0451524935', 
          publishedYear: 1949, 
          status: 'AVAILABLE' 
        },
        { 
          title: 'Foundation', 
          authorId: authors[2]._id, 
          isbn: '978-0553293357', 
          publishedYear: 1951, 
          status: 'AVAILABLE' 
        }
      ]);
    }

    console.log('Seeding complete.');
  } catch (error) {
    console.error('Seeding error:', error);
    // Do not exit process if running inside server
    if (require.main === module) {
      process.exit(1);
    }
  }
};

// If called directly (node seeder.js), run seedData and exit
if (require.main === module) {
  seedData().then(() => {
    mongoose.connection.close();
    process.exit();
  });
}

module.exports = seedData;