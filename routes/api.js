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
      // BUGS OUT IF PROJECT EMPTY! FIX!
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

      //Default to "" if not provided
      const _id = req.body._id || "";
      const issue_title = req.body.issue_title || "";
      const issue_text = req.body.issue_text || "";
      const created_by = req.body.created_by || "";
      const assigned_to = req.body.assigned_to || "";
      const status_text = req.body.status_text || "";
      const open = req.body.open || "";

      if (!_id) {
        return res.json("No ID entered!");
      }

      if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open) {
        res.json("No updated field sent!");
      }

      let updateObject = {};
      //Check wether the field was updated (if not, it will be an empty string)
      if (issue_title) {updateObject.issue_title = issue_title};
      if (issue_text) {updateObject.issue_text = issue_text};
      if (created_by) {updateObject.created_by = created_by};
      if (assigned_to) {updateObject.assigned_to = assigned_to};
      if (status_text) {updateObject.status_text = status_text};
      if (open) {updateObject.open = false} else {updateObject.open = true};

      //Find the issue by id and update it with updated fields from updateObject
      Issue.findByIdAndUpdate(req.body._id, updateObject, {new: true}, function(err, updatedIssue) {
        if (err) {
          res.json("Could not update " + req.body._id)
        } else {
          updatedIssue.updated_on = new Date();
          res.json("Successfully updated!");
        }
      })
    })
    
    .delete(function (req, res){
      if (!req.body._id) {
        res.json("No ID entered!");
      }
      Issue.findByIdAndRemove(req.body._id, function(err, removedIssue) {
        if (err) {
          res.json("Could not delete " + req.body._id);
        } else {
          res.json("Deleted " + req.body._id);
        }
      })
      
    });
    
};
