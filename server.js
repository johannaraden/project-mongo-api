import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import data from './data/qa.json'


const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/questions"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise


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


if (process.env.RESET_DATABASE) {
  console.log('Resetting database..')

  const seedDatabase = async () => {
    await Question.deleteMany()
    //  Save the questions in qa.json to the database
    await data.forEach((question) => new Question(question).save());
  }
  seedDatabase()
}

const port = process.env.PORT || 9000
const app = express()
// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

// Adding middleware for targeting server error for every request
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({ error: 'Service unavailable'})
  }
})  

// My routes 

app.get('/', (req, res) => {
  res.send(`<h2>Hello!</h2><h4>Possible endpoints for this API. </h4><ul><li>'/questions' shows all questions in the database</li><li>'/questions?query={'search word'}' gives the user the possibility to enter a search word to look for a question in a specific topic.</li><li>'/questions/:id' finds a specific question by id number</li><li>'/popular' returns the most popular questions based on number of likes</li></ul>`)
})

// For this route - creating regex to make it possible to search for a question including words like "playing" or "wi-fi"

app.get('/questions', async (req, res) => {
  const { query } = req.query
  const queryRegex = new RegExp(query, 'i')
  const questions = await Question.find({text: queryRegex}).populate('User')
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

// app.get('/popular', (req, res) => {
//   res.json(Question)
//     if(question) {
//       res.json(question).populate('User')
//     } else {
//       res.status(404).json({error: 'Sorry there is no question'})
//     }
//   })

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
}) 