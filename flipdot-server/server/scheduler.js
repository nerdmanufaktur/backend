function Scheduler(flipdot) {
    this.flipdot = flipdot;
    this.counter = 0;
}

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
