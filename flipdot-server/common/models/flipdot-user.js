'use strict';

var app = require('../../server/server');

module.exports = function(Flipdotuser) {
  // log when a user logged in last time
  Flipdotuser.afterRemote('login', function(ctx, modelInstance, next) {
    Flipdotuser.findById(modelInstance.userId, function(err, user) {
      user.updateAttributes({lastLogin: modelInstance.created},
        function(err, user) {
          if (err) next(err);
          next();
        });
    });
  });
};
