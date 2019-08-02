const express = require('express');
const router = new express.Router();
const Task = require('../models/tasks.js');
const auth = require('../middleware/auth.js');
// const log = console.log;

router.post('/tasks', auth, async (req, res) => {
	const task = new Task({
	  ...req.body,
		creator: req.user._id
	});
	try {
		await task.save();
		res.status(201).send(task);
	} catch(e) {
		res.status(400).send(e);
	}
});

router.get('/allTasks', auth, async (req, res) => {
	const match = {};
	const sort = {};
	if(req.query.completed) {
		match.completed = req.query.completed === 'true';
	}
	if(req.query.sortBy) {
		const parts = req.query.sortBy.split(':');
		sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
	}
	try {
	  await req.user.populate({ 
		 path: 'tasks',
         match,
		 options: {
			 limit: parseInt(req.query.limit),
			 skip: parseInt(req.query.skip),
			 sort
		 }
	  }).execPopulate();
    res.send(req.user.tasks);
	} catch(e) {
		res.status(500).send();
	}
});

router.get('/tasks/:id', auth, async (req, res) => {
	const _id = req.params.id;
	try {
		const task = await Task.findOne({ _id, creator: req.user._id });
		if (!task) {
			return res.status(404).send('Task was not created!');
		}
		res.send(task);
	} catch(e) {
		res.status(500).send();
	}
});

router.patch('/task/:id', auth, async (req, res) => {
	const taskUpdates = Object.keys(req.body);
	const allowedUpdates = ['taskDescription', 'completed'];
	const isValidTaskOperation = taskUpdates.every((update) => allowedUpdates.includes(update)); 
    if(!isValidTaskOperation) {
	  return res.status(400).send({ error: 'Invalid task updates!' });   
    }
	
	try {
		const task = await Task.findOne({ _id: req.params.id, creator: req.user._id });
		if(!task) {
			return res.status(404).send('Task does not exist!');
		}
		taskUpdates.forEach((update) => task[update] = req.body[update]);
		await task.save();
        res.status(201).send(task);
	} catch(e) {
        res.status(400).send(e); 		
	}
});

router.delete('/task/:id', auth, async (req, res) => {
	try {
	   const task = await Task.findOneAndDelete({ _id: req.params.id, creator: req.user._id }); 
	   if(!task) {
			return res.status(404).send('Task does not exist! Cannot delete task.');
		}
      res.send(task);
	} catch(e) {
	  	res.status(500).send();
	}
});
module.exports = router;