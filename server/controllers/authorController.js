
const asyncHandler = require('express-async-handler');
const Author = require('../models/Author');
const Book = require('../models/Book');

// @desc    Get all authors
// @route   GET /api/authors
// @access  Private
const getAuthors = asyncHandler(async (req, res) => {
  const authors = await Author.find({});
  res.json(authors);
});

// @desc    Create an author
// @route   POST /api/authors
// @access  Private/Admin
const createAuthor = asyncHandler(async (req, res) => {
  const { name, bio } = req.body;

  const author = await Author.create({
    name,
    bio
  });

  if (author) {
    res.status(201).json(author);
  } else {
    res.status(400);
    throw new Error('Invalid author data');
  }
});

// @desc    Update an author
// @route   PUT /api/authors/:id
// @access  Private/Admin
const updateAuthor = asyncHandler(async (req, res) => {
  const author = await Author.findById(req.params.id);

  if (author) {
    author.name = req.body.name || author.name;
    author.bio = req.body.bio || author.bio;

    const updatedAuthor = await author.save();
    res.json(updatedAuthor);
  } else {
    res.status(404);
    throw new Error('Author not found');
  }
});

// @desc    Delete an author
// @route   DELETE /api/authors/:id
// @access  Private/Admin
const deleteAuthor = asyncHandler(async (req, res) => {
  const author = await Author.findById(req.params.id);

  if (author) {
    // Optional: Check if author has books before deleting?
    // For now, we allow deletion (mongo will leave orphaned books or we could cascade)
    await Author.deleteOne({ _id: author._id });
    res.json({ message: 'Author removed' });
  } else {
    res.status(404);
    throw new Error('Author not found');
  }
});

module.exports = { getAuthors, createAuthor, updateAuthor, deleteAuthor };
