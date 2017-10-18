'use strict';

module.exports = function(Flipdotapplicationqueueitem) {
  Flipdotapplicationqueueitem.validateAsync('queueLocation',
  validateQueueLocationUniqueness, {message: 'queueLocation not unique'});

  /*
   * Enforce that queueLocation is unique for the related flipdot
  */
  function validateQueueLocationUniqueness(err, done) {
    Flipdotapplicationqueueitem.find({where: {
      flipdotId: this.flipdotId,
      queueLocation: this.queueLocation
    }}, function(findErr, queueItems) {
      if (queueItems.length > 0) {
        err();
      } else {
        done();
      }
    });
  };
};
