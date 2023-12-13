const vscode = require('vscode');
const createI18nTsCommand = require('./createi18nts.js');
const createI18nHtmlCommand = require('./createi18nhtml.js');

function activate(context) {
  let disposableTs = vscode.commands.registerCommand('angular-i18n-key-injector.createi18nts', function () {
      createI18nTsCommand(context);
  });

  let disposableHtml = vscode.commands.registerCommand('angular-i18n-key-injector.createi18nhtml', function () {
    createI18nHtmlCommand(context);
  });

  context.subscriptions.push(disposableTs);
  context.subscriptions.push(disposableHtml);

  // Repeat similar pattern for registering HTML command
}

function deactivate() {
  // Deactivation logic if necessary
}

module.exports = {
  activate,
  deactivate
};
