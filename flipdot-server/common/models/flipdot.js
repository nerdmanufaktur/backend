'use strict';

var app = require('../../server/server');
var Scheduler = require('../../server/scheduler.js');

module.exports = function(Flipdot) {
  Flipdot.validatesUniquenessOf(
    'mqttChannel',
    {message: 'mqttChannel not unique'}
  );
  Flipdot.validatesUniquenessOf('certificateSerial');

  /*
   * Start the flipdot application queue. If the flipdot is already running an error will be thrown.
  */
  Flipdot.prototype.start = function(next) {
    if (this.isRunning) {
      const err = new Error(
      'Flipdot is already running.');
      err.statusCode = 401;
      err.code = 'FLIPDOT_ALREADY_RUNNING';
      next(err);
    } else {
      Flipdot.findById(this.id, {
        include: {applicationQueueItems: 'flipdotApplication'},
      }, function(err, flipdot) {
        if (flipdot.applicationQueueItems().length == 0) {
          const err = new Error(
            'Application queue for Flipdot is empty.');
          err.statusCode = 401;
          err.code = 'FlipdotApplicationQueue_EMPTY';
          next(err);
        } else {
          flipdot.updateAttributes({isRunning: true}, function(err, flip) {
            var schedulerInstance = new Scheduler(flip, app);
            console.log('Starting scheduler for flipdot id', flip.id);
            schedulerInstance.start();
            next(null, flip);
          });
        }
      });
    }
  };

  /*
   * Stop the flipdot application queue. If the flipdot is already stopped an error will be thrown.
  */
  Flipdot.prototype.stop = function(next) {
    if (!this.isRunning) {
      const err = new Error(
      'Flipdot is already stopped.');
      err.statusCode = 401;
      err.code = 'FLIPDOT_ALREADY_STOPPED';
      next(err);
    }
    this.updateAttributes({isRunning: false});
    next(null, this);
  };

  Flipdot.remoteMethod('prototype.start', {
    accepts: [],
    returns: {arg: 'data', type: 'Flipdot', root: true},
  });

  Flipdot.remoteMethod('prototype.stop', {
    accepts: [],
    returns: {arg: 'data', type: 'Flipdot', root: true},
  });

  /*
   * Render the next app in the Application Queue
  */
  Flipdot.prototype.renderApplication = function(next) {
    next(null);
  };
};
