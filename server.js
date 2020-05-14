import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import data from './data/qa.json'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/questions"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise


// // Adding middleware for targeting server error for every request
// app.use((req, res, next) => {
//   if(mongoose.connection.readyState === 1) {
//     next() 
//   } else {
//       res.status(503).json({error: 'Service not available'})
//   }
// })

// User model
const User = mongoose.model('User', {
  text: {
    type: Number
  }
})

// Question model
const Question = mongoose.model('Question', {
  id: {
    type: Number
  },
  text: {
    type: String
  },
  createdAt: {
    type: Date, 
    default: Date.now},
  answers: {
    id: Number,
    text: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})


if (process.env.RESET_DATABASE) {
  console.log('Resetting database..')

  const seedDatabase = async () => {
    await Question.deleteMany()
    // await Answer.deleteMany()
    const nowitall = new User({text: 'Now-it-all'}) 
    // await User.deleteMany()
    // await new Question({
    // "id": 60, 
    // "text": "I think my neighbor is stealing my wi-fi? What to do?", 
    // "createdAt": "",
    // "answers": [
    //   {
    //   "id": 1,
    //   "text": "You sound a bit paranoid. Change the password and see if it gets hacked again."
    //   },
    //   {
    //     "id": 2,
    //     "text": "Annoying! Try to do Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    //     }}).save()
    //  Save the questions in qa.json to the database
    await data.forEach((question) => new Question(question).save())
  }
  seedDatabase()
}

const port = process.env.PORT || 9000
const app = express()
// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())


// My routes 
// For the first route - creating regex to make it possible to search for a question including words like "playing" or "wi-fi"

app.get('/questions', async (req, res) => {
  const { query } = req.query
  const queryRegex = new RegExp(query)
  const questions = await Question.find({text: queryRegex})
  console.log(`Found ${questions.length} question(s)`)
  res.json(questions)
})

//Looking for a specific question.

app.get('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
    if (question) {
      res.json(question)
    } else {
      res.status(404).json({error: 'Sorry, this question does not exist.'})
  } 
  }catch (err) {
    res.status(400).json({error: 'Sorry, there is no such question.'})
  }
})

// POST method to add a question 

app.post('/questions', (req, res) => {
  res.json({
    response: 'This is a post request',
    body: req.body
  })
})

app.get('/qa', (req, res) => {
  res.json(Question).populate('answer') 
    if(question) {
      res.json(question)
    } else {
      res.status(404).json({error: 'Sorry there is no question'})
    }
  })

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
}) 