Capture all AWS compute pricing

Based on this Stack Overflow [answer](http://stackoverflow.com/a/7334197)

Staus: ~~Alpha~~ Hacky

*WARNING*
There is a lot of work to be done.  Things could be broken, changed and
disapear at any moment.


The solution is working for more than ec2.  Might be able to use this
method to get pricing for any AWS product.
* Might change the name of the project to frugal-aws

Services that appear to be working so far:
* ec2
* rds
* s3
* elasticache
* sns
* sqs


## Use
    var frugal = require('frugal-ec2');
    var f = frugal.requestPricing;

    f.on('pricemap:received',doSomething);
    f.on('end',finishSomething);

## Scripts
Right now I'm placing some quick scripts in the bin directory.  Will
most likely move these to examples or better yet, tests in the future.

### request\_all.js
Script that dumps all pricing in JSON to STDOUT

    > ./bin/request_all.js


## Other useful ec2 pricing projects

* https://github.com/erans/ec2instancespricing
* https://github.com/CloudHealth/amazon-pricing
