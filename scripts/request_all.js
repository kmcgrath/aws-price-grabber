#!/usr/bin/env node

var awsPriceGrabber = require('../');

var all = [];

var grabber = awsPriceGrabber.requestPricing();
grabber.on('pricemap:received',function(a){
  all.push(a);
});
grabber.on('end',function() {
  console.log(JSON.stringify(all,null,2));
});
