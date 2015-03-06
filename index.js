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
  ec2: require('./lib/services/ec2'),
  elasticache: require('./lib/services/elasticache')
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
    options.services || _.keys(services),
    function(serviceName, serviceDone) {
      var data;
      http.get(services[serviceName].PRICING_URL, function (res) {
        var pricingHtml;
        res.on('data', function (chunk) {
          var findModels;
          pricingHtml = pricingHtml + chunk.toString();
        });
        res.on('err', function (err) {
          //TODO
        });
        res.on('end',function(){
          // model: '//a0.awsstatic.com/pricing/1/ec2/linux-od.min.js'
          var processModels = pricingHtml.match(/model:\s'\S+'/g);

          async.each(
            processModels,
            function(foundModel,jsonpDone) {
              var m = foundModel.match(/'(\S+)'/)[1];
              var productName = ''; //services[serviceName].getProductName(m);
              var jsonpUrl = services[serviceName].getJsonpUrl(m);

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
