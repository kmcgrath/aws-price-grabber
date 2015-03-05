var aws = require('aws-sdk'),
http = require('http'),
async = require('async'),
vm = require('vm'),
EventEmitter = require('events').EventEmitter;
util = require('util');

var EC2_PRICING_URL = exports.EC2_PRICING_URL = 'http://aws.amazon.com/ec2/pricing/';
var S3_PRICING_URL = exports.S3_PRICING_URL = 'http://aws.amazon.com/s3/pricing/';
var ALL_URLS = [EC2_PRICING_URL,S3_PRICING_URL];

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
    ALL_URLS,
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
              console.log(parts);
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
