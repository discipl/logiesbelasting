// Rotterdam Visitortax example using Discipl Core
// (p)2018 GPL3.0 Municipality of Rotterdam

const seedGen = require("./helpers/seedGen.js")
var tmpfile = require('./helpers/tmpfile.js')
const discipl = require('discipl-core')
const Mam = require('mam.client.js/lib/mam.node.js')
const IOTA = require('iota.lib.js');
const iotaConn = new discipl.connectors.iota(Mam, new IOTA({ provider: process.env.IOTANODEURL }))
var CryptoJS = require('crypto-js');

const rate = 2 // tax is 2 euro's a night

const collecttax = async (vcdata) => {
	const attestedHotelier = 'attestedHotelier'
	const attestedVisitor = 'attestedVisitor'
	const attestedStay = 'attestedStay'
	const data = 'data'
	var totalamount = 0
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
							totalamount += amount
						}
					}
				}
			}
		}
	}
	return totalamount
}

const validateVote = async (sref, tokens) => {
	debugger
	for(t in tokens) {
		var verifytoken = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA384(sref.vote, tokens[t].pubkey))
		if(verifytoken == t) {
			tokens[t].rating = sref.rating
			tokens[t].ts = sref.ts
			return tokens[t]
		}
	}
	return false
}

const distributetax = async (vcdata, totalamount) => {
	const attestedHotelier = 'attestedHotelier'
	const attestedVisitor = 'attestedVisitor'
	const vote = 'vote'
	const data = 'data'
	const attestedRecipient = 'attestedRecipient'
	const attestedEvent = 'attestedEvent'
	const token = 'token'
	
	// build array of hashed tokens mapped to recipients
	var tokens = []
	var score = []
	var totalscore = 0
	for(var rref in vcdata) {
		if(vcdata[rref] && vcdata[rref][attestedRecipient]) {
			var recipientDid = vcdata[rref][attestedRecipient]
			console.log("recipient: "+recipientDid);
			score[recipientDid] = 0
			for(var eref in vcdata[rref][data]) {
				if(vcdata[rref][data][eref] && vcdata[rref][data][eref][attestedEvent]) {
					var eventDid = vcdata[rref][data][eref][attestedEvent]
					console.log("event: "+eventDid)
					for(vref in vcdata[rref][data][eref][data]) {
						if(vcdata[rref][data][eref][data][vref][token]) {
							var t = vcdata[rref][data][eref][data][vref]
							console.log('found voting token '+t.token)
							t.recipient = recipientDid
							t.eventt = eventDid
							tokens[t.token] = t
						}
					}
				}
			}
		}
	}
	
	// process votes
	var visitorVotes = []
	var dashboardXML = "<ratingeventlijst>\n";
	for(var href in vcdata) {
		if(vcdata[href] && vcdata[href][attestedHotelier]) {
			var hotelierDid = vcdata[href][attestedHotelier]
			for(var vref in vcdata[href][data]) {
				if(vcdata[href][data][vref] && vcdata[href][data][vref][attestedVisitor]) {
					visitorDid = vcdata[href][data][vref][attestedVisitor]
					for(sref in vcdata[href][data][vref][data]) {
						if(vcdata[href][data][vref][data][sref][vote]) {
							var t = await validateVote(vcdata[href][data][vref][data][sref], tokens)
							if(t && t.eventt && (visitorVotes[visitorDid] != t.eventt)) {
								console.log('visitor '+visitorDid+' voted sucessfully for event '+t.eventt+' with rating: '+t.rating+' at '+t.ts+'.')
								dashboardXML += "\t<startrating><event>"+t.eventt+'</event><rating>'+t.rating+'</rating><timestamp>'+t.ts+"</timestamp></startrating>\n";
								score[t.recipient] += parseInt(t.rating)
								totalscore += parseInt(t.rating)
								visitorVotes[t.eventt] = true
								console.log('Recipient '+t.recipient+' now gets '+score[t.recipient]+' / '+totalscore+' of the total amount of tax contributed by the voters')
							} else {
								console.log('invalid vote found for visitor: '+visitorDid+' '+t)
							}
						}
					}
				}
			}
		}
	}
	dashboardXML += "</ratingeventlijst>\n";
	
	// process score
	for(rec in score) {
		var grant = totalamount * score[rec] / totalscore
		console.log('Recipient '+rec+' receives EU '+grant+' on its IBAN');
	}
	
	tmpfile.logInTmpFile('dashboard.xml', dashboardXML);
	console.log('Stored	dashboard rating information in dashboard.xml...');
}

const taxdistribution = async () => {
	const municipalitySeed = tmpfile.getFromTmpFile('municipality.seed');
	var mamStateMunicipality  = discipl.initState(iotaConn, municipalitySeed)
	
	var did = discipl.getDid(iotaConn, mamStateMunicipality)
	
	console.log('Reading linked verifiable claims data from discipl platform starting at claims from municipality did: '+did);
	vcdata = await discipl.exportLD(iotaConn, did);

	var amount = await collecttax(vcdata)
	await distributetax(vcdata, amount)
}

taxdistribution()


