// Include the event model
var Event = require('../models/events')

// Create a new event
var createEvent = function(req, res){

	var newEvent = new Event({
	
		name : req.body.name,
		date : +req.body.date,
		time : +req.body.time,
		description : req.body.description,
		location : req.body.location,
		tasks : req.body.tasks.split(', '),
		invites : req.body.invites.split(', '),
		recurring : req.body.recurring === "true" ? true : false

	})

	newEvent.save(function(err, doc){
		res.send(doc)
	})
}

var findEvents = function(req, res){
		Event.find({}, function(err, docs){
			res.send(docs)
		})

	}

module.exports = {
	createEvent : createEvent,
	findEvents : findEvents
}

