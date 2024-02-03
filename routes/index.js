const express = require('express');
const router = express.Router();
const questionController = require('../controller/questionController');
router.get('/question',questionController.home)
router.post('/add-question',questionController.add)
router.post('/:id/options/create', questionController.addOptionsToQuestion);
router.delete('/:id/deleteOption', questionController.deleteOption);
router.post('/options/:id/add_vote', questionController.addVote);
router.delete('/:id/delete', questionController.deleteQuestion);

// Define routes

module.exports = router;