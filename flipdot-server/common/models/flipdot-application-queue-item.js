'use strict';

module.exports = function(Flipdotapplicationqueueitem) {
  Flipdotapplicationqueueitem.validateAsync('queueLocation', queueLocationValidator, {message: 'queueLocation not unique'});

  // validatesUniquenessOf() somehow does'nt work for numbers
  function queueLocationValidator(err, done) {
    Flipdotapplicationqueueitem.find({where: {flipdotId: this.flipdotId, queueLocation: this.queueLocation}}, function(findErr, queueItems) {
      if (queueItems.length > 0) {
        err();
      } else {
        done();
      }
    });
  };
};
