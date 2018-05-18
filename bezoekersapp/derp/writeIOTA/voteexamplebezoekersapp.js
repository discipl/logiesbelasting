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
    eventrating = rating; // rating wordt uit de app gehaald
    timestamp = 'timestamp' //Timestamp in unix-tijd

    var mamStateVisitor = JSON.parse('{"subscribed":[],"channel":{"side_key":null,"mode":"public","next_root":"FODDHV9FRQMFCOPOETOWFUNJYCVQVFUVJILQBCTNFDZXBUIFFTDCQYKKPQXPGAKIHT9SIXAGJRHBFYAQF","security":2,"start":1,"count":1,"next_count":1,"index":0},"seed":"AVEGUQJTV9ZWNVVRRVTVKERVUPWFJNLXVAO9NZIPIYFUOSUC9IFONSJCQPCXJYOLR9LYS9ALTILXAMYMJ"}') //Voorbeeldgebruiker voor x aantal dagen

    var { mamState, message, attachResult } = await discipl.claim(iotaConn, mamStateVisitor, JSON.stringify({eventnumber, rating, timestamp}))
    var voteref = message.root
}
