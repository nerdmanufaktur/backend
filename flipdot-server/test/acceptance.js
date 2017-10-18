/* jshint camelcase: false */
'use strict';
var app = require('../server/server');
var request = require('supertest');
var assert = require('assert');
var loopback = require('loopback');

function json(verb, url) {
  return request(app)[verb](url)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/);
}

function jsonData(verb, url, data) {
  return request(app)[verb](url)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .send(data);
}

describe('REST API request', function() {
  before(function(done) {
    require('./start-server');
    done();
  });

  after(function(done) {
    app.removeAllListeners('started');
    app.removeAllListeners('loaded');
    done();
  });

  it('should return a list of all flipdots', function(done) {
    json('get', '/api/flipdots')
      .expect(200, function(err, res) {
        assert(Array.isArray(res.body));
        assert.equal(res.body.length, 3);
        done();
      });
  });

  it('should return a list of all customers with firstnames', function(done) {
    json('get', '/api/flipdotusers?filter[fields][firstname]=true')
      .expect(200, function(err, res) {
        assert(Array.isArray(res.body));
        assert.equal(res.body.length, 3);
        done();
      });
  });

  it('should return a user with id 1', function(done) {
    json('get', '/api/flipdotusers/1')
      .expect(200, function(err, res) {
        assertRespondsFlipdotUser(res.body);
        assert.strictEqual(res.body.lastLogin, undefined);
        assert.strictEqual(res.body.isAdmin, false);
        assert(res.body.isDeveloper);
        assert.equal(res.body.id, 1);
        done();
      });
  });

  it('should return flipdots by customer 1', function(done) {
    json('get', '/api/flipdotusers/1/flipdots')
      .expect(200, function(err, res) {
        assert(Array.isArray(res.body));
        assert.notEqual(res.body.length, 0);
        assertRespondsFlipdot(res.body[0]);
        assert.strictEqual(res.body[0].isRunning, false);
        assert.equal(res.body[0].flipdotUserId, 1);
        done();
      });
  });

  it('should return only 2 flipdotusers', function(done) {
    json('get',
    '/api/flipdotusers?filter[include][flipdots]=user&filter[limit]=2')
      .expect(200, function(err, res) {
        assert(Array.isArray(res.body));
        assert.equal(res.body.length, 2);
        assertRespondsFlipdotUser(res.body[0]);
        assertRespondsFlipdotUser(res.body[1]);
        done();
      });
  });

  it('should be able to start stopped flipdot', function(done) {
    json('post',
    '/api/flipdots/1/start')
      .expect(200, function(err, res) {
        assert.notEqual(res.body.length, 0);
        assertRespondsFlipdot(res.body);
        assert.equal(res.body.isRunning, true);
        assert.equal(res.body.id, 1);
        done();
      });
  });

  it("shouldn't be able to start started flipdot", function(done) {
    json('post',
    '/api/flipdots/1/start')
      .expect(401, function(err, res) {
        assert(res.body.error);
        assert.equal(res.body.error.code, 'FLIPDOT_ALREADY_RUNNING');
        done();
      });
  });

  it('should be able to stop started flipdot', function(done) {
    json('post',
    '/api/flipdots/1/stop')
      .expect(200, function(err, res) {
        assert.notEqual(res.body.length, 0);
        assertRespondsFlipdot(res.body);
        assert.strictEqual(res.body.isRunning, false);
        assert(res.body.id);
        done();
      });
  });

  it("shouldn't be able to stop stopped flipdot", function(done) {
    json('post',
    '/api/flipdots/1/stop')
      .expect(401, function(err, res) {
        assert(res.body.error);
        assert.equal(res.body.error.code, 'FLIPDOT_ALREADY_STOPPED');
        done();
      });
  });

  it("shouldn't be able to create apps with same name", function(done) {
    var app1 = {
      'name': 'generic',
      'description': 'lol',
      'path': '/bad.js',
      'isVisibleInAppStore': false,
      'flipdotUserId': 1,
    };
    var app2 = {
      'name': 'generic',
      'description': 'haha',
      'path': '/good.js',
      'isVisibleInAppStore': true,
      'flipdotUserId': 3,
    };
    var app3 = {
      'name': 'not generic',
      'description': 'rofl',
      'path': '/okay.js',
      'isVisibleInAppStore': true,
      'flipdotUserId': 3,
    };
    jsonData('post',
    '/api/flipdotapplications', app1)
      .expect(200, function(err, res) {
        assert.notEqual(res.body.length, 0);
        assertRespondsFlipdotApplication(res.body);
      });
    jsonData('post',
    '/api/flipdotapplications', app2)
      .expect(422, function(err, res) {
        assert.equal(res.body.error.statusCode, 422);
      });
    jsonData('post',
    '/api/flipdotapplications', app3)
      .expect(200, function(err, res) {
        assert.notEqual(res.body.length, 0);
        assertRespondsFlipdotApplication(res.body);
        done();
      });
  });

  it("shouldn't be able to create apps with non admin user as developer",
  function(done) {
    var app = {
      'name': 'generic again',
      'description': 'lol rofl',
      'path': '/nice.js',
      'isVisibleInAppStore': true,
      'flipdotUserId': 2,
    };
    jsonData('post',
    '/api/flipdotapplications', app)
      .expect(422, function(err, res) {
        assert.equal(res.body.error.statusCode, 422);
        assert.equal(res.body.error.name, 'ValidationError');
        done();
      });
  });

  it("shouldn't be able to create FlipdotApplicationQueueItems with non unique queuePositions",
  function(done) {
    var appItem1 = {
      'queueLocation': 1,
      'isInterruptable': false,
      'maxRuntime': 2000,
    };
    var appItem2 = {
      'queueLocation': 1,
      'isInterruptable': false,
      'maxRuntime': 2000,
    };
    var appItem3 = {
      'queueLocation': 2,
      'isInterruptable': false,
      'maxRuntime': 2000,
    };
    jsonData('post',
    '/api/flipdots/2/applicationqueueitems', appItem1)
      .expect(200, function(err, res) {
        assertRespondsApplicationQueueItem(res.body);
      });
    jsonData('post',
    '/api/flipdots/2/applicationqueueitems', appItem2)
    .expect(422, function(err, res) {
      assert.equal(res.body.error.statusCode, 422);
      assert.equal(res.body.error.name, 'ValidationError');
      assert.equal(res.body.error.message, 'queueLocation not unique');
    });
    jsonData('post',
    '/api/flipdots/2/applicationqueueitems', appItem3)
      .expect(200, function(err, res) {
        assertRespondsApplicationQueueItem(res.body);
        done();
      });
  });

  it('should log last time a user logged in',
  function(done) {
    var credentials = {
      'email': 'jane@doe.com',
      'password': 'janedoe',
    };
    jsonData('get',
    '/api/flipdotusers/3')
      .expect(200, function(err, res) {
        assert.equal(res.body.lastLogin, null);
      });
    jsonData('post',
    '/api/flipdotusers/login', credentials)
      .expect(200, function(err, res) {
        assertRespondsUserAccessToken(res.body);
        jsonData('get',
        '/api/flipdotusers/3')
          .expect(200, function(err2, res2) {
            assert.equal(res2.body.lastLogin, res.body.created);
            done();
          });
      });
  });
});

describe('Unexpected Usage', function() {
  it('should not crash the server when posting a bad id', function(done) {
    json('post', '/api/flipdotusers/foobar')
      .send({})
      .expect(404, done);
  });
});

function assertRespondsFlipdotUser(body) {
  assert(body.firstName);
  assert(body.lastName);
  assert(body.email);
  assert(body.id);
}

function assertRespondsFlipdotApplication(body) {
  assert(body.name);
  assert(body.description);
  assert(body.flipdotUserId);
  assert(body.path);
  assert(body.id);
}

function assertRespondsFlipdot(body) {
  assert(body.certificateSerial);
  assert(body.mqttChannel);
  assert(body.boardHeight);
  assert(body.hardwareRevision);
  assert(body.softwareVersion);
  assert(body.lastOnline);
  assert(body.id);
}

function assertRespondsApplicationQueueItem(body) {
  assert(body.queueLocation);
  assert(body.maxRuntime);
}

function assertRespondsUserAccessToken(body) {
  assert(body.id);
  assert(body.ttl);
  assert(body.created);
  assert(body.userId);
}
