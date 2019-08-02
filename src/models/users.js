const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../models/tasks.js');
const log = console.log;

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	email: {
	   type: String,
	   required: true,
	   trim: true,
	   lowercase: true,
	   unique: true,
	   validate(value) {
		   if(!validator.isEmail(value)) {
		   throw new Error('Email invalid');	  
		 }
	   }
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
		trim: true,
		validate(value) {
			if(value.toLowerCase().includes("password")) {
			   throw new Error('The password cannot contain "password"');
			}
		}
	},
	age: { 
		type: Number,
		default: 0,
		validate(value) {
			if(value < 0) {
				throw new Error('Age must be positive number');
			}
		}
	},
	avatar: {
	   type: Buffer
	}, 
   tokens: [{
	   token: {
		   type: String,
		   required: true
	   }
   }]
}, {
  timestamps: true	
});
userSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id',
	foreignField: 'creator'
});
// define our own methods
userSchema.methods.getPublicProfile = function () {
  const profileObject = this.toObject();
  delete profileObject.password;
  delete profileObject.tokens;
  delete profileObject.avatar;
  return profileObject;
};
userSchema.methods.genAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET);
	user.tokens = user.tokens.concat({ token });
	await user.save();
    return token;
};
// define our own static function
userSchema.statics.findByCredentials = async (email, password) => {
  	const user = await User.findOne({ email });
	if(!user) {
		throw new Error('Cannot login');
	}
	const isMatch = await bcrypt.compare(password, user.password);
	if(!isMatch) {
		throw new Error('Cannot login');
	}
    return user;
};
// Hash plain text password before saving user
userSchema.pre('save', async function (next)  {
	const user = this;
	
	if(user.isModified('password')) {
	     user.password = await bcrypt.hash(user.password, 8);
    }
	
	next();
});
userSchema.pre('remove', async function (next)  {
	const user = this;
	await Task.deleteMany({ creator: user._id });
	next();
});
const User = mongoose.model('User', userSchema);

module.exports = User;