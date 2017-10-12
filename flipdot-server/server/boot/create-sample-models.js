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
    createApplications(results.users, function(err) {
      console.log('> Apps created sucessfully');
    });
    createFlipdots(results.users, function(err) {
      console.log('> Flipdots created sucessfully');
    });
    createAdmin(results.users, function(err) {
      console.log('> Admin created sucessfully');
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
        isRunning: false,
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
        isRunning: false,
        flipdotUserId: users[2].id
      }, ], function(err, flipdots) {
        if (err) throw err;
        users[0].updateAttributes({flipdotId: flipdots[0].id});
        users[0].updateAttributes({flipdotId: flipdots[2].id});
        users[2].updateAttributes({flipdotId: flipdots[0].id});
        console.log('\n USERS: \n', users, '\n FLIPDOTS: \n', flipdots);
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
        password: 'foobar',
        isDeveloper: true
      }, {
        firstName: "Günter",
        lastName: "Evers",
        email: 'john@doe.com',
        password: 'johndoe'
      }, {
        firstName: "Marc Uwe",
        lastName: "Kling",
        email: 'jane@doe.com',
        password: 'janedoe',
        isDeveloper: true
      }], cb);
    });
  }

  //create applications and settings and add Apps to FlipdotApplicationQueue
  function createApplications(users, cb) {
    dataSource.automigrate('FlipdotApplication', function(err) {
      if (err) return cb(err);
      app.models.FlipdotApplication.create([{
        name: "Email",
        description: "See your latest email subjects.",
        flipdotUserId: users[0].id,
        path: 'common/apps/email.js',
        "isVisibleInAppStore": true
      }, {
        name: "Twitter",
        description: "See your latest tweets.",
        flipdotUserId: users[2].id,
        path: 'common/apps/twitter.js',
        "isVisibleInAppStore": false
      }, {
        name: "Pornhub",
        description: "See your latest porn.",
        flipdotUserId: users[2].id,
        path: 'common/apps/japaneseporn.js',
        "isVisibleInAppStore": true
      }], function(err, apps) {
        if (err) throw err;

        app.models.FlipdotApplicationQueueItem.create([{
            queueLocation: 1,
            isInterruptable: true,
            maxRuntime: 500,
            flipdotApplicationId: apps[0].id,
            flipdotId: 1
        }, {
            queueLocation: 2,
            isInterruptable: true,
            maxRuntime: 200,
            flipdotApplicationId: apps[1].id,
            flipdotId: 1
        }, {
            queueLocation: 3,
            isInterruptable: false,
            maxRuntime: 800,
            flipdotApplicationId: apps[0].id,
            flipdotId: 1
        }, {
            queueLocation: 1,
            isInterruptable: true,
            maxRuntime: 800,
            flipdotApplicationId: apps[0].id,
            flipdotId: 3
        }, {
            queueLocation: 2,
            isInterruptable: true,
            maxRuntime: 300,
            flipdotApplicationId: apps[2].id,
            flipdotId: 3
        }, {
            queueLocation: 3,
            isInterruptable: false,
            maxRuntime: 500,
            flipdotApplicationId: apps[1].id,
            flipdotId: 3
        }], function(err, settings) {
          if (err) throw err;
          console.log('\n Settings: \n', settings);
        });

        app.models.FlipdotApplicationSetting.create([{
            name: "mailserver",
            description: "mailserver",
            type: "web address",
            defaultValue: "",
            isNullable: false,
            flipdotApplicationId: apps[0].id
        }, {
            name: "refresh_rate",
            description: "time in minutes for refresh",
            type: "integer",
            defaultValue: "15",
            isNullable: false,
            flipdotApplicationId: apps[0].id
        }, {
            name: "mailserver",
            description: "mailserver",
            type: "web address",
            defaultValue: "",
            isNullable: false,
            flipdotApplicationId: apps[1].id
        }], function(err, settings) {
          if (err) throw err;
          console.log('\n Settings: \n', settings);
        });
        console.log('Models created: \n APPS: \n', apps);
      });
    });
  }

  //create admin role and assigning it
  function createAdmin(users, cb) {
    dataSource.automigrate('FlipdotApplicationSetting', function(err) {
      if (err) return cb(err);
      //...
      // Create projects, assign project owners and project team members
      //...
      // Create the admin role
      app.models.Role.create({
        name: 'admin'
      }, function(err, role) {
        if (err) return cb(err);
        cb(role);

        // Make Bob an admin
        role.principals.create({
          principalType: app.models.RoleMapping.USER,
          principalId: users[0].id
        }, function(err, principal) {
          if (err) return cb(err);
          cb(principal);
        });
      });
    });
  };

};
