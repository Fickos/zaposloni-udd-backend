const { DB_URI, DB_NAME } = require('../config');

const mongoose = require('mongoose');

mongoose.connect(`${DB_URI}/${DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});
