import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';
import userRouter from './routes/user.js';
import nlRouter from './routes/nl.js';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.use(apiRouter);
app.use(userRouter);
app.use(nlRouter);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Alarm API listening on http://localhost:${PORT}`);
});

