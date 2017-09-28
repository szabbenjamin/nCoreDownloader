/**
 * Created by Ben on 2017. 01. 10..
 */

"use strict";

var request = require('request');
var request = request.defaults({jar: true});
const fs = require('fs');
var jsdom = require("jsdom");
var $ = require("jquery")(jsdom.jsdom().defaultView);
const exec = require('child_process').exec;
var log = require('./log.js');

const config = require('./config.js');

class ncore {
    constructor (config) {
        this.config = config;
        this.elements = [];
        this.key = '';
    }

    login (cb) {
        log('login');
        request.post(
            'https://ncore.cc/login.php',
            {
                form: {
                    'set_lang':  'hu',
                    'submitted': 1,
                    'nev':       config.user.username,
                    'pass':      config.user.pass,
                    'submit':    'Belépés!'
                }
            },
            function (error, response, body) {
                cb();
            }
        );
    }

    collectIds (search, cb) {
        var self = this,
            elements = [];

        if (search === '') {
            return;
        }

        request.post(
            'https://ncore.cc/torrents.php',
            {
                form: {
                    'mire': search.trim(),
                    'miben': 'name',
                    'tipus': 'all_own',
                    'submit.x': 0,
                    'submit.y': 0,
                    'submit': 'Ok',
                    'tags': ''
                }
            },
            function(error, response, body) {
                if (self.key === '') {
                    let downloadUrl = $(body).closest('link[rel="alternate"]').attr('href');
                    self.key = decodeURIComponent(downloadUrl.match(/(\?|&)key\=([^&]*)/)[2]);
                }

                $(body).find('.torrent_konyvjelzo').each(function() {
                    var numb = $(this).attr('onclick').match(/\d/g);
                    var id = numb.join('');
                    elements.push(id);
                });
                $(body).find('.torrent_konyvjelzo2').each(function() {
                    var numb = $(this).attr('onclick').match(/\d/g);
                    var id = numb.join('');
                    elements.push(id);
                });
                log('Keres: "' + search.trim() + '", ' + elements.length + ' db találat');
                cb(elements);
            }
        );
    }

    download() {
        var self = this,
            sorozatok = fs.readFileSync('sorozatok').toString().split('\n'),
            allElements = [];

        this._folderInit();
        this.login(() => {
            var sorozatokInterval = setInterval(() => {
                if (sorozatok.length === 0) {
                    clearInterval(sorozatokInterval);

                    if (allElements.length > 0) {
                        self.torrentManager(allElements);
                    }
                    else {
                        log('Nincs egy új torrent sem');
                    }

                    return;
                }
                var sorozat = sorozatok.pop();
                self.collectIds(sorozat, (elements) => {
                    allElements = allElements.concat(elements);
                });
            }, 2000);

        });
    }

    torrentManager (elements) {
        var self = this;
        log('Torrentek letöltésének indítása...');
        var manager = function () {
            if (elements.length === 0) {
                log('A letöltés végetért');
                return;
            }

            var id = elements.pop();

            try {
                fs.accessSync('data/' + id);
                // log('Megvan: ' + id);
                manager();
            } catch (e) {
                var link = 'https://ncore.cc/torrents.php?action=download&id=' + id + '&key=' + self.key;
                var filename = 'torrents/' + id + '.torrent';


                var r = request(link);
                r.on('response', function(res) {
                    res.pipe(fs.createWriteStream(filename));
                });
                r.on('end', function() {
                    log('Letölt: ' + id);
                    console.log(filename);
                    if (config.transmissionEnable) {
                      self.addTransmission(filename);
                    }
                    fs.writeFileSync('data/' + id, '');
                });
                setTimeout(() => {
                    manager();
                }, 2000);
            }
        };

        manager();
    }

    addTransmission (file) {
        var cmdString = 'transmission-remote :host -n :auth -a :torrentfile -w :targetpath'
            .replace(':host', this.config.transmissionHost)
            .replace(':auth', this.config.user.username + ':' + this.config.user.pass)
            .replace(':torrentfile', file)
            .replace(':targetpath', this.config.sorozatDownloadPath);

        setTimeout(() => {
            exec(cmdString);
        }, 1000);
    }

    _folderInit () {
        try {
            fs.mkdirSync('torrents');
            fs.mkdirSync('data');
        } catch (e) {

        }
    }
}

module.exports = ncore;
