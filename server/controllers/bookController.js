
const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');

// @desc    Get all books with optional filters
// @route   GET /api/books
// @access  Private
const getBooks = asyncHandler(async (req, res) => {
  const { search, status, authorId } = req.query;
  
  let query = {};

  // Status Filter
  if (status) {
    query.status = status;
  }

  // Author Filter
  if (authorId) {
    query.authorId = authorId;
  }

  // Search Filter (Title or ISBN)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } }, // Case insensitive regex
      { isbn: { $regex: search, $options: 'i' } }
    ];
  }

  const books = await Book.find(query)
    .populate('authorId')
    .populate('borrowedBy', 'name email');
    
  res.json(books);
});

// @desc    Get logged in user's loans
// @route   GET /api/books/my-loans
// @access  Private
const getMyLoans = asyncHandler(async (req, res) => {
  const books = await Book.find({ borrowedBy: req.user._id })
    .populate('authorId');
  res.json(books);
});

// @desc    Create a book
// @route   POST /api/books
// @access  Private/Admin
const createBook = asyncHandler(async (req, res) => {
  const book = new Book(req.body);
  const createdBook = await book.save();
  await createdBook.populate('authorId');
  res.status(201).json(createdBook);
});

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('authorId')
      .populate('borrowedBy', 'name');
    res.json(updatedBook);
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
});

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    await Book.deleteOne({ _id: book._id });
    res.json({ message: 'Book removed' });
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
});

// @desc    Borrow a book
// @route   POST /api/books/:id/borrow
// @access  Private
const borrowBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  if (book.status !== 'AVAILABLE') {
    res.status(400);
    throw new Error('Book is already borrowed');
  }

  book.status = 'BORROWED';
  book.borrowedBy = req.user._id;
  await book.save();

  res.json(book);
});

// @desc    Return a book
// @route   POST /api/books/:id/return
// @access  Private
const returnBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Check ownership of loan or admin override
  if (book.borrowedBy && book.borrowedBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('You cannot return a book you did not borrow');
  }

  book.status = 'AVAILABLE';
  book.borrowedBy = null;
  await book.save();

  res.json(book);
});

module.exports = {
  getBooks,
  getMyLoans,
  createBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook
};
