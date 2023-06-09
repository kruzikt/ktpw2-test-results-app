const mongoose = require('mongoose');
const Comment = require('../models/comment');

mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose
  .connect('mongodb://127.0.0.1:27017/testsKTPW2')
  .catch((err) => console.log(err));

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));

db.once('open', () => {
  console.log('Database connected');
});

const tests = [
  {
    title: 'test1',
    description: 'description how to do this test...',
  },
  {
    title: 'test2',
    description: 'description how to do this test...',
  },
  {
    title: 'test3',
    description: 'description how to do this test...',
  },
  {
    title: 'test4',
    description: 'description how to do this test...',
  },
];

const seedDB = async () => {
  await Test.insertMany(tests);
};

seedDB()
  .then(() => {
    mongoose.connection.close();
    console.log('Writing to DB successful, DB disconnected');
  })
  .catch((err) => {
    console.log('error while writing to DB');
  });
