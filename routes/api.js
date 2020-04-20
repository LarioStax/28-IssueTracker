/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
const mongoose = require("mongoose");

const Project = require("../models/project.js");
const Issue = require("../models/issue.js");

// const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let conditions = {name: project};
      Project.findOne(conditions).populate("issues").exec(function (err, foundProject) { //Populate required - returns only individual issues._ids otherwise
        if (err || !foundProject) {
          console.log(err);
        } else {
          res.json(foundProject.issues);
        }
      })
    })
    
    .post(function (req, res){
      var project = req.params.project;

      let conditions = {name: project};
      let update = {};
      let options = {upsert: true, setDefaultsOnInsert: true, new: true};

      // Search for a project with given project name, if not found, create one
      Project.findOneAndUpdate(conditions, update, options, function(err, updatedProject) {
        if (err) {
          console.log(err);
        } else {
          // Search for the (eventually newly created) project with given project name
          Project.findOne(conditions, function(err, foundProject) {
            if (err) {
              console.log(err);
            } else {
              let newIssue = {
                issue_title: req.body.issue_title,
                issue_text: req.body.issue_text,
                created_by: req.body.created_by,
                assigned_to: req.body.assigned_to || "",
                status_text: req.body.status_text || "",
                open: true
              }
              //Create new Issue and push it to the issues array of the found object
              Issue.create(newIssue, function(err, createdIssue) {
                if (err) {
                  console.log(err);
                } else {
                  createdIssue.save();
                  foundProject.issues.push(createdIssue);
                  foundProject.save();
                  console.log(createdIssue);
                  res.json(createdIssue);
                }
              })
            }
          })
        }
      });
    })
    
    .put(function (req, res){
      var project = req.params.project;
      
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      
    });
    
};
