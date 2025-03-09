const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('ENCAUGHT EXCEPTION!!💥 Shutting down');
  console.log(err.name, err.message);
  console.log(err.stack);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => console.log('\n\n\n Connection DB ✅')); // con.connection, '\n\n\n Connection DB ✅'

const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  console.log(`👉 Получен запрос: ${req.method} ${req.url}`);
  next();
});

const server = app.listen(port, () => {
  console.log('app running on port - ', port);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION! Shutting down');
  server.close(() => {
    process.exit(1);
  });
});
