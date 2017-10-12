'use strict';


var app = require('../../server/server')

module.exports = function(Flipdotapplication) {

  // enforce that only a developer can upload apps
  Flipdotapplication.validateAsync('flipdotUserId', validateUserIsDeveloper, {message: "user isn't developer"})
  Flipdotapplication.validatesUniquenessOf('name')
  Flipdotapplication.validatesUniquenessOf('path')
  Flipdotapplication.validatesUniquenessOf('description')

}

function validateUserIsDeveloper(err, done) {
  app.models.FlipdotUser.findById(this.flipdotUserId, function(find_err, appDeveloper) {
      if(!appDeveloper.isDeveloper) err()

      done()
  })
}
