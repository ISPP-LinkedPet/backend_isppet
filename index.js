const express = require('express');
const app = express();
const knex = require('knex');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
// routers
const breedingRouter = require('./routers/breeding');
const shelterRouter = require('./routers/shelter');
const adoptionRouter = require('./routers/adoption');
const authRouter = require('./routers/auth');
const publicationRouter = require('./routers/publication');
const vetRouter = require('./routers/vet');
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
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(
    cors({
      origin: '*',
    }),
);
app.use(morgan('common'));
app.use((req, res, next) => {
  req.connection = knex(connection);
  next();
});

// routers
app.use('/breeding', breedingRouter);
app.use('/auth', authRouter);
app.use('/shelter', shelterRouter);
app.use('/adoption', adoptionRouter);
app.use('/publication', publicationRouter);
app.use('/vet', vetRouter);
// server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
