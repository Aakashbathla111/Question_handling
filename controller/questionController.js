const Question = require('../model/Question');
const Option = require('../model/Option');

module.exports.home = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;

    const totalQuestions = await Question.countDocuments();
    const totalPages = Math.ceil(totalQuestions / pageSize);

    // Use the populate method to retrieve options associated with each question
    const questions = await Question.find()
      .populate('options') // Populate the 'options' field
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const formattedQuestions = questions.map(question => ({
      id: question._id,
      title: question.title,
      options: question.options.map(option => ({
        id: option._id,
        text: option.text,
        votes: option.votes,
        link_to_vote: `http://localhost:8000/options/${option._id}/add_vote`,
      })),
    }));

    res.json({
      totalQuestions,
      totalPages,
      currentPage: page,
      questions: formattedQuestions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

  module.exports.add = async (req, res) => {
    try {
      const { title, options } = req.body;
  
      if (!title || !options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ error: 'Invalid request body' });
      }
  
      // Create a new question
      const question = new Question({ title });
  
      // Save the question
      const savedQuestion = await question.save();
  
      // Create options associated with the question
      const createdOptions = await Promise.all(options.map(async optionText => {
        const newOption = new Option({ text: optionText, questionId: savedQuestion._id });
        return await newOption.save();
      }));
  
      // Update the question with the option IDs
      savedQuestion.options = createdOptions.map(option => option._id);
      await savedQuestion.save();
  
      // Respond with saved question details and associated options
      res.status(201).json({
        id: savedQuestion._id,
        title: savedQuestion.title,
        options: createdOptions.map(option => ({
          id: option._id,
          text: option.text,
          votes: option.votes,
          link_to_vote: `http://localhost:8000/options/${option._id}/add_vote`,
        })),
      });
    } catch (error) {
      console.error('Error creating question:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  module.exports.addOptionsToQuestion = async (req, res) => {
    try {
      const questionId = req.params.id;
      const { options } = req.body;
  
      if (!options || !Array.isArray(options) || options.length === 0) {
        return res.status(400).json({ error: 'Invalid request body' });
      }
  
      const question = await Question.findById(questionId);
  
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
  
      // Create options associated with the question
      const createdOptions = await Promise.all(options.map(async optionText => {
        const newOption = new Option({ text: optionText, questionId: question._id });
        return await newOption.save();
      }));
  
      // Add the IDs of the created options to the question's options array
      question.options = question.options.concat(createdOptions.map(option => option._id));
  
      // Save the updated question
      const updatedQuestion = await question.save();
  
      res.status(201).json({
        id: updatedQuestion._id,
        title: updatedQuestion.title,
        options: createdOptions.map(option => ({
          id: option._id,
          text: option.text,
          votes: option.votes,
          link_to_vote: `http://localhost:8000/options/${option._id}/add_vote`,
        })),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  
  module.exports.deleteQuestion = async (req, res) => {
    try {
      const questionId = req.params.id;
  
      // Find the question and populate the 'options' field to get the option IDs
      const question = await Question.findById(questionId).populate('options');
  
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
  
      // Extract option IDs from the populated 'options' field
      const optionIds = question.options.map(option => option._id);
  
      // Delete the options first
      const deleteOptionsResult = await Option.deleteMany({ _id: { $in: optionIds } });
  
      console.log('Delete options result:', deleteOptionsResult);
  
      // Delete the question
      await Question.findByIdAndDelete(questionId);
  
      res.status(200).json({ message: 'Question and associated options deleted successfully' });
    } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  module.exports.addVote = async (req, res) => {
    try {
        console.log(req.params.id)
      const optionId = req.params.id;
  
      const option = await Option.findById(optionId);
  
      if (!option) {
        return res.status(404).json({ error: 'Option not found' });
      }
  
      // Increment the vote count
      option.votes += 1;
      await option.save();
  
      res.status(200).json({ message: 'Vote added successfully', votes: option.votes });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  module.exports.deleteOption = async (req, res) => {
    try {
      const optionId = req.params.id;
  
      // Fetch the option from the database
      const option = await Option.findById(optionId);
  
      if (!option) {
        return res.status(404).json({ error: 'Option not found' });
      }
  
      // Delete the option
      await Option.findByIdAndDelete(optionId);
  
      // Find the associated question
      const question = await Question.findOne({ options: optionId });
  
      if (!question) {
        return res.status(404).json({ error: 'Question not found for the given option' });
      }
  
      // Remove the option ID from the question's options array
      question.options = question.options.filter(qOptionId => String(qOptionId) !== String(optionId));
  
      // Save the updated question
      await question.save();
  
      res.status(200).json({ message: 'Option deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };