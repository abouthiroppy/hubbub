'use strict';

const inquirer = require('inquirer');

module.exports.selectRepo = (defaultUser, defaultRepo) => {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'user',
      message: 'Input username',
      default: function () {
        return defaultUser;
      }
    },
    {
      type: 'input',
      name: 'repo',
      message: 'Input repository name',
      default: function () {
        return defaultRepo;
      }
    }
  ]);
};

module.exports.base = () => {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Select Pull-Requests or Issues ?',
      choices: [
        'Pull-Requests',
        'Issues',
        new inquirer.Separator(),
        'Jump to repository'
      ]
    }
  ]);
};

module.exports.linksList = (items) => {
  return inquirer.prompt(items);
};
