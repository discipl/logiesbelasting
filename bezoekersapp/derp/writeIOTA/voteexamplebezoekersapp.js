// Rotterdam Visitortax example using Discipl Core
// (p)2018 GPL3.0 Municipality of Rotterdam

const seedGen = require("./helpers/seedGen.js") //Niet nodig
var tmpfile = require('./helpers/tmpfile.js');
const discipl = require('discipl-core')
const Mam = require('mam.client.js/lib/mam.node.js')
const IOTA = require('iota.lib.js');
const iotaConn = new discipl.connectors.iota(Mam, new IOTA({ provider: 'http://167.99.37.75:80' }))
var CryptoJS = require('crypto-js');

const vote = async () => {

    eventnumber = 1; //Uit eventpaal
    rating = myRating; // myRating wordt uit de app gehaald
    timestamp = 'timestamp' //Timestamp in unix-tijd

    var mamStateVisitor = JSON.parse(tmpfile.getFromTmpFile('visitor.state')) //Voorbeeldgebruiker voor x aantal dagen

    var { mamState, message, attachResult } = await discipl.claim(iotaConn, mamStateVisitor, JSON.stringify({eventnumber, rating, timestamp}))
    var voteref = message.root
    var verifytoken = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA384(token, pubkey)) //Pop-up message op app voor verificatie?
}

vote()
