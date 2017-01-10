/**
 * Created by Ben on 2017. 01. 10..
 */

"use strict"

const console_log = true;
const fs = require('fs');

var log = function (input) {
    input = (new Date()).toString() + ' # ' + input;

    fs.appendFile('log.log', input + '\r\n', () => {});
    if (console_log) {
        console.log(input);
    }
};

module.exports = log;