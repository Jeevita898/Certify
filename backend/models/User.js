const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
{
email:{ type:String, required:true, unique:true, lowercase:true, trim:true },

password:{ type:String, required:true, minlength:8 },

role:{
type:String,
enum:['student','faculty','admin'],
required:true
},

// Student fields
firstName:{ type:String, trim:true },
lastName:{ type:String, trim:true },

usn:{ type:String, trim:true, uppercase:true },

department:{ type:String, trim:true },

facultyId:{
type: mongoose.Schema.Types.ObjectId,
ref:'User',
default:null
},

totalPoints:{ type:Number, default:0 },

// Faculty/Admin fields
name:{ type:String, trim:true },

empId:{ type:String, trim:true },

phone:{ type:String, default:'' },

avatarUrl:{ type:String, default:'' },

isActive:{ type:Boolean, default:true }

},
{ timestamps:true }
);

// Hash password
userSchema.pre('save', async function(next){
if(!this.isModified('password')) return next();

this.password = await bcrypt.hash(this.password,12);
next();
});

// Compare password
userSchema.methods.matchPassword = async function(entered){
return bcrypt.compare(entered,this.password);
};

// Full name
userSchema.virtual('fullName').get(function(){

if(this.role === 'student'){
return `${this.firstName} ${this.lastName}`;
}

return this.name;

});

// Remove password
userSchema.set('toJSON',{
virtuals:true,
transform:(doc,ret)=>{
delete ret.password;
return ret;
}
});

module.exports = mongoose.model('User', userSchema);