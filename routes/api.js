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
        if (err) {
          console.log(err);
        } else if (!foundProject) {
          res.json(`No issues found for ${project} project.`);
        } else {
          let queryObject = filterProvidedInputs(req.query);
          if (req.query.open == "false") {queryObject.open = false};
          if (req.query.open == "true") {queryObject.open = true};
          //No query - return all found issues
          if (Object.keys(queryObject).length === 0) {
            res.json(foundProject.issues);
          } else {
            // Loop through all key-value pairs provided in query object
            Object.keys(queryObject).forEach(function (key) {
              //Assign all issues that pass the filter to foundProject.issues
              foundProject.issues = foundProject.issues.filter( function (issueObject) {
                //Check wether issue key:value is same as query's key:value
                return issueObject[key] === queryObject[key]
              })
            })
            res.json(foundProject.issues);
          }
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
              let newIssue = filterProvidedInputs(req.body);
              //Set default values
              newIssue.open = true;
              if (!newIssue.assigned_to) {newIssue.assigned_to = "";}
              if (!newIssue.status_text) {newIssue.status_text = "";}
              //Return error message if some of required fields are missing
              if (!newIssue.issue_title || !newIssue.issue_text || !newIssue.created_by) {
                return res.json("Missing required inputs!");
              }
              //Create new issue and push it to the issues array of the found object
              Issue.create(newIssue, function(err, createdIssue) {
                if (err) {
                  console.log(err);
                } else {
                  createdIssue.save();
                  foundProject.issues.push(createdIssue);
                  foundProject.save();
                  res.json(createdIssue);
                }
              })
            }
          })
        }
      });
    })
    
    .put(function (req, res){

      let updateObject = filterProvidedInputs(req.body);
      if (req.body.open == "false") {updateObject.open = false} else {updateObject.open = true};
  
      if (!updateObject._id) {
        return res.json("No ID entered!");
      }
      if (!updateObject.issue_title && !updateObject.issue_text && !updateObject.created_by && !updateObject.assigned_to && !updateObject.status_text && updateObject.open) {
        return res.json("No updated field sent!");
      }
  
      //Find the issue by id and update it with updated fields from updateObject
      Issue.findByIdAndUpdate(req.body._id, updateObject, {new: true}, function(err, updatedIssue) {
        if (err) {
          res.json(`Could not update ${req.body._id}!`)
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
          res.json(`Could not delete ${req.body._id}!`);
        } else {
          res.json(`Deleted ${req.body._id}!`);
        }
      })
      
    });
    
};

//Returns an object with provided inputs from passed object
// =========================================== //
// !!!!! Does not handle fromObject.open !!!!! //
// =========================================== //

function filterProvidedInputs(fromObject) {
  const returnObject = {};

  //Default to "" if not provided
  const _id = fromObject._id || "";
  const issue_title = fromObject.issue_title || "";
  const issue_text = fromObject.issue_text || "";
  const created_by = fromObject.created_by || "";
  const assigned_to = fromObject.assigned_to || "";
  const status_text = fromObject.status_text || "";
  //const open = fromObject.open || "";

  //Check wether the field was provided and assign it to obj (if not, it will be an empty string)
  if (_id) {returnObject._id = _id}
  if (issue_title) {returnObject.issue_title = issue_title};
  if (issue_text) {returnObject.issue_text = issue_text};
  if (created_by) {returnObject.created_by = created_by};
  if (assigned_to) {returnObject.assigned_to = assigned_to};
  if (status_text) {returnObject.status_text = status_text};
  //if (open == "false") {returnObject.open = false} else {returnObject.open = true};
 
  return returnObject;
}