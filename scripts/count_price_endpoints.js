#!/usr/bin/env node

var awsPriceGrabber = require('../');

var count = 0;

var grabber = awsPriceGrabber.requestPricing();
grabber.on('pricemap:received',function(a){
  count = count + 1;
});
grabber.on('end',function() {
  console.log(count);
});
