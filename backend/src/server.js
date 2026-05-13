import 'dotenv/config';
import process from 'node:process';
import app from './app.js';

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`Unibridge backend listening on http://localhost:${port}`);
});