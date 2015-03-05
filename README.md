Capture all AWS compute pricing

Staus: ~~Alpha~~ Hacky

Based on this Stack Overflow [answer](http://stackoverflow.com/a/7334197)

## Use
var frugal = require('frugal-ec2');
var f = frugal.requestPricing;

f.on('pricesheet',doSomething);
f.on('end',finishSomething);

## request\_all.js
Script that dumps all pricing in JSON to STDOUT

    > ./bin/request_all.js


Useful ec2 pricing projects:

* https://github.com/erans/ec2instancespricing
* https://github.com/CloudHealth/amazon-pricing
