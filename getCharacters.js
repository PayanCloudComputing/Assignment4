'use strict';

const HTTPS = require("https");
const CRYPTOJS = require("crypto-js");
const FORT = require("string_format");
const ASYNC = require("async");
const AWS = require("aws-sdk");
const LAMBDA = new AWS.Lambda({"region": "us-east-1"});

var apiKey = "b0560a548f2907a88e6395e82d0beb5c";
var privateKey = "46bfda5361fd5b7c9420498f7a490a8a80237043";
var ts = new Date().getTime();
var baseEndPoint = "https://gateway.marvel.com/";
var hash = CRYPTOJS.MD5(ts + privateKey + apiKey).toString();
var getCharactersURL = baseEndPoint + "v1/public/characters?apikey={0}&ts={1}&hash={2}&limit={3}&offset={4}";

module.exports.get = (event, context, callback) => {
  HTTPS.get(getCharactersURL.format(apiKey, ts, hash, 1, 0), (response) => {
    response.setEncoding('utf8');
    let totalData = "";
    response.on("data", (data) => {
      totalData += data;
    });
    response.on("end", (data) => {
      let res = JSON.parse(totalData);
      let total = parseInt(res["data"]["total"]);
      let iterations = Math.ceil(total/100);
      let tasks = [];
    
      for (let index = 0; index < iterations; index++) {
        let offset = index * 100;
        tasks.push(function(callback){
          let lambdaParams = {
            FunctionName : 'payan-marvel-service-dev-get-characters-chunk',
            InvocationType : 'RequestResponse',
            Payload: '{ "offset": "' + offset + '"}'
          };
          
          LAMBDA.invoke(lambdaParams, function(error, data){
            if(error){          
              callback(error);
            }
            else{
              callback(null, data);
            }
          });
        });
      }
    
      ASYNC.parallel(tasks, function(error, data){
        if(error){
          callback(error);
        }
        else{
          let marvelCharacters = [];
          for (let index = 0; index < data.length; index++) {
            marvelCharacters.push.apply(marvelCharacters, JSON.parse(data[index].Payload));
          }
          callback(null, marvelCharacters);
        }
      });      
    });
  });
};
