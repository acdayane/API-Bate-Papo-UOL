import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const nameSchema = joi.object({
  name: joi.string().required().min(2).max(30)
});

const messageSchema = joi.object({
  to: joi.string().required(),
  text: joi.string().required(),
  type: joi.string().required().valid('message', 'private_message')
});

const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
  await mongoClient.connect();
  console.log('MongoDB connected');
} catch (err) {
  console.log(err);
}

let db = mongoClient.db('API-UOL');
let collectionParticipants = db.collection('participants');
let collectionMessages = db.collection('messages');
let time = new Date();

app.post('/participants', async (req, res) => {
  const { name } = req.body;

  const validation = nameSchema.validate({ name }, { abortEarly: false });

  if (validation.error) {
    const err = validation.error.details.map((d) => d.message);
    res.status(422).send(err);
    return;
  }

  try {
    const compareName = await collectionParticipants.findOne({ name });
    if (compareName) {
      return res.status(409).send(`${name} já está na sala. Escolha outro nome.`);
    }

    await collectionParticipants.insertOne({
      name,
      lastStatus: Date.now()
    });
    await collectionMessages.insertOne({
      from: name,
      to: 'Todos',
      text: 'entra na sala...',
      type: 'status',
      time: time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()
    });
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
})

app.get('/participants', async (req, res) => {
  try {
    const participants = await collectionParticipants.find().toArray();
    res.status(200).send(participants);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/messages', async (req, res) => {
  const { to, text, type } = req.body;
  const { user } = req.headers;

  const validation = messageSchema.validate({ to, text, type }, { abortEarly: false });

  if (validation.error) {
    const err = validation.error.details.map((d) => d.message);
    res.status(422).send(err);
    return;
  }

  if (!user) {
    res.sendStatus(401);
    return
  }

  try {
    await collectionMessages.insertOne({
      from: user,
      to,
      text,
      type,
      time: currentTime });
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/messages', async (req, res) => {
  try {
    const messages = await collectionMessages.find().toArray();
    res.status(200).send(messages);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/status', async (req, res) => {

});


app.listen(process.env.PORT, () => console.log(`App is running on port ${process.env.PORT}`));
