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
        assert(res.body.firstName);
        assert(res.body.lastName);
        assert(res.body.email);
        assert.strictEqual(res.body.lastLogin, undefined);
        assert.strictEqual(res.body.isAdmin, false);
        assert(res.body.isDeveloper);
        assert(res.body.id);
        assert.equal(res.body.id, 1);
        done();
      });
  });

  it('should return flipdots by customer 1', function(done) {
    json('get', '/api/flipdotusers/1/flipdots')
      .expect(200, function(err, res) {
        assert(Array.isArray(res.body));
        assert.notEqual(res.body.length, 0);
        assert(res.body[0].certificateSerial);
        assert(res.body[0].mqttChannel);
        assert(res.body[0].boardHeight);
        assert(res.body[0].hardwareRevision);
        assert(res.body[0].softwareVersion);
        assert(res.body[0].lastOnline);
        assert.strictEqual(res.body[0].isRunning, false);
        assert(res.body[0].id);
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
        done();
      });
  });

  it('should be able to start stopped flipdot', function(done) {
    json('post',
    '/api/flipdots/1/start')
      .expect(200, function(err, res) {
        assert.notEqual(res.body.length, 0);
        assert(res.body.certificateSerial);
        assert(res.body.mqttChannel);
        assert(res.body.boardHeight);
        assert(res.body.hardwareRevision);
        assert(res.body.softwareVersion);
        assert(res.body.lastOnline);
        assert.strictEqual(res.body.isRunning, true);
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

  it('should be able to stopp started flipdot', function(done) {
    json('post',
    '/api/flipdots/1/stop')
      .expect(200, function(err, res) {
        assert.notEqual(res.body.length, 0);
        assert(res.body.certificateSerial);
        assert(res.body.mqttChannel);
        assert(res.body.boardHeight);
        assert(res.body.hardwareRevision);
        assert(res.body.softwareVersion);
        assert(res.body.lastOnline);
        assert.strictEqual(res.body.isRunning, false);
        assert(res.body.id);
        done();
      });
  });

  it("shouldn't be able to stopp started flipdot", function(done) {
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
      'id': 0,
      'flipdotUserId': 2,
    };
    jsonData('post',
    '/api/flipdotapplications', app1)
      .expect(200, function(err, res) {
      });
    jsonData('post',
    '/api/flipdotapplications', app2)
      .expect(422, function(err, res) {
        assert.equal(res.body.error.statusCode, 422);
        done();
      });
  });
});

describe('Unexpected Usage', function() {
  it('should not crash the server when posting a bad id', function(done) {
    json('post', '/api/customers/foobar')
      .send({})
      .expect(404, done);
  });
});
