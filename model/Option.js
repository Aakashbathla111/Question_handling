const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  votes: { type: Number, default: 0 },
});

const Option = mongoose.model('Option', optionSchema);

module.exports = Option;