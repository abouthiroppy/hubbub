'use strict';

const path       = require('path');
const parse      = require('parse-git-config');
const findConfig = require('find-config');
const GitHubApi  = require('github');

let github;
const info = {};

module.exports.init = () => {
  return new Promise((resolve, reject) => {
    let gitPath;

    try {
      gitPath = findConfig('.git');
    } catch(e) {
      throw new Error('error');
    }

    parse({path: path.resolve(gitPath, 'config')}, (err, config) => {
      const [user, repo] = config['remote "origin"'].url.split(':')[1].split('/');
      info.user = user;
      info.repo = repo.split('.git')[0];

      info.remoteUrl =
        `https://github.com/${config['remote "origin"'].url.split('git@github.com:')[1]}`;

      github = new GitHubApi({
        debug: false,
        protocol: 'https',
        // host: 'github.my-GHE-enabled-company.com', // should be api.github.com for GitHub
        host: 'api.github.com',
        // pathPrefix: '/api/v3', // for some GHEs; none for GitHub
        timeout: 5000,
        version: '3.0.0',
        headers: {
          'user-agent': 'My-Cool-GitHub-App' // GitHub is happy with a unique user agent
        },
        followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
      });

      resolve(info);
    });
  });
};

// [TODO] create remote url

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
      user: user,
      repo: repo
    }, (err, res) => {
      if (err) {
        reject(err);
      }
      else {
        res.forEach((item) => {
          items.push({
            htmlUrl: item.html_url,
            title: item.title,
            state: item.state
          })
        });
        resolve(['Pull-Requests', items]);
      }
    });
  });
};

module.exports.fetchIssues = (user = info.user, repo = info.repo) => {
  return new Promise((resolve, reject) => {
    const items = [];

    // [TODO] fix
    // github-api requests authentication to get all issues...
    const request = require('superagent');
    request(`api.github.com/repos/${user}/${repo}/issues`).end((err, res) => {
      res.body.forEach((item) => {
        items.push({
          title  : item.title,
          state  : item.state,
          htmlUrl: item.html_url
        })
      });
      resolve(['Issues', items]);
    });
  });
}
