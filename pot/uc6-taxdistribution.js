// Rotterdam Visitortax example using Discipl Core
// (p)2018 GPL3.0 Municipality of Rotterdam

const seedGen = require("./helpers/seedGen.js")
var tmpfile = require('./helpers/tmpfile.js')
const discipl = require('discipl-core')
const Mam = require('mam.client.js/lib/mam.node.js')
const IOTA = require('iota.lib.js');
const iotaConn = new discipl.connectors.iota(Mam, new IOTA({ provider: process.env.IOTANODEURL }))

const rate = 2 // tax is 2 euro's a night

const collecttax = async (vcdata) => {
	const attestedHotelier = 'attestedHotelier'
	const attestedVisitor = 'attestedVisitor'
	const attestedStay = 'attestedStay'
	const data = 'data'
	const did = 'did'
	for(var href in vcdata) {
		if(vcdata[href] && vcdata[href][attestedHotelier]) {
			var hotelierDid = vcdata[href][attestedHotelier]
			for(var vref in vcdata[href][data]) {
				if(vcdata[href][data][vref] && vcdata[href][data][vref][attestedVisitor]) {
					visitorDid = vcdata[href][data][vref][attestedVisitor]
					for(sref in vcdata[href][data][vref][data]) {
						if(vcdata[href][data][vref][data][sref][attestedStay]) {
							var stayRef = vcdata[href][data][vref][data][sref][attestedStay];
							var stay = await discipl.getByReference(iotaConn, stayRef)
							stay = JSON.parse(stay);
							var amount = rate * parseInt(stay.duration)
							console.log('Collecting EU '+amount+',- (EU '+rate+',- per night) from IBAN of hotelier: '+hotelierDid+' because of stay (reference: '+stayRef+') of visitor: '+visitorDid+' starting at '+stay.startdate+' for the duration of '+stay.duration+' nights');
							console.log('Once tax has been collected succesfully, the stay (reference: '+stayRef+') is attested by the municipality which prevents collecting multiple times');
						}
					}
				}
			}
		}
	}
}

const distributetax = async (vcdata) => {
	// analog to collecttax
}

const taxdistribution = async () => {
	const municipalitySeed = tmpfile.getFromTmpFile('municipality.seed');
	var mamStateMunicipality  = discipl.initState(iotaConn, municipalitySeed)
	
	var did = discipl.getDid(iotaConn, mamStateMunicipality)
	
	console.log('Reading linked verifiable claims data from discipl platform starting at claims from municipality did: '+did);
	vcdata = await discipl.exportLD(iotaConn, did);

	collecttax(vcdata)
	distributetax(vcdata)
}

taxdistribution()


