const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const db = require('./db/index');
const cors = require('cors');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const jobRoutes = require('./routes/job-routes');
const applicationRoutes = require('./routes/application-routes');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('uploads'));
app.use(authRoutes);
app.use(profileRoutes);
app.use(jobRoutes);
app.use(applicationRoutes);
const { User, Job, Application } = require('./db/models');

db.authenticate()
  .then(() => {
    console.log('Database connected');
    return db.sync();
  })
  .then(() => {
    console.log('Database Synced');
  })
  .catch(err => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log('App is running @localhost 3000');
});
