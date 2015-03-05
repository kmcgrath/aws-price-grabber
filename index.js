var aws = require('aws-sdk'),
http = require('http'),
async = require('async'),
vm = require('vm');

var req = http.get('http://aws.amazon.com/ec2/pricing/', function (res) {
  res.on('data', function (chunk) {
    // model: '//a0.awsstatic.com/pricing/1/ec2/linux-od.min.js'
    var findModels;
    if (findModels = chunk.toString().match(/model:\s'\S+'/g)) {
      findModels.forEach(function(foundModel) {
        var jsonpUrl = 'http:' + foundModel.match(/'(\S+)'/)[1];
        var body = '';
        var jsonpReq = http.get(jsonpUrl, function (jsonpRes) {
          jsonpRes.on('data', function (chunk) {
            body = body + chunk.toString();
          });
          jsonpRes.on('end', function() {
            var sandbox = vm.createContext({callback: function(r){return r;}});
            var json = vm.runInContext(body,sandbox);
            console.log(JSON.stringify(json,null,2));
          });
        });
      });
    }
  });
});
