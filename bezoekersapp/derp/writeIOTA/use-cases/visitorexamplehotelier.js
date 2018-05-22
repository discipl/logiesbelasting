// Rotterdam Visitortax example using Discipl Core
// (p)2018 GPL3.0 Municipality of Rotterdam

const seedGen = require("../helpers/seedGen.js")
var tmpfile = require('../helpers/tmpfile.js')
const discipl = require('discipl-core')
const Mam = require('mam.client.js/lib/mam.node.js')
const IOTA = require('iota.lib.js');
const iotaConn = new discipl.connectors.iota(Mam, new IOTA({ provider: 'http://167.99.37.75:80' }))

const enrollvisitor = async () => {
	
	const visitorSeed = await seedGen()
	//tmpfile.logInTmpFile('visitor.seed', visitorSeed) //Privé naar app verstuurd
	var mamStateVisitor = discipl.initState(iotaConn, visitorSeed)

	var numberOfDays = 1000 //Uit het inlogscherm
	const visitor = await discipl.getDid(iotaConn, mamStateVisitor)
	const duration = numberOfDays.toString(); // numberOfDays -> String
	const startdate = (new Date()).toJSON().slice(0, 19).replace(/[-T]/g, ':'); //Startdatum uit hotelier hardware?
	
	var mamStateHotelier = JSON.parse(tmpfile.getFromTmpFile('hotelier.state')); //Gegenereerd bij het registreren van de hotelier (uc1)
	var hotelierAttest = tmpfile.getFromTmpFile('hotelier.attest'); //Gegenereerd bij het registreren van de hotelier (uc1)

	var { mamState, message, attachResult } = await discipl.claim(iotaConn, mamStateHotelier, JSON.stringify({'attestedVisitor':visitor}));
	visitorAttest = message.root

	var { mamState, message, attachResult } = await discipl.claim(iotaConn, mamStateHotelier, JSON.stringify({startdate, duration, visitorAttest, hotelierAttest}));
	stayref = message.root //Claims van de hotelier; attesteert de visitor en zijn verblijf

	//EINDE CLAIMS OP DE HOTELIERHARDWARE
	//Stuur ID, visitor.seed, visitor.state en stayref via QR door naar app (misschien ook startdatum/aantal dagen voor verificatie)
	//START CLAIM OP DE VISITOR APP

	var { mamState, message, attachResult } = await discipl.claim(iotaConn, mamStateVisitor, JSON.stringify({"attestedStay":stayref}));
	stayAttest = message.root //Claims van de visitor;
	
	tmpfile.logInTmpFile('visitor.state', JSON.stringify(mamStateVisitor)); //Opgeslagen op visitor app
}

enrollvisitor()
