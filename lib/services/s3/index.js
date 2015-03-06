var PRICING_URL = exports.PRICING_URL = 'http://aws.amazon.com/s3/pricing/';

exports.getProductName = function(modelPath) {
  var parts = modelPath.split("/");
  var file = parts[parts.length-1];
  var productName = file.split('.')[0];
  return productName;
};

exports.getRateType = function(modelPath) {
  var parts = modelPath.split("/");
  var file = parts[parts.length-1];
  return '';
};

exports.getJsonpUrl = function(modelPath) {
  return 'http:' + modelPath;
};
