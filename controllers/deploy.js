
var fs = require('fs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var path = require('path');

var async = require('async');
var _ = require('lodash');

var config = require('../config/app');

var getHook = function(req, res) {
  var file = path.join(process.cwd(), 'sample', 'github-multiplecommit.json');
  fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
      console.log(err);
      return res.status(500).send(config.result('Error', 'Just internal error'));
    }
    processHook(JSON.parse(data), res);
  });
}

var postHook = function(req, res) {
  processHook(req.body, res);
}

var pullLatest = function(hookBody, configData, branch, callback) {

  var name = hookBody.repository.name.capitalize();

  async.waterfall([
    function (cb){
      // discard changes
      var command = "git reset --hard HEAD";
      console.log('['+ name + '] : ' + command);
      var child1 = exec( command, {cwd: configData.path}, function(err, stdout, stderr) {
        if (err) {
          console.log('['+ name + '] : ' + 'err');
          console.log(err);
          console.log(stdout);
          cb(err);
        }
        else {
          console.log('['+ name + '] : ' + 'done');
          console.log(stdout);
          cb(null, 'OK');
        }
      });
    },
    function(data, cb){
      // pull latest
      var command = "git pull origin " + branch;
      console.log('['+ name + '] : ' + command);
      var child2 = exec(command, {cwd: configData.path}, function(err, stdout, stderr) {
        if (err) {
          console.log('['+ name + '] : ' + 'err');
          console.log(err);
          console.log(stdout);
          cb(err);
        }
        else {
          console.log('['+ name + '] : ' + 'done');
          console.log(stdout);
          cb(null, 'OK');
        }
      });
    },
    function(data, cb){
      // Only for simaya
      if (name === 'Simaya') {
        var command = path.join(process.cwd(), 'bin', 'update.sh');
        console.log('['+ name + '] : ' + command);
        var child2 = exec(command, function(err, stdout, stderr) {
          if (err) {
            console.log('['+ name + '] : ' + 'err');
            console.log(err);
            console.log(stdout);
            cb(err);
          }
          else {
            console.log('['+ name + '] : ' + 'done');
            console.log(stdout);
            cb(null, 'OK');
          }
        });
      }
      else {
        cb(null, 'Not do this');
      }
    },
  ], function (err, result) {
    if (err) {
      callback(err);
    }  
    else {
      callback(null, 'OK');
    }
  });

}

var processHook = function(hookBody, res) {

  if (hookBody.repository && hookBody.commits) {
    var name = hookBody.repository.name;
    if (config.repo[name]) {

      var configData = config.repo[name];
      var branch = [ hookBody.ref.replace('refs/heads/','') ];
      if (_.intersection(config.repo[name].branch, branch).length > 0) {
        console.log('[' + name.capitalize() + ']. ' + hookBody.commits.length + ' new commits. Deploy to ' + config.repo[name].path + ' on branch ' + branch);
        console.log('[' + name.capitalize() + ']. commits :');
        var commits = _.map(hookBody.commits, function(commit) { 
          var simpleCommit = {
            message: commit.message,
            author: commit.author.name,
            url: commit.url
          }
          console.log(simpleCommit);
          return simpleCommit;
        })

        pullLatest(hookBody, configData, branch, function(err, result) {
          // Do nothing;
        });
      }
      else {
        console.log('Branch ' + branch + ' is not registered for auto deploy');
      }

      res.status(200).send(config.result('OK', 'POST hook processed'));

    }
    else {
      res.status(403).send(config.result('Error', 'Repo is not listed'));
    }
  }
  else {
    res.status(403).send(config.result('Error', 'Not a valid POST hook'));
  }
}

module.exports = {
  getHook: getHook,
  postHook: postHook
}