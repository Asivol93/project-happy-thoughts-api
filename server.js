import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import listEndpoints from 'express-list-endpoints'

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/happyThoughts'
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

// Defines the port the app will run on. Defaults to 8080, but can be
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

const ThoughtSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140,
    trim: true,
  },
  hearts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  tag: {
    type: String,
    required: true,
    enum: ['Family', 'Pets', 'Work/School', 'Love', 'Food', 'Exercise'],
  },
  name: {
    type: String,
    trim: true,
    required: true,
    maxlength: 50,
  },
})

const Thought = mongoose.model('Thought', ThoughtSchema)

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

// Lists all endpoints available
app.get('/', (req, res) => {
  res.send(listEndpoints(app))
})

//Get all thoughts in descending order, maximum of 20
app.get('/thoughts', async (req, res) => {
  const thoughts = await Thought.find()
    .sort({ createdAt: 'desc' })
    .limit(20)
    .exec()
  res.json(thoughts)
})

//Create new thought
app.post('/thoughts', async (req, res) => {
  const { message, tag, name } = req.body

  try {
    const newThought = await new Thought({ message, tag, name }).save()
    res.status(201).json({ response: newThought, success: true })
  } catch (error) {
    res.status(400).json({ response: error, success: false })
  }
})

//Update like by thought id
app.post('/thoughts/:thoughtId/like', async (req, res) => {
  const { thoughtId } = req.params

  try {
    const updatedLikes = await Thought.findByIdAndUpdate(
      thoughtId,
      {
        $inc: {
          hearts: 1,
        },
      },
      {
        new: true,
      }
    )
    res.status(200).json({ response: updatedLikes, success: true })
  } catch (error) {
    res.status(400).json({ response: error, success: false })
  }
})

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port}`)
})
