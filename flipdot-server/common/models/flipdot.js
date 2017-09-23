'use strict';

module.exports = function(Flipdot) {


  /**
 * Start the flipdot application queue. If the flipdot is already running an error will be thrown.
 */
  Flipdot.prototype.start = function(next){

    if(this.isRunning) {
      const err = new Error(
      'Flipdot is already running.');
      err.statusCode = 401;
      err.code = 'FLIPDOT_ALREADY_RUNNING';
      next(err);
    }
    this.updateAttributes({isRunning: true});
    next(null, this);
  }

  /**
 * Stop the flipdot application queue. If the flipdot is already stopped an error will be thrown.
 */
  Flipdot.prototype.stop = function(next){

    if(!this.isRunning) {
      const err = new Error(
      'Flipdot is already stopped.');
      err.statusCode = 401;
      err.code = 'FLIPDOT_ALREADY_STOPPED';
      next(err);
    }
    this.updateAttributes({isRunning: false});
    next(null, this);
  }

  Flipdot.remoteMethod('prototype.start', {
            accepts: [],
            returns: {arg: 'flipdot', type: 'Flipdot'}
  });

  Flipdot.remoteMethod('prototype.stop', {
            accepts: [],
            returns: {arg: 'flipdot', type: 'Flipdot'}
  });

  /**
 * Render the next app in the Application Queue
 */
  Flipdot.prototype.renderApplication = function(next){

    
    next(null);
  }


};
