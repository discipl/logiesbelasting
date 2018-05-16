// Rotterdam Visitortax example using Discipl Core
// (p)2018 GPL3.0 Municipality of Rotterdam

const seedGen = require("./helpers/seedGen.js")
var tmpfile = require('./helpers/tmpfile.js');
const discipl = require('discipl-core')
const Mam = require('mam.client.js/lib/mam.node.js')
const IOTA = require('iota.lib.js');
const iotaConn = new discipl.connectors.iota(Mam, new IOTA({ provider: '167.99.37.75:80' }))
var CryptoJS = require('crypto-js');

const vote = async () => {
	// vote
	console.log("Voting:")
	console.log("Voting may optionally require a unique token fetched from a voting pole which afterwards is verifiably coupled to an event")
	console.log("A voting pole contains the event ref address and event seed and gives addresses from an iota address sequence as token through a QR code.")
	console.log("Afterwards, the recipient will place claims in the mam channel to validate the vote token / event coupling")
	console.log("Voting can also be done without tokens just by referencing to the event ")
	console.log("A visitor can only vote once for an event. The last vote counts")
	
	/*
	
	A note on the token generator for the voting pole: we might reuse the address generation used in IOTA for this purpose. 
	No matter how you do it: the voting pole must give out unique id's that could not be determined upfront though it must be 
	possible to validate it to be coupled to a known event. This validation must be done by the tax recipient afterwards
	or keyed hashes of the tokens should be published along with public keys used for this upfront such that the tokens can be validated. 
	In either case for all of the tokens a public claim must be made by the recipient (using the event seed).
	
	https://github.com/iotaledger/iota.lib.py/blob/master/iota/crypto/addresses.py see method: def address_from_digest(digest):
	and then https://github.com/iotaledger/kerl/tree/master/javascript for possibly a javascript implementation
	
	address_trits = [0] * (Address.LEN * TRITS_PER_TRYTE) 
	sponge = Kerl()
    sponge.absorb(eventSeed.as_trits())
    sponge.squeeze(address_trits)
	token = Address.from_trits()
	
	this seems to be available through the _newAddress method in the iota.lib api
	
	but we need this as C code. Probably usable:
	https://github.com/th0br0/iota.lib.c/blob/master/src/generate.c
	
	*/
	
	var eventSeed  = tmpfile.getFromTmpFile('event.seed')
	
	iotatoken = new IOTA()
	var  i = 0
	
	console.log('At initialising the voting pole, we iterate the address sequence list and claim the unencrypted addresses')
	try {
		i = parseInt(tmpfile.getFromTmpFile('iterator.state'))
	} catch(e) {
		i = 1 // index that is being iterated
		tmpfile.logInTmpFile('iterator.state', i)
	}
	
	pubkey = CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.random(64));
	
	token =  CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA384(iotatoken.api._newAddress(eventSeed,i,1,false), pubkey));
	var mamStateEvent = JSON.parse(tmpfile.getFromTmpFile('event.state'))
	var { mamState, message, attachResult } = await discipl.claim(iotaConn, mamStateEvent, JSON.stringify({i, token, pubkey}))
	var claimref = message.root
	var hashedtoken = token;
	console.log('registered hashed token : '+hashedtoken+' in claim : '+claimref+' along with pubkey: '+pubkey)
	

	console.log('At the voting pole, we iterate the address sequence again)')
	token =  iotatoken.api._newAddress(eventSeed,i,1,false);
	rating = Math.floor((Math.random() * Math.floor(5)) + 1).toString(); // rating 1 to 5 stars
	timestamp = 'timestamp' 
	i++
	tmpfile.logInTmpFile('iterator.state',i+"")
	
	var mamStateVisitor = JSON.parse(tmpfile.getFromTmpFile('visitor.state'))

	var { mamState, message, attachResult } = await discipl.claim(iotaConn, mamStateVisitor, JSON.stringify({token, rating, timestamp}))
	var voteref = message.root
	// Note that the API will soon include a method for attesting by reference like done above instead of keyed hashing of the claim : attestByReference();
	console.log("Placed vote : token: "+token+", rating: "+rating+" reference: "+voteref)
	var verifytoken = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA384(token, pubkey))
	console.log(hashedtoken+" == "+verifytoken)
	if(hashedtoken == verifytoken) {
		console.log("VALIDATED")
	} else {
		console.log("NOT VALID");
	}
}

vote()

