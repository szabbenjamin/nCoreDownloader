/**
 * Created by Ben on 2017. 01. 10..
 */

var log = require('./log.js');
var ncore = require('./ncore.js');
const config = require('./config.js');

log('#############    Kezdés     ##############');

var program = new ncore(config);
program.download();