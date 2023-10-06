const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNHANDLER REJECTIONN! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
}); // đang listening uncaughtException nên phải để lên đầu

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.LOCAL_DATABASE;
// console.log(app.get('env'));
// console.log(process.env);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.conn ection);
    console.log('DB connection successful!');
  })
  .catch((err) => {
    console.log(err);
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLER REJECTIONN! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    //.close() finish all request are still pending or being handled
    process.exit(1);
  });
});
