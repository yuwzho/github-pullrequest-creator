var fs = require('fs');
const PR_CONFIG = './pr-config.json';

function readConfig(filename) {
  try {
    return require(filename);
  } catch (err) {
    return {};
  }
}
function saveConfig(filename, json) {
  var raw = readConfig(filename);
  var obj = Object.assign(json, raw);
  fs.writeFileSync(filename, JSON.stringify(obj, null, 2));
}
function pr() {
  saveConfig(PR_CONFIG, {
    user: {
      name: '[Your GitHub username]',
      token: '[Your GitHub token, REQUIRED if enable two facotr, IF no token, delete this line]',
      password: '[If no token provided, enter your password here]'
    },
    repo: {
      owner: '[Your repo owner]',
      name: '[Your repo name]'
    },
    branch: {
      prefix: '[Auto created branch\'s prefix]',
      startNumber: 0
    },
    base: {
      owner: '[Your pr base repo\'s owner]',
      branch: '[Your pr base repo\'s branch]'
    },
    pr: {
      title: '[Your pr\'s title]'
    },
    count: 1,
    modifyCount: 20,
    modifyFilePattern: '.md',
    period: 5000
  });
  return PR_CONFIG;
}
(function init(action) {
  var filename = action();
  console.log('Modify ' + filename + ' to enter your information.');
})(pr)
