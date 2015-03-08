var EventEmitter = require('events').EventEmitter,
async = require('async'),
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

  /* Analytics */
  'elasticmapreduce',
  'kinesis'

];

// Constructor
var PriceGrabber = function(options) {
  options = options || {};

  options.services = options.services || SERVICE_LIST;

  this.jsonpSandbox = vm.createContext({callback: function(r){return r;}});
  this.requestPricing(options);
};
util.inherits(PriceGrabber, EventEmitter);


// exports
exports.requestPricing = function(options) {
  return new PriceGrabber(options);
};


PriceGrabber.prototype.requestPricing = function(options) {
  options = options || {};
  var self = this;

  // For each service load and scrape jsonp model paths
  async.each(
    options.services,
    function loadAndScrapePricingPage(serviceName, serviceDone) {

      http.get(generatePricingUrl(serviceName), function (res) {
        var pricingHtml;
        res.on('data', function (chunk) {
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
            serviceDone('No pricing models found for '+serviceName);
          }

          // Load each found jsonp model URL
          async.each(
            processModels,
            function(foundModel,jsonpDone) {
              var metaInfo = parseModelPath(serviceName,foundModel);

              var jsonpBody = '';
              var jsonpReq = http.get(metaInfo.jsonpUrl, function (jsonpRes) {
                jsonpRes.on('data', function (chunk) {
                  jsonpBody = jsonpBody + chunk.toString();
                });
                jsonpRes.on('err', jsonpDone),
                jsonpRes.on('end', function() {
                  var json = vm.runInContext(jsonpBody,self.jsonpSandbox);
                  self.emit('pricemap:received',{
                    jsonpPath: metaInfo.modelPath,
                    serviceName: serviceName,
                    productName: metaInfo.productName,
                    rateType: metaInfo.rateType,
                    priceMap: json
                  });
                  jsonpDone();
                });
              });
              jsonReq.on('err',function(err) {
                jsonpDone(err);
              });
            },
            function(err) {
              serviceDone(err);
            }
          );
        });
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

var parseModelPath = function(serviceName,foundModel) {
  /*
   * //a0.awsstatic.com/pricing/1/ec2/mswin-od.min.js
   * //a0.awsstatic.com/pricing/1/ec2/ri-v2/linux-unix-shared.min.js
   * //spot-price.s3.amazonaws.com/spot.js
   * //a0.awsstatic.com/pricing/1/ec2/pricing-data-transfer-with-regions.min.js
   * //a0.awsstatic.com/pricing/1/cloudwatch/pricing-cloudwatch.min.js
   * //a0.awsstatic.com/pricing/1/ec2/pricing-elb.min.js
   */

  var modelPath = foundModel.match(/'(\S+)'/)[1];

  // Match the name of the model without prepended 'pricing-' or the file extension
  var m = modelPath.match(/(pricing-)?([\w\-]+)(\.\min)?\.js/);

  // The baseName is the 3 element in our match array
  var baseName = m[2];

  // Strip the serviceName ('ec2','rds',etc...) from the name
  baseName = baseName.replace(serviceName+'-','');
  baseName = baseName.replace('-'+serviceName,'');


  /* Build the URL for the jsonp endpoint.
   *
   * Most models only provide the path.
   *
   * In the event that the full URL exists
   * ensure that it uses http and not https
   *
   */
  var jsonpUrl = modelPath;
  if (jsonpUrl.match('http')) {
    jsonpUrl = jsonpUrl.replace('https','http');
  }
  else {
    jsonpUrl = 'http:'+modelPath;
  }


  // return object
  var r = {
    modelPath: modelPath,
    productName: baseName,
    jsonpUrl: jsonpUrl
  };
  return r;
};
