var mongoose = require('mongoose')

var eventSchema = mongoose.Schema({

	name        : {type : String},
	date        : {type : Number},
	time        : {type : Number},
	description : {type : String},
	location    : {type : String},
	tasks       : {type : Array},
	invites     : {type : Array},
	recurring   : {type : Boolean},
	type 		: {type : String},
	host		: {type : String}

})

module.exports = mongoose.model('Event', eventSchema)