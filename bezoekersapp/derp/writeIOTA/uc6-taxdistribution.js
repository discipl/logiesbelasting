// Rotterdam Visitortax example using Discipl Core
// (p)2018 GPL3.0 Municipality of Rotterdam

const seedGen = require("./helpers/seedGen.js")
var tmpfile = require('./helpers/tmpfile.js')
const discipl = require('discipl-core')
const Mam = require('mam.client.js/lib/mam.node.js')
const IOTA = require('iota.lib.js');
const iotaConn = new discipl.connectors.iota(Mam, new IOTA({ provider: '167.99.37.75:80' }))

const rate = 2 // tax is 2 euro's a night

const collecttax = async (vcdata) => {
	const attestedHotelier = 'attestedHotelier'
	const attestedVisitor = 'attestedVisitor'
	const attestedStay = 'attestedStay'
	const did = 'did'
	for(var href in vcdata) {
		if(vcdata[href] && vcdata[href][attestedHotelier]) {
			var hotelierDid = vcdata[href][attestedHotelier]['did']
			for(var vref in vcdata[href][attestedHotelier][data]) {
				if(vcdata[href][attestedHotelier][data][vref] && vcdata[href][attestedHotelier][data][vref][attestedVisitor]) {
					visitorDid = vcdata[href][attestedHotelier][data][vref][attestedVisitor]['did']
					for(sref in vcdata[href][attestedHotelier][data][vref][attestedVisitor][data]) {
						if(vcdata[href][attestedHotelier][data][vref][attestedVisitor][data][sref][attestedStay]) {
							var stayRef = vcdata[href][attestedHotelier][data][vref][attestedVisitor][data][sref][attestedStay];
							var stay = discipl.getByReference(stayRef)
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
	vcdata = discipl.exportLD(iotaConn, did);
	collecttax(vcdata)
	distributetax(vcdata)
}

taxdistribution()


