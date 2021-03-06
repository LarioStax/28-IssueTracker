/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../app');

chai.use(chaiHttp);

let savedId = "";

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Title");
          assert.equal(res.body.issue_text, "text");
          assert.equal(res.body.created_by, "Functional Test - Every field filled in");
          assert.equal(res.body.assigned_to, "Chai and Mocha");
          assert.equal(res.body.status_text, "In QA");
          //Save ID --> Will be required for put and delete tests
          savedId = res.body._id;
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Required fields filled in',
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Title");
          assert.equal(res.body.issue_text, "text");
          assert.equal(res.body.created_by, "Functional Test - Required fields filled in");
          done();
        });
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body, "Missing required inputs!")
          done();
        });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
        .put("/api/issues/test")
        .send({_id: savedId})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "No updated field sent!")
          done();
        })
      });
      
      test('One field to update', function(done) {
        chai.request(server)
        .put("/api/issues/test")
        .send({
          _id: savedId,
          issue_title: "NEW TITLE"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "Successfully updated!");
          done();
        })
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
        .put("/api/issues/test")
        .send({
          _id: savedId,
          issue_title: "NEW TITLE",
          issue_text: "NEW TEXT"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "Successfully updated!");
          done();
        })
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get("/api/issues/test")
        .query({issue_title: "NEW TITLE"})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body[0], 'issue_title');
          assert.equal(res.body[0].issue_title, 'NEW TITLE');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        })
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get("/api/issues/test")
        .query({issue_title: "NEW TITLE", issue_text: "NEW TEXT"})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body[0], 'issue_title');
          assert.equal(res.body[0].issue_title, 'NEW TITLE');
          assert.property(res.body[0], 'issue_text');
          assert.equal(res.body[0].issue_text, 'NEW TEXT');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        })
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
        .delete('/api/issues/apitest')
        .send({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body, "No ID entered!");
          done();
        })
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
        .delete("/api/issues/test")
        .send({_id: savedId})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, `Deleted ${savedId}!`)
          done();
        })
      });
      
    });

});
