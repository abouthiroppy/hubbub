#!/usr/bin/env node

'use strict';

const process  = require('process');
const open     = require('open');
const chalk    = require('chalk');
const github   = require('./github');
const inquirer = require('./inquirer');
const Spinner  = require('cli-spinner').Spinner;

const spinner = new Spinner('loading.... %s');
spinner.setSpinnerString('.oO°Oo.');

Promise.resolve().then(() => {
  return github.init();
}).catch(() => {
  console.error('Can\'t find .git ;(');
  process.exit(-1);
}).then((info) => {
  return inquirer.selectRepo(info.user, info.repo);
}).then((info) => {
  github.updateInfo(info);
  return inquirer.base().then((res) => Object.assign(res, info));
}).then((ans) => {
  switch (ans.type) {
    case 'Pull-Requests':
      spinner.start();
      return github.fetchPullRequests(ans.user, ans.repo);
    case 'Issues':
      spinner.start();
      return github.fetchIssues(ans.user, ans.repo);
    case 'Jump to repository':
      open(github.getInfo().remoteUrl);
      process.exit(0);
  }
}).catch((err) => {
  spinner.stop(true);
  console.error(err.message);
  process.exit(-1);
}).then((items) => {
  spinner.stop(true);
  createList(items)();
}).catch((err) => {
  console.log(err);
});

function createList(items) {
  const [title, itemsList] = items;

  if (itemsList.length === 0) {
    console.log(`${title} is empty.`);
    process.exit(0);
  }

  return function loop() {
    return inquirer.linksList({
      type: 'list',
      name: 'link',
      message: chalk.cyan(`${title} (${itemsList.length})`),
      choices: itemsList.map((e) => {
        e.name  = e.title;
        e.value = e.htmlUrl;
        return e;
      }),
      paginated: true
    }).then((res) => open(res.link))
      .then(loop)
      .catch((err) => console.log(err));
  };
}
