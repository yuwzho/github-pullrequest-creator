var bluebird = require('bluebird');
var execSync = require('child_process').execSync;
var fs = require('fs');
var githubApi = require('node-github');
var path = require('path');
var sleep = require('sleep');

function GitHubCreator(user) {
  var github = new githubApi({
    debug: true,
    protocol: "https",
    host: "api.github.com",
    pathPrefix: "/api/v3", // for some GHEs; none for GitHub
    version: '3.0.0',
    headers: {
      "user-agent": "nodejs" // GitHub require it
    },
    Promise: bluebird,
    followRedirects: false, // default: true; 
    // there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    timeout: 5000
  });

  if (user.token) {
    github.authenticate({
      type: 'oauth',
      token: user.token
    });
  } else if (user.name && user.passwd) {
    github.authenticate({
      ype: 'basic',
      username: user.name,
      password: user.passwd
    });
  }
  else {
    throw ('No authenticate!');
  }
  return github;
}

function getRepoUrl(repo, user) {
  if (!repo || !repo.owner || !repo.name) {
    throw ('Missing repo option');
  }
  return 'https://' + user.name + ':' + (user.token || user.passwd) + '@github.com/' + repo.owner + '/' + repo.name;
}

// clone the repo and direct to it.
function chdirToRepo(repo, user) {
  if (!fs.existsSync(repo.name)) {
    // clone the repo, require user.name here
    execSync('git clone ' + getRepoUrl(repo, user));
  }
  process.chdir(repo.name);
}

function pushChange(repo, branchName, user) {
  execSync('git add --all');
  execSync('git commit -m"Auto modify files"');
  execSync('git push ' + getRepoUrl(repo, user) + ' ' + branchName + ':' + branchName);
}

function branchNameGenerator(branch, number) {
  return branch.prefix + '-' + (branch.startNumber + number);
}

function branchSwitch(defaultBranch, branch) {
  execSync('git checkout .');
  execSync('git checkout ' + defaultBranch);
  execSync('git pull origin ' + defaultBranch);
  try {
    execSync('git branch ' + branch);
  } catch (err) {
    console.error(err.message || err);
  }

  try {
    execSync('git checkout ' + branch);
    execSync('git pull origin ' + branch);
  } catch (err) {
    console.error(err.message || err);
  }
}

function modifyContent(modifyCount) {
  // modify file
  for (var i = 0; i < modifyCount; i++) {
    try {
      var filename = getFileRandom('.');
      modifyRandom(filename);
    } catch (err) {
      console.error(err.message || err);
    }
  }

  function getFileRandom(dir) {
    var files = fs.readdirSync(dir);
    var item = files[Math.floor(Math.random() * files.length)];
    var filename = dir + '/' + item;
    // ignore .git
    if(filename.startsWith('./.git')) {
      return;
    }
    var state = fs.lstatSync(filename);
    if (state.isFile()) { /* file */
      return filename;
    } else if (state.isDirectory()) { /* dir */
      return getFileRandom(filename);
    }
  }

  function modifyRandom(filename) {
    filename = filename || 'tempfile.txt';
    console.log('modify ' + filename);
    execSync('echo I m a robot! I do nothing! >> ' + filename);
  }
}

(function entry(config) {
  var options;
  try {
    options = require(config);
  } catch (err) {
    console.error(err.message || err);
    console.log('Run npm install to seup up your config');
  }
  var github = GitHubCreator(options.user);

  var repo = options.repo;
  var user = options.user;
  chdirToRepo(repo, user);

  // will spell branch name with branch.prefix + (branch.startNumber + count)
  // check the value is already set
  var branch = options.branch;
  if (!branch || !branch.prefix) {
    throw ('Missing branch option');
  }
  branch.startNumber = branch.startNumber || 0;

  var base = options.base;
  if (!base || !base.branch) {
    throw ('Missing base option');
  }
  if (!base.owner) {
    console.log('base owner not specific, use ' + repo.owner);
    base.owner = repo.owner;
  }

  var pr = options.pr;
  if (!pr || !pr.title) {
    throw ('Missing pr option');
  }

  // github, branchName, modifyCount, repo, title, base
  for (var i = 0; i < options.count; i++) {
    var branchName = branchNameGenerator(branch, i);
    // switch branch
    branchSwitch(base.branch, branchName);

    // modify file
    modifyContent(options.modifyCount);

    // commit and push
    pushChange(repo, branchName, user);

    // creat pr
    github.pullRequests.create({
      user: base.owner,
      repo: repo.name,
      title: pr.title,
      body: pr.body,
      head: repo.owner + ':' + branchName,
      base: base.branch,
    });
    sleep.sleep(options.period);
  }
})('./pr-config.json');