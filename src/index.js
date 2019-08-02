const express = require('express');
require('./db/mongoose.js');
const app = express();
const port = process.env.PORT;
const userRouter = require('./routers/userRouter.js');
const taskRouter = require('./routers/taskRouter.js');
const log = console.log;

app.use(express.json());

app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
	log('server is up on ' + port);
});