**nCore.cc sorozatletöltő**

Az általad megadott lista alapján végigscanneli az oldalon található torrenteket, letölti és hozzáadja a transmission-daemon queue listába.

**Telepítés:**

Töltsd le és telepítsd a legújabb nodejs futtatókörnyezetet:

https://nodejs.org/en/

`git clone https://github.com/szabbenjamin/nCoreDownloader`

`cp config.js.sample config.js`

`cp sorozatok.sample sorozatok`


**Beállítás**

A config.js-ben add meg a bejelentkezési adataidat, a letöltési helyet és a transmission-daemon elérési útvonalát

sorozatok fájlba soronként írd össze amire amúgy is keresnél az oldalon.

**Példák:**

castle s07 1080p

silicon valley 720p hun

big bang theory hun 1080p

heti hetes 1080i

halt and catch fire 1080p

showder klub 1080 s18

mars s01 720


**Végül futtatás:**

`nodejs download.js`