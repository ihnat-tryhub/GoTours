const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
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

// console.log(process.env);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('app running on port - ', port);
});
