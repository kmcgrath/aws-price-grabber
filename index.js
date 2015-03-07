var _ = require('lodash'),
EventEmitter = require('events').EventEmitter,
async = require('async'),
aws = require('aws-sdk'),
http = require('http'),
util = require('util'),
vm = require('vm');

var SERVICE_LIST = [

  /* Compute */
  'ec2',
  'elasticloadbalancing',

  /* Storage and Content Delivery */
  's3',
  'glacier',
  'ebs',
  'storagegateway',

  /* Databases */
  'rds',
  'elasticache',
  'dynamodb',
  'redshift',

  /* Application Services */
  'sqs',
  'sns',
  'swf',
  'cloudsearch',
  'elastictranscoder',

  'elasticmapreduce',
  'kinesis'

];


exports.requestPricing = function(options) {
  return new PriceGrabber(options);
};

var PriceGrabber = function(options) {
  options = options || {};

  options.services = options.services || SERVICE_LIST;

  this.jsonpSandbox = vm.createContext({callback: function(r){return r;}});
  this.requestPricing(options);
};
util.inherits(PriceGrabber, EventEmitter);

PriceGrabber.prototype.requestPricing = function(options) {
  options = options || {};
  var self = this;

  async.each(
    options.services || _.keys(services),
    function(serviceName, serviceDone) {
      var data;
      http.get(generatePricingUrl(serviceName), function (res) {
        var pricingHtml;
        res.on('data', function (chunk) {
          var findModels;
          pricingHtml = pricingHtml + chunk.toString();
        });
        res.on('err', function (err) {
          serviceDone(err);
        });
        res.on('end',function(){
          /* model: '//a0.awsstatic.com/pricing/1/ec2/linux-od.min.js'
           * model: 'https://a0.awsstatic.com/pricing/1/emr/pricing-emr.min.js'
           */
          var processModels = pricingHtml.match(/model:\s'\S+'/g);
          if(processModels === null) {
            console.warn(pricingHtml);
          }

          async.each(
            processModels,
            function(foundModel,jsonpDone) {
              var m = foundModel.match(/'(\S+)'/)[1];
              var metaInfo = parseModelPath(serviceName,m);

              var body = '';
              var jsonpReq = http.get(metaInfo.jsonpUrl, function (jsonpRes) {
                jsonpRes.on('data', function (chunk) {
                  body = body + chunk.toString();
                });
                jsonpRes.on('end', function() {
                  var json = vm.runInContext(body,self.jsonpSandbox);
                  self.emit('pricemap:received',{
                    jsonpPath: m,
                    serviceName: serviceName,
                    productName: metaInfo.productName,
                    rateType: metaInfo.rateType,
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

var generatePricingUrl = function(serviceName) {
  return "http://aws.amazon.com/"+serviceName+"/pricing/";
};

var parseModelPath = function(serviceName,modelPath) {
  /*
  * //a0.awsstatic.com/pricing/1/ec2/mswin-od.min.js
  * //a0.awsstatic.com/pricing/1/ec2/ri-v2/linux-unix-shared.min.js
  * //spot-price.s3.amazonaws.com/spot.js
  * //a0.awsstatic.com/pricing/1/ec2/pricing-data-transfer-with-regions.min.js
  * //a0.awsstatic.com/pricing/1/cloudwatch/pricing-cloudwatch.min.js
  * //a0.awsstatic.com/pricing/1/ec2/pricing-elb.min.js
  */

  var m = modelPath.match(/(pricing-)?([\w\-]+)(\.\min)?\.js/);

  var baseName = m[2];
  baseName = baseName.replace(serviceName+'-','');

  var jsonpUrl = modelPath;

  if (jsonpUrl.match('http')) {
    jsonpUrl = jsonpUrl.replace('https','http');
  }
  else {
    jsonpUrl = 'http:'+modelPath;
  }


  var r = {
    productName: baseName,
    jsonpUrl: jsonpUrl
  };
  return r;
};
