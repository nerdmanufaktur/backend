'use strict';

module.exports = function(Flipdot) {

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

};
