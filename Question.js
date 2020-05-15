import mongoose from 'mongoose'

const Question = mongoose.model('Question', {
    id: {
      type: Number
    },
    text: {
      type: String
    },
    likes: {
      type: Number
    },
    answers: {
      id: Number,
      text: String
    }
  })

export default Question