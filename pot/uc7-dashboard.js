// Rotterdam Visitortax example using Discipl Core
// (p)2018 GPL3.0 Municipality of Rotterdam

const seedGen = require("./helpers/seedGen.js")
var tmpfile = require('./helpers/tmpfile.js')
const discipl = require('discipl-core')
const Mam = require('mam.client.js/lib/mam.node.js')
const IOTA = require('iota.lib.js');
const iotaObj = new IOTA({ provider: process.env.IOTANODEURL })
iotaObj.api.getNodeInfo((error, success) => {
  if (error) {
    console.log(error)
  } else {
    console.log(success)
  }
})

const iotaConn = new discipl.connectors.iota(Mam, iotaObj)



const ldexport = async () => {
	const municipalitySeed = tmpfile.getFromTmpFile('municipality.seed');
	var mamStateMunicipality  = discipl.initState(iotaConn, municipalitySeed)
	
	var did = discipl.getDid(iotaConn, mamStateMunicipality)
	
	console.log('Reading linked verifiable claims data from discipl platform starting at claims from municipality did: '+did);
	vcdata = await discipl.exportLD(iotaConn, did)
	
	console.log(JSON.stringify(vcdata))
}

ldexport()


