var async = require('async');
module.exports = function(app) {
  //data sources
  var dataSource = app.dataSources.test;
  //create all models
  async.parallel({
    //flipdots: async.apply(createFlipdots),
    users: async.apply(createUsers),
  }, function(err, results) {
    if (err) throw err;
    createFlipdots(results.users, function(err) {
      console.log('> models created sucessfully');
    });
  });

  //create flipdots
  function createFlipdots(users, cb) {
    dataSource.automigrate('Flipdot', function(err) {
      if (err) throw err;


      var DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;
      app.models.Flipdot.create([{
        certificateSerial: 'ABCDE',
        mqttChannel: '5',
        boardHeight: '16',
        hardwareRevision: '2.0',
        softwareVersion: '1.0',
        lastOnline: Date.now() - (DAY_IN_MILLISECONDS * 4),
        isRunning: true,
        flipdotUserId: users[0].id
      }, {
        certificateSerial: 'FGHIJ',
        mqttChannel: '23',
        boardHeight: '16',
        hardwareRevision: '2.0',
        softwareVersion: '1.0',
        lastOnline: Date.now() - (DAY_IN_MILLISECONDS * 3),
        isRunning: false,
        flipdotUserId: users[0].id
      }, {
        certificateSerial: 'KLMNOP',
        mqttChannel: '42',
        boardHeight: '16',
        hardwareRevision: '1.0',
        softwareVersion: '1.2',
        lastOnline: Date.now() - (DAY_IN_MILLISECONDS * 2),
        isRunning: true,
        flipdotUserId: users[2].id
      }, ], function(err, flipdots) {
        if (err) throw err;
        users[0].updateAttributes({flipdotId: flipdots[0].id});
        users[0].updateAttributes({flipdotId: flipdots[2].id});
        users[2].updateAttributes({flipdotId: flipdots[0].id});
        console.log('Models created: \n USERS:\n', users, '\n FLIPDOTS:\n', flipdots);
      });
    });
  }

  //create users
  function createUsers(cb) {
    dataSource.automigrate('FlipdotUser', function(err) {
      if (err) return cb(err);
      app.models.FlipdotUser.create([{
        firstName: "Horst",
        lastName: "Evers",
        email: 'foo@bar.com',
        password: 'foobar'
      }, {
        firstName: "Günter",
        lastName: "Evers",
        email: 'john@doe.com',
        password: 'johndoe'
      }, {
        firstName: "Marc Uwe",
        lastName: "Kling",
        email: 'jane@doe.com',
        password: 'janedoe'
      }], cb);
    });
  }
};
