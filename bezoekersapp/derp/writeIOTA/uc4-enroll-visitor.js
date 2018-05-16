// Rotterdam Visitortax example using Discipl Core
// (p)2018 GPL3.0 Municipality of Rotterdam

const seedGen = require("./helpers/seedGen.js")
var tmpfile = require('./helpers/tmpfile.js')
const discipl = require('discipl-core')
const Mam = require('mam.client.js/lib/mam.node.js')
const IOTA = require('iota.lib.js');
const iotaConn = new discipl.connectors.iota(Mam, new IOTA({ provider: 'http://167.99.37.75:80' }))

const enrollvisitor = async () => {
	console.log("Visitor enrollment")
	console.log("DID generation on device visitor or hotelier device using the visitor enrollment service:")
	
	const visitorSeed = await seedGen()
	tmpfile.logInTmpFile('visitor.seed', visitorSeed)
	console.log("Logged generated visitor seed in file 'visitor.seed'. This is kept private at visitor devices.")
	
	var mamStateVisitor = discipl.initState(iotaConn, visitorSeed)
	const visitor = await discipl.getDid(iotaConn, mamStateVisitor)
	console.log("visitor DID: " + visitor)
	console.log("this DID may be reused within this use case (a DID for each stay)")
	const duration = Math.floor((Math.random() * Math.floor(10))+1).toString(); // 1 to 10 days
	const startdate = (new Date()).toJSON().slice(0, 19).replace(/[-T]/g, ':');
	console.log("in this example this visitor stays for "+duration+" (duration) nights starting on "+startdate+" (startdate)");
	
	var mamStateHotelier = JSON.parse(tmpfile.getFromTmpFile('hotelier.state'));
	var hotelierAttest = tmpfile.getFromTmpFile('hotelier.attest');

	var { mamState, message, attachResult } = await discipl.claim(iotaConn, mamStateHotelier, JSON.stringify({'attestedVisitor':visitor}));
	// Note that the API will soon include a method for attesting by reference like done above instead of keyed hashing of the claim : attestByReference();
	visitorAttest = message.root
	console.log("Hotelier attested visitor. Reference: "+visitorAttest);

	var { mamState, message, attachResult } = await discipl.claim(iotaConn, mamStateHotelier, JSON.stringify({startdate, duration, visitorAttest, hotelierAttest}));
	// Note that the API will soon include a method for attesting by reference like done above instead of keyed hashing of the claim : attestByReference();
	stayref = message.root
	console.log("Hotelier claimed stay (startdate, duration, reference to visitor and hotelier attest). Reference: "+stayref);

	var { mamState, message, attachResult } = await discipl.claim(iotaConn, mamStateVisitor, JSON.stringify({"attestedStay":stayref}));
	// Note that the API will soon include a method for attesting by reference like done above instead of keyed hashing of the claim : attestByReference();
	stayAttest = message.root
	console.log("Visitor attested stay claim (on its own device when possible). Reference: "+stayAttest)
	
	tmpfile.logInTmpFile('visitor.state', JSON.stringify(mamStateVisitor));
	console.log('logged visitorMamState in visitor.state (to be held at visitor device)');
}

enrollvisitor()
