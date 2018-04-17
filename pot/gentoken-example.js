// Rotterdam Visitortax example using Discipl Core
// (p)2018 GPL3.0 Municipality of Rotterdam

const IOTA = require('iota.lib.js');

const genTokens = async () => {
	
	const iota = new IOTA(); // no connection needed
	const eventSeed = "MUKNC9LPFFTVGNG9OACLGRLRCPSZEZQPNSODGMY9LLQAXASCJQMX99OAHIXCIHPBCNFLPIPPQYUBMMUXX" 

	const token1 = iota.api._newAddress(eventSeed,0,1,false);
	console.log("DID1: " + token1)
	const token2 = iota.api._newAddress(eventSeed,1,1,false);
	console.log("DID2: " + token2)
	const token3 = iota.api._newAddress(eventSeed,2,1,false);
	console.log("DID3: " + token3)

}

genTokens();