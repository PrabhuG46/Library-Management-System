
const express = require('express');
const router = express.Router();
const { getAuthors, createAuthor, updateAuthor, deleteAuthor } = require('../controllers/authorController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAuthors)
  .post(protect, admin, createAuthor);

router.route('/:id')
  .put(protect, admin, updateAuthor)
  .delete(protect, admin, deleteAuthor);

module.exports = router;
