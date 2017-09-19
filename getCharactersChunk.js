'use strict';

const HTTPS = require("https");
const CRYPTOJS = require("crypto-js");
const FORT = require("string_format");

var apiKey = "b0560a548f2907a88e6395e82d0beb5c";
var privateKey = "46bfda5361fd5b7c9420498f7a490a8a80237043";
var ts = new Date().getTime();
var baseEndPoint = "https://gateway.marvel.com/";
var hash = CRYPTOJS.MD5(ts + privateKey + apiKey).toString();
var getCharactersURL = baseEndPoint + "v1/public/characters?apikey={0}&ts={1}&hash={2}&limit={3}&offset={4}";

module.exports.get = (event, context, callback) => {
  HTTPS.get(getCharactersURL.format(apiKey, ts, hash, 100, event.offset), (response) => {
    response.setEncoding('utf8');
    let totalData = "";
    response.on("data", (data) => {
      totalData += data;
    });
    response.on("end", (data) => {
      let res = JSON.parse(totalData);
      let marvelCharacters = getCharactersNames(res);
      callback(null, marvelCharacters);
    });
  });

  function getCharactersNames(res) {
    let characterObjects = res["data"]["results"];
    let marvelCharacters = [];
    characterObjects.forEach((object) => {
      marvelCharacters.push({
        "id": object.id,
        "name": object.name
      });
    });
    return marvelCharacters;
  }
}
