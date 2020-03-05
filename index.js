const express = require('express');
const app = express();
const knex = require('knex');
const morgan = require('morgan');
const cors = require('cors');
const userRouter = require('./routers/user');
const breedingRouter = require('./routers/breeding');
require('dotenv').config();

// database
const connection = {
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA,
  },
  pool: {min: 2, max: 10},
};
exports.connection = connection;

// middleware
app.use(cors({
  origin: '*',
}));
app.use(morgan('common'));
app.use( (req, res, next) => {
  req.connection = knex(connection);
  next();
});

// routes
app.use('/user', userRouter);
app.use('/breeding', breedingRouter);

// server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
