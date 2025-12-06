const express = require('express');
const router = express.Router();
const {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
  getMyLoans
} = require('../controllers/bookController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getBooks)
  .post(protect, admin, createBook);

router.route('/my-loans')
  .get(protect, getMyLoans);

router.route('/:id')
  .put(protect, admin, updateBook)
  .delete(protect, admin, deleteBook);

router.route('/:id/borrow')
  .post(protect, borrowBook);

router.route('/:id/return')
  .post(protect, returnBook);

module.exports = router;