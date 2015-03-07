#!/usr/bin/env node

var awsPriceGrabber = require('../');

var all = [];

var f = awsPriceGrabber.requestPricing();
f.on('pricemap:received',function(a){
  all.push(a);
});
f.on('end',function() {
  console.log(JSON.stringify(all,null,2));
});
