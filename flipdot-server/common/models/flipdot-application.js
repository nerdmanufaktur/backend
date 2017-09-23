'use strict';


var app = require('../../server/server'); //require `server.js` as in any node.js app

module.exports = function(Flipdotapplication) {

  /*Flipdotapplication.observe("before save", function enforeceDeveloperOnly(ctx, next) {
    const err = new Error(
    "User isn't developer");
    err.statusCode = 401;
    err.code = 'USER_NOT_DEVELOPER';
    console.log(ctx.instance);
    const dev = ctx.instance.developer;
    console.log(dev);
    if(!ctx.instance.developer.isDeveloper) next(err);
    next();
});*/
};
