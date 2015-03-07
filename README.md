# aws-price-grabber
Capture AWS pricing as JSON

Based on a Stack Overflow [answer](http://stackoverflow.com/a/7334197)

*Staus*: ~~Alpha~~ Hacky

*WARNING*
There is a lot of work to be done.  There are unicorns, gremlins and
constant change.

## Description
AWS does not have an API for pricing.  Most of the pricing pages however
load their data via jsonp.  Those jsonp endpoints can and do change.
This project will scan a pricing page for the jsonp endpoints it relies
on then process those endpoints into JSON.

For each endpoint (pricemap) *aws-price-grabber* will emit an event
allowing the consuerm to parse or store the raw data as they see fit.

Since AWS does not support pulling prices this way, *aws-price_grabber*
will not attempt to manipulate, normalize, or change data in any way.
That will be the job of the consming application/module.  This will
hopefully keep any breaking changes made by AWS to a minimum.


## Services that work
* ec2
* elasticloadbalancing
* s3
* glacier
* ebs
* storagegateway
* rds
* elasticache
* dynamodb
* redshift
* sqs
* sns
* swf
* cloudsearch
* elastictranscoder
* elasticmapreduce
* kinesis

## Services that DO NOT work

The following services embed pricing as HTML and do not use jsonp.

* ses
* directconnect
* vpc
* lambda
* cloudfront
* route53
* appstream


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

### count\_price\_endpoints.js
Counts the total number of jsonp endpoints that can be collected

    > ./bin/count_price_endpoints.js



## Other useful ec2 pricing projects

* https://github.com/erans/ec2instancespricing
* https://github.com/CloudHealth/amazon-pricing
