var awsPriceGrabber = require('../');
var assert = require('assert');

describe('elasticache Request', function(){
  describe('#pricingRequest()', function(){
    it('should run without error', function(done){
      this.timeout(15000);
      var grabber = awsPriceGrabber.requestPricing({services:['elasticache']});
      grabber.on('pricemap:received',function(pricemap) {
        assert.equal(pricemap.serviceName, 'elasticache');
      });
      grabber.on('end',done);
    })
  })
});
