const mongoose = require('mongoose');
mongoose.connect(process.env.CONNECTION, {
useNewUrlParser: true,
useCreateIndex: true, 
useFindAndModify: false
});