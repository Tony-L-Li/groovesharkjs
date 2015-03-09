var MD5 = require("crypto-js/hmac-md5");
var https = require("https");

var secret = '';
var wsKey = '';
var url = "api.grooveshark.com";
var country = {};
var sessionId = '';

var signature = function (message) {
  return MD5(message, secret).toString();
};
var apiCall = function (method, parameters, callback) {
  if (typeof parameters === 'undefined') {
    parameters = {}
  };
  var data = {
    method: method,
    parameters: parameters,
    header: {
      wsKey: wsKey
    }
  };
  if (sessionId != '') {
    data.header.sessionID = sessionId;
  }
  var dataStr = JSON.stringify(data);
  var sig = signature(dataStr);
  var options = {
    host: url,
    path: '/ws3.php?sig=' + sig,
    method: 'POST'
  };
  var req = https.request(options, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      callback(chunk);
    });
  });

  req.write(dataStr);
  req.end();
};

var newSession = function () {
  apiCall('startSession', undefined, function (data) {
    sessionId = data.result.sessionID;
  });
};
var init = function (key, secretKey) {
  wsKey = key;
  secret = secretKey;

  newSession();

  apiCall('getCountry', undefined, function (data) {
    sessionId = data.result;
  });
};
