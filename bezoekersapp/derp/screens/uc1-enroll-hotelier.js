// Rotterdam Visitortax example using Discipl Core
// (p)2018 GPL3.0 Municipality of Rotterdam

const seedGen = require("./helpers/seedGen.js")
var tmpfile = require('./helpers/tmpfile.js')
const discipl = require('discipl-core')
const Mam = require('mam.client.js/lib/mam.node.js')
const IOTA = require('iota.lib.js');
const iotaObj = new IOTA({ provider: process.env.IOTANODEURL })
const iotaConn = new discipl.connectors.iota(Mam, iotaObj)


const enrollHotelier = async () => {
	console.log("Hotelier enrollment")
	console.log("DID generation on device hotelier using the hotelier enrollment service:")
	debugger;
	const hotelierSeed = await seedGen()
	tmpfile.logInTmpFile('hotelier.seed', hotelierSeed)
	console.log("Logged generated hotelier seed in file 'hotelier.seed'. This is kept private at hotelier devices.")
	
	var mamStateHotelier = discipl.initState(iotaConn, hotelierSeed)
	const hotelier = await discipl.getDid(iotaConn, mamStateHotelier)
	console.log("hotelier DID: " + hotelier)
	console.log("this DID may be reused within the lifetime of the hotelier wihtin this solution, probably tied to hotelier devices")
	console.log("For later: This did could be logged in a IRMA wallet in the Hotelier device along with the hotelier seed.")
	console.log("For later: The IRMA wallet could also be used to enroll the hotelier with a verifiably issued IBAN/name from Idin.")
	
	console.log("Attestation done at municipality enrollment service server side (requires secret seed of municipality):")
	const municipalitySeed = tmpfile.getFromTmpFile('municipality.seed');
	var mamStateMunicipality  = discipl.initState(iotaConn, municipalitySeed);
	var {mamState, message, attachResult} = await discipl.claim(iotaConn, mamStateMunicipality, JSON.stringify({'attestedHotelier':hotelier}));
	// Note that the API will soon include a method for attesting by reference like done above instead of keyed hashing of the claim : attestByReference();
	tmpfile.logInTmpFile('municipality.state', JSON.stringify(mamState));
	console.log("logged mamstate of municipality in municipality.state to be kept private at municipality device. this way we don't need to find the latest message each time");
	
	const hotelierAttest = message.root;
	console.log("reference of hotelier attestation by municipality: "+hotelierAttest);
	console.log("this reference is given to the hotelier (stored at hotelier device(s))");
	tmpfile.logInTmpFile('hotelier.attest', hotelierAttest);
	tmpfile.logInTmpFile('hotelier.state', JSON.stringify(mamStateHotelier));
	console.log('logged hotelierAttest in hotelier.attest and hotelierMamState in hotelier.state (to be held at hotelier devices)');
}

console.log("Using IOTA node: "+process.env.IOTANODEURL)
iotaObj.api.getNodeInfo((error, success) => {
  if (error) {
    console.log(error)
	process.exit(1)
  } else {
    console.log(success)
	enrollHotelier();
  }
})