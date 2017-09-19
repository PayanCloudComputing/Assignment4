'use strict';

const HTTPS = require("https");
const CRYPTOJS = require("crypto-js");
const FORT = require("string_format");

var apiKey = "b0560a548f2907a88e6395e82d0beb5c";
var privateKey = "46bfda5361fd5b7c9420498f7a490a8a80237043";
var ts = new Date().getTime();
var baseEndPoint = "https://gateway.marvel.com/";
var hash = CRYPTOJS.MD5(ts + privateKey + apiKey).toString();
var getCharacterComicsURL = baseEndPoint + "v1/public/characters/{0}/comics?apikey={1}&ts={2}&hash={3}&limit={4}&offset={5}";

module.exports.get = (event, context, callback) => {
  HTTPS.get(getCharacterComicsURL.format(event.id, apiKey, ts, hash, 100, event.offset), (response) => {
    response.setEncoding('utf8');
    let totalData = "";
    response.on("data", (data) => {
      totalData += data;
    });
    response.on("end", (data) => {
      let res = JSON.parse(totalData);
      let characterComics = getComicsNames(res);
      callback(null, characterComics);
    });
  });
  
  function getComicsNames(res) {
    let comicObjects = res["data"]["results"];
    let characterComics = [];
    comicObjects.forEach((object) => {
      characterComics.push({
        "id": object.id,
        "title": object.title
      });
    });
    return characterComics;
  }
}
