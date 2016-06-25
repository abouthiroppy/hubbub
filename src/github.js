'use strict';

const path       = require('path');
const parse      = require('parse-git-config');
const findConfig = require('find-config');
const GitHubApi  = require('github');

let github;
let info;

module.exports.init = () => {
  return new Promise((resolve, reject) => {
    let gitPath;

    try {
      gitPath = findConfig('.git');
    } catch(e) {
      throw new Error('error');
    }

    parse({path: path.resolve(gitPath, 'config')}, (err, config) => {
      const urlArr = config['remote "origin"'].url.split(':');
      const path = urlArr[1];
      const host =
        urlArr[0].split('@')[1] === 'github.com' ?
        'api.github.com' :
        urlArr[0].split('@')[1];

      const user = path.split('/')[0];
      let repo = path.split('/')[1];
      let protocol = 'https'; // [TODO] check http or https

      repo = repo.split('.git')[0];
      info = {
        user,
        host,
        repo,
        protocol,
        debug  : false,
        timeout: 5000,
        version: '3.0.0',
        headers: {
          'user-agent': 'Huben'
        },
        remoteUrl      : `https://github.com/${user}/${repo}`,
        followRedirects: false
      };

      // for GHE
      if (info.host !== 'api.github.com') {
        protocol = 'http'; // in my office...

        Object.assign(info, {
          protocol,
          remoteUrl : `${protocol}://${host}/${user}/${repo}`,
          pathPrefix: '/api/v3'
        });
      }

      github = new GitHubApi(info);

      // github.authenticate({
      //   type: 'basic',
      //   username: '',
      //   password: ''
      // });
      resolve(info);
    });
  });
};

module.exports.updateInfo = (obj) => {
  return Object.assign(info, obj);
};

module.exports.getInfo = () => {
  return info;
};

module.exports.fetchPullRequests = (user = info.user, repo = info.repo) => {
  return new Promise((resolve, reject) => {
    const items = [];

    github.pullRequests.getAll({
      user,
      repo
    }, (err, res) => {
      if (err) {
        reject(err);
      }
      else {
        res.forEach((item) => {
          items.push({
            title  : item.title,
            state  : item.state,
            htmlUrl: item.html_url
          });
        });
        resolve(['Pull-Requests', items]);
      }
    });
  });
};

module.exports.fetchIssues = (user = info.user, repo = info.repo) => {
  return new Promise((resolve, reject) => {
    const items = [];

    github.issues.getForRepo({
      user,
      repo
    }, (err, res) => {
      if (err) {
        reject(err);
      }
      res.forEach((item) => {
        items.push({
          title  : item.title,
          state  : item.state,
          htmlUrl: item.html_url
        });
      });
      resolve(['Issues', items]);
    });
  });
};
