var awsPriceGrabber = require('../');
var assert = require('assert');

describe('ec2 Request', function(){
  describe('#pricingRequest()', function(){
    it('should run without error', function(done){
      this.timeout(15000);
      var grabber = awsPriceGrabber.requestPricing({services:['ec2']});
      grabber.on('pricemap:received',function(pricemap) {
        // console.log(JSON.stringify(pricemap,null,2));
        assert.equal(pricemap.serviceName, 'ec2');
      });
      grabber.on('end',done);
    })
  })
});
