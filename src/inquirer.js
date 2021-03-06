'use strict';

const inquirer = require('inquirer');

module.exports.selectRepo = (defaultUser, defaultRepo) => {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'user',
      message: 'Input username',
      default: () => {
        return defaultUser;
      }
    },
    {
      type: 'input',
      name: 'repo',
      message: 'Input repository name',
      default: () => {
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
  items.choices.unshift(new inquirer.Separator());
  return inquirer.prompt(items);
};
