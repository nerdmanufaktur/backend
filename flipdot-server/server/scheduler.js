'use strict';

var queue = require('queue');

/*
 * Create a scheduler for executing flipdot apps. Give a flipdot with included applicationQueueItems
 * and therein each included the application.
 * Also pass the global LoopBack app object.
*/
function Scheduler(flipdot, app) {
  this.flipdot = flipdot;
  this.counter = 0;
  this.appQueue = queue();
  this.app = app;
  var userAppQueueConfig = flipdot.applicationQueueItems();
  userAppQueueConfig.forEach(function(config) {
    this.appQueue.push(config);
  }.bind(this));
}

/*
 * Starts looping through the render queue as long as isRunning bit is set to true
*/
Scheduler.prototype.start = function() {
  setTimeout(this.schedule.bind(this), 0);
};

/*
 * Executes last item in queue and enqueues item in front of queue again.
 * Calls itself with a timeout of maxRuntime set in FlipdotApplicationQueueItem
*/
Scheduler.prototype.schedule = function() {
  this.flipdot.reload(function(err, flipdot) {
    if (flipdot.isRunning) {
      var currentAppConfig = this.appQueue.shift();
      console.log('Executing on iteration ', this.counter, ' on flipdot: ',
        flipdot.id, ' (', currentAppConfig.flipdotApplication().name, ')');
      this.counter++;
      this.appQueue.push(currentAppConfig);
      setTimeout(this.schedule.bind(this), currentAppConfig.maxRuntime);
    } else {
      console.log('Stopped executing on flipdot ', flipdot.id);
    }
  }.bind(this));
};

Scheduler.executeApp = function(app, cb) {
  cb();
};

module.exports =  Scheduler;
