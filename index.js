var aws = require('aws-sdk'),
http = require('http'),
async = require('async'),
vm = require('vm'),
EventEmitter = require('events').EventEmitter;
util = require('util');

exports.requestPricing = function(options) {
  return new Frugal(options);
};

var Frugal = function(options) {
  this.jsonpSandbox = vm.createContext({callback: function(r){return r;}});
  this.requestPricing(options);
};
util.inherits(Frugal, EventEmitter);

Frugal.prototype.requestPricing = function(options) {
  var self = this;

  http.get('http://aws.amazon.com/ec2/pricing/', function (res) {
    var processModels = [];
    res.on('data', function (chunk) {
      var findModels;
      // model: '//a0.awsstatic.com/pricing/1/ec2/linux-od.min.js'
      if (findModels = chunk.toString().match(/model:\s'\S+'/g)) {
        processModels = processModels.concat(findModels);
      }
    });
    res.on('end',function(){
      async.each(
        processModels,
        function(foundModel,done) {
          var m = foundModel.match(/'(\S+)'/);
          var parts = m[1].split("/");
          var file = parts[parts.length-1];
          var name = file.split('.')[0];
          var jsonpUrl = 'http:' + m[1];

          var body = '';
          var jsonpReq = http.get(jsonpUrl, function (jsonpRes) {
            jsonpRes.on('data', function (chunk) {
              body = body + chunk.toString();
            });
            jsonpRes.on('end', function() {
              var json = vm.runInContext(body,self.jsonpSandbox);
              self.emit('pricesheet',{
                name: name,
                sheet: json
              });
              done();
            });
          });
        },
        function(err) {
          self.emit('end');
        }
      );
    })
  });
};
