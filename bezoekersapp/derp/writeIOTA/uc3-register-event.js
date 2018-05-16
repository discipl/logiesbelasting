// Rotterdam Visitortax example using Discipl Core
// (p)2018 GPL3.0 Municipality of Rotterdam

const seedGen = require("./helpers/seedGen.js")
var tmpfile = require('./helpers/tmpfile.js');
const discipl = require('discipl-core')
const Mam = require('mam.client.js/lib/mam.node.js')
const IOTA = require('iota.lib.js');
const iotaConn = new discipl.connectors.iota(Mam, new IOTA({ provider: 'http://167.99.37.75:80' }))

const registerevent = async () => {
	console.log("Register Event")
	
	const eventSeed = await seedGen()
	tmpfile.logInTmpFile('event.seed', eventSeed)
	console.log("Logged generated event seed in file 'event.seed'. This is kept private at recipient devices (including in voting poles coupled to this event).")
	
	var mamStateEvent  = discipl.initState(iotaConn, eventSeed)
	const didEvent = await discipl.getDid(iotaConn, mamStateEvent)
	console.log("event DID: " + didEvent)
	console.log("the DID of an event is published publicly and can be re-used within this use case")
	const recipientAttest = tmpfile.getFromTmpFile('recipient.attest')
	const name = 'My Event';
	const description = 'Party @ De Rotterdam';
	var { mamState, message, attachResult } = await discipl.claim(iotaConn, mamStateEvent, JSON.stringify({didEvent, name, description, recipientAttest}))
	const eventref = message.root
	console.log('Event reference: '+eventref);
	tmpfile.logInTmpFile('event.state', JSON.stringify(mamStateEvent));
}

registerevent()
