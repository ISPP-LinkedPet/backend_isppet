const express = require('express');
const knex = require('knex');
const morgan = require('morgan');
const cors = require('cors');
const fileUpload = require('express-fileupload');
require('dotenv').config();

// routers
const breedingRouter = require('./routers/breeding');
const particularRouter = require('./routers/particular');
const shelterRouter = require('./routers/shelter');
const adoptionRouter = require('./routers/adoption');
const authRouter = require('./routers/auth');
const publicationRouter = require('./routers/publication');
const vetRouter = require('./routers/vet');
const requestRouter = require('./routers/request');
const reviewRouter = require('./routers/review');
const paymentRouter = require('./routers/payment');
const adRouter = require('./routers/ad');
const petRouter = require('./routers/pet');
const administratorRouter = require('./routers/administrator');
const userRouter = require('./routers/user');

const app = express();

const config = {
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA,
  },
  pool: {min: 1, max: 5, idleTimeoutMillis: 2000},
};
exports.config = config;
const connection = knex(config);

// middleware
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(fileUpload());
app.use(
    cors({
      origin: '*',
    }),
);
app.use(morgan('common'));
app.use((req, res, next) => {
  req.connection = connection;
  next();
});

// routers
app.use('/breeding', breedingRouter);
app.use('/particular', particularRouter);
app.use('/auth', authRouter);
app.use('/shelter', shelterRouter);
app.use('/adoption', adoptionRouter);
app.use('/publication', publicationRouter);
app.use('/vet', vetRouter);
app.use('/request', requestRouter);
app.use('/payment', paymentRouter);
app.use('/review', reviewRouter);
app.use('/ad', adRouter);
app.use('/pet', petRouter);
app.use('/administrator', administratorRouter);
app.use('/user', userRouter);

// Ruta pública para acceder a las imágenes
app.use(express.static('public'));

// server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
