var _ = require('lodash'),
EventEmitter = require('events').EventEmitter,
async = require('async'),
aws = require('aws-sdk'),
http = require('http'),
util = require('util'),
vm = require('vm');

var services = {
  s3: require('./lib/services/s3'),
  rds: require('./lib/services/rds'),
  ec2: require('./lib/services/ec2')
};

exports.requestPricing = function(options) {
  return new Frugal(options);
};

var Frugal = function(options) {
  this.jsonpSandbox = vm.createContext({callback: function(r){return r;}});
  this.requestPricing(options);
};
util.inherits(Frugal, EventEmitter);

Frugal.prototype.requestPricing = function(options) {
  options = options || {};
  var self = this;

  async.each(
    _.pluck(services,'PRICING_URL'),
    function(pricingUrl, serviceDone) {
      http.get(pricingUrl, function (res) {
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
            function(foundModel,jsonpDone) {
              var m = foundModel.match(/'(\S+)'/);
              var parts = m[1].split("/");
              var file = parts[parts.length-1];
              var productName = file.split('.')[0];
              var jsonpUrl = 'http:' + m[1];

              // TODO break out into function
              var serviceName = parts[5];
              if (productName === "spot") {
                serviceName = 'ec2';
              }

              var body = '';
              var jsonpReq = http.get(jsonpUrl, function (jsonpRes) {
                jsonpRes.on('data', function (chunk) {
                  body = body + chunk.toString();
                });
                jsonpRes.on('end', function() {
                  var json = vm.runInContext(body,self.jsonpSandbox);
                  self.emit('pricemap:received',{
                    serviceName: serviceName,
                    productName: productName,
                    priceMap: json
                  });
                  jsonpDone();
                });
              });
            },
            function(err) {
              serviceDone();
            }
          );
        })
      });
    },
    function(err) {
      //TODO err
      self.emit('end');
    }
  );
};
