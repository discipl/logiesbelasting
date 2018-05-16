// Rotterdam Visitortax example using Discipl Core
// (p)2018 GPL3.0 Municipality of Rotterdam

const seedGen = require("./helpers/seedGen.js")
var tmpfile = require('./helpers/tmpfile.js')
const discipl = require('discipl-core')
const Mam = require('mam.client.js/lib/mam.node.js')
const IOTA = require('iota.lib.js');
const iotaConn = new discipl.connectors.iota(Mam, new IOTA({ provider: process.env.IOTANODEURL }))

const enrollrecipient = async () => {
	
	console.log("Recipient enrollment")
	console.log("DID generation on device recipient using the recipient enrollment service:")

	const recipientSeed = await seedGen()
	tmpfile.logInTmpFile('recipient.seed', recipientSeed)
	console.log("Logged generated recipient seed in file 'recipient.seed'. This is kept private at recipient devices.")
	
	var mamStaterecipient = discipl.initState(iotaConn, recipientSeed)
	const recipient = await discipl.getDid(iotaConn, mamStaterecipient)
	console.log("recipient DID: " + recipient)
	console.log("this DID may be reused within the lifetime of the recipient wihtin this solution, probably tied to recipient devices")
	console.log("For later: This did could be logged in a IRMA wallet in the recipient device along with the recipient seed.")
	console.log("For later: The IRMA wallet could also be used to enroll the recipient with a verifiably issued IBAN/name from Idin.")
	
	console.log("Attestation done at municipality enrollment service server side (requires secret seed / mamstate of municipality):")
	var mamStateMunicipality  = JSON.parse(tmpfile.getFromTmpFile('municipality.state'));
	var {mamState, message, attachResult} = await discipl.claim(iotaConn, mamStateMunicipality, JSON.stringify({'attestedrecipient':recipient}));
	// Note that the API will soon include a method for attesting by reference like done above instead of keyed hashing of the claim : attestByReference();
	tmpfile.logInTmpFile('municipality.state', JSON.stringify(mamState));
	console.log("logged mamstate of municipality in municipality.state to be kept private at municipality device. this way we don't need to find the latest message each time");
	
	const recipientAttest = message.root;
	console.log("reference of recipient attestation by municipality: "+recipientAttest);
	console.log("this reference is given to the recipient (stored at recipient device(s))");
	tmpfile.logInTmpFile('recipient.attest', recipientAttest);
	console.log("recipient attest reference stored in file recipient.attest");
}

//console.log("Using IOTA node: "+process.env.IOTANODEURL)
enrollrecipient();