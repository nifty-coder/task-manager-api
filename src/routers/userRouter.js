const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const router = new express.Router();
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account.js');
const User = require('../models/users.js');
const auth = require('../middleware/auth.js');
// const log = console.log;

router.post('/users', async (req, res) => {
	const user = new User(req.body);
	try {
	    await user.save();
		sendWelcomeEmail(user.name, user.email);
    	const token = await user.genAuthToken();
		const profile = await user.getPublicProfile();
		res.status(201).send({ user: profile, token });
		
	} catch(e) {
		res.status(400).send('Cannot signup User!');
	}
});

const upload = multer({
	limits: {
	  fileSize: 1000000	
	},
	fileFilter(req, file, cb) {
		if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error('File must be an image!'));
		}
		cb(undefined, true);
	}
});
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
	const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
	req.user.avatar = buffer;
	await req.user.save();
	res.send('Uploaded Avatar!');
}, (error, req, res, next) => {
     res.status(400).send({ error: error.message });
});

router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.genAuthToken();
		const profile = await user.getPublicProfile();
		res.send({ user: profile, token });
	} catch(e) {
		res.status(400).send('Cannot login User!');
	}
});

router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
		await req.user.save();
	    res.send('You are logged out!');
	} catch(e) {
		res.status(500).send('Cannot logout!');
	}
});

router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send('All users are logged out!');
	} catch(e) {
		res.status(500).send('Cannot logout all!');
	}
});

router.get('/users/me', auth, async (req, res) => {
	res.send(req.user);
});

router.patch('/user/me', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['name', 'age', 'email', 'password'];
	const isValidOperation = updates.every((update) => allowedUpdates.includes(update)); 
    if(!isValidOperation) {
	  return res.status(400).send({ error: 'Invalid updates!' });   
    }
	
	try {
	    const profile = await req.user.getPublicProfile();
		updates.forEach((update) => req.user[update] = req.body[update]);
		await req.user.save();
       res.status(201).send(profile);
	} catch(e) {
        res.status(400).send(e); 		
	}
});

router.delete('/user/me', auth, async (req, res) => {
	try {
	   const profile = await req.user.getPublicProfile();
	  await req.user.remove(); 
	  sendCancellationEmail(req.user.name, req.user.email);
       res.send(profile);
	} catch(e) {
	  	res.status(500).send();
	}
});

router.delete('/users/me/avatar', auth, async (req, res) => {
	req.user.avatar = undefined;
	await req.user.save();
	res.send('Done!');
});

router.get('/users/:id/avatar',  async (req, res) => {
      try {
		 const user = await User.findById(req.params.id);
		 if(!user || !user.avatar) {
			 throw new Error('');
		 }
		 res.set('Content-Type', 'image/png');
		 res.send(user.avatar);
	  } catch(e) {
		  res.status(404).send('Avatar Not Found!');
	  }
});
module.exports = router;