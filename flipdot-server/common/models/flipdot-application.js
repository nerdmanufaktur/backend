'use strict';

var app = require('../../server/server');

module.exports = function(Flipdotapplication) {
  Flipdotapplication.validateAsync('flipdotUserId', validateUserIsDeveloper,
    {message: "user isn't developer"});
  Flipdotapplication.validatesUniquenessOf('name');
  Flipdotapplication.validatesUniquenessOf('path');
  Flipdotapplication.validatesUniquenessOf('description');
};

/*
 * Enforce that only a developer can upload apps
*/
function validateUserIsDeveloper(err, done) {
  app.models.FlipdotUser.findById(this.flipdotUserId,
    function(findErr, appDeveloper) {
      if (!appDeveloper.isDeveloper) err();

      done();
    });
}
