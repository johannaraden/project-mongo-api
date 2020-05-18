import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import data from './data/qa.json'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/questions"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

// Reusable variable for error messages
const ERR_NO_QUESTIONS = 'Sorry, could not find this question.'

const User = mongoose.model('User', {
  id: {
    type: Number
  },
  userType: {
    type: String
  }
})

const Question = mongoose.model('Question', {
  id: {
    type: Number
  },
  question: {
    type: String
  },
  likes: {
    type: Number
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})
 

if (process.env.RESET_DB) {
  console.log('Resetting Database!')
  const seedDatabase = async () => {
    await Question.deleteMany({})
    await User.deleteMany({})
    data.forEach((question) => {
      new Question(question).save()
    })
    const rookie = await new User({
      id: 1,
      userType: 'Rookie'
    }).save()
    const experienced = await new User({
      id: 2,
      userType: 'Experienced'
    }).save()
    const knowItAll = await new User({
      id: 3,
      userType: 'Know-it-all'
    }).save()
    // const userArray = [knowItAll, experienced, rookie]
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

// My endpoints 

app.get('/', (req, res) => {
  res.send(`<h2>Hello!</h2><h4>Possible endpoints for this API. </h4><ul><li>'/questions' shows all questions in the database</li><li>'/questions?query={'search word'}' gives the user the possibility to enter a search word to look for a question in a specific topic.</li><li>'/questions/:id' finds a specific question by id number</li><li>'/popular' returns the most popular questions based on number of likes</li><li>'/nolikes' return the questions that have not yet recieved any likes.</li></ul>`)
})
 
// For this endpoint - creating regex to make it possible to search for a question including words like "playing" or "wi-fi"

app.get('/questions', async (req, res) => {
  const { query } = req.query
  const queryRegex = new RegExp(query, 'i')
  // await User.count().exec((err, count) => {
  //   let random = Math.floor(Math.random() * count)
  //     User.findOne().skip(random).exec((err, result) => {
  //       console.log(result) 
  //     })
  // })
  const questions = await Question.find({question: queryRegex}).populate({
    path: 'path',
    options: {limit: myLimit}
})
  let myLimit = await Math.floor(Math.random() * (questions.length - 1) + 1)

  console.log(myLimit)
  console.log(`Found ${questions.length} question(s)`)
  res.json(questions)
})

//Looking for a specific question by id.

app.get('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id) 
    if (question) {
      res.json(question)
    } else {
      res.status(404).json({error: ERR_NO_QUESTIONS})
  } 
  }catch (err) {
    res.status(400).json({error: ERR_NO_QUESTIONS})
  }
})

// Top three page shows the three questions with the most likes 
app.get('/popular', async(req, res) => {
  const popularQuestions = await Question.find({}).sort({likes: -1}).limit(3)
  res.json(popularQuestions)
  })

  app.get('/nolikes', async(req, res) => {
    const noLikesQuestions = await Question.find({likes: 0})
    res.json(noLikesQuestions)
  })

  app.post('/question', async (req,res) => {
    const question = new Question(req.body)
    await question.save()
    res.json(question)
  })

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
}) 