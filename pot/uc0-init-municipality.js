// Rotterdam Visitortax example using Discipl Core
// (p)2018 GPL3.0 Municipality of Rotterdam

const seedGen = require("./helpers/seedGen.js")
var tmpfile = require('./helpers/tmpfile.js')
const discipl = require('discipl-core')
const Mam = require('mam.client.js/lib/mam.node.js')
const IOTA = require('iota.lib.js');
const iotaConn = new discipl.connectors.iota(Mam, new IOTA({ provider: 'not needed' }))

const initMunicipality = async () => {
	console.log("One time initialisation : generating a DID for municipality")
	const municipalitySeed = await seedGen()
	tmpfile.logInTmpFile('municipality.seed', municipalitySeed)
	console.log("Logged generated municipality seed in file 'municipality.seed'. This is kept private at municipality devices.")
	var mamStateMunicipality  = discipl.initState(iotaConn, municipalitySeed)
	const didMunicipality = await discipl.getDid(iotaConn, mamStateMunicipality)
	console.log("Municipality DID: " + didMunicipality)
	console.log("The DID of the municipality should be published publicly and can be re-used within the lifetime of the whole solution")
	console.log("This DID is the root of the public channel of the municipality")
	tmpfile.logInTmpFile('municipality.state', JSON.stringify(mamStateMunicipality));
}

initMunicipality();