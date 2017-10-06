var queue = require('queue')

function Scheduler(flipdot) {
    this.flipdot = flipdot;
    this.counter = 0;
    this.appQueue = queue();
    var userAppQueueConfig = flipdot.applicationQueueItems();
    if(userAppQueueConfig.length == 0) {

    } else {
        for(var i = 0; i < userAppQueueConfig.length; i++) {
              this.appQueue.push(userAppQueueConfig[i]);
        }
        console.log(this.appQueue);
    }
}

//starts looping through the render queue as long as isRunning bit is set to true
Scheduler.prototype.start = function() {
    setTimeout(this.schedule.bind(this), 0);
}

Scheduler.prototype.schedule = function() {
    this.flipdot.reload(function (err, flipdot) {
        this.counter++;
        console.log(this.counter);
        if (flipdot.isRunning) {
            console.log('Hello world!\n');
            setTimeout(this.schedule.bind(this), 500);
        }
    }.bind(this));
}

module.exports =  Scheduler;
