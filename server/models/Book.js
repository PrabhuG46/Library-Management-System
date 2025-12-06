const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
  isbn: { type: String, required: true },
  publishedYear: { type: Number, required: true },
  status: { type: String, enum: ['AVAILABLE', 'BORROWED'], default: 'AVAILABLE' },
  borrowedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);