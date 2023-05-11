// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
var HTMLParser = require('node-html-parser');
var data = require('./data/translateable-attributes');
var TRANSLATEABLE_ATTRIBUTES = data.translateableAttributes;

let CURRENT_FILENAME = '';
let PREFIX_I18N_NAME = 'ANGULAR_';

function setLocalFileName(editor) {
  let filePath = editor.document.fileName;

  let fileNameWithoutPath = filePath.split('\\').pop().split('/').pop();
  // remove file extension, remove . and -, convert to uppercase
  CURRENT_FILENAME = fileNameWithoutPath.split('.').shift().replace(/[-.]/g, '').toUpperCase();
}

function getAllTextNodes(node) {
  var listOfNodes = [];
  if (node) {
    for (var i = 0; i < node.childNodes.length; i++) {
      var childNode = node.childNodes[i];
      if (childNode.rawText.toString().trim() !== "" && childNode.nodeType == 3) {
        listOfNodes[listOfNodes.length] = childNode;
      } else {
        listOfNodes = listOfNodes.concat(getAllTextNodes(childNode));
      }
    }
  }
  return listOfNodes;
}

function translateElementTexts(document) {

  var listOfNodes = getAllTextNodes(document);
  
  listOfNodes.forEach(function(node) {
    var i18nText = stringToi18nTextOrEmpty(node.rawText);

    if (i18nText === '') {
      return;
    }

    //if the parent contains more childs with translations replace the current one with ng container
    if (node.parentNode.childNodes.length > 1) {
      var element = HTMLParser.parse(`<ng-container i18n="${i18nText}">${node.rawText}</ng-container>`);
      node.parentNode.exchangeChild(node, element);
    } else {
      //remove all i18n attributes
      node.parentNode.rawAttrs = node.parentNode.rawAttrs.replace(/i18n="[^"]*"/g, '');
      //remove all spaces after
      node.parentNode.rawAttrs = node.parentNode.rawAttrs.trim();
      //solves double space issue if there are no attributes
      if(node.parentNode.rawAttrs === ''){
        node.parentNode.rawAttrs = `i18n="${i18nText}"`;
      }else{
        node.parentNode.rawAttrs += ` i18n="${i18nText}"`;
      }
    }
  });
}

function translateAttributes(document) {
  document.querySelectorAll('*').forEach((function(node) {
    TRANSLATEABLE_ATTRIBUTES.forEach(attr => {

      var attrToFind = attr + '=';

      if (node.rawAttrs.includes(attrToFind)) {

        var attrString = node.getAttribute(attr);

        var text = stringToi18nTextOrEmpty(attrString);
        if (text === '') {
          return;
        }

        //remove if exists
        if (node.rawAttrs.includes(`i18n-${attr}`)) {
          node.rawAttrs = node.rawAttrs.replace(new RegExp(`i18n-${attr}="[^"]*"`), '');
        }
        //remove all spaces after
        node.rawAttrs = node.rawAttrs.trim();
        
        if (node.rawAttrs.endsWith(' ')) {
          node.rawAttrs += `i18n-${attr}="${text}"`;
        }
        else {
          node.rawAttrs += ` i18n-${attr}="${text}"`;
        }
      }
    });
  }));


}


function stringToi18nTextOrEmpty(arg1) {

  let text = arg1;

  if (typeof text === undefined) {
    return '';
  }

  text = text.replace(/(\r\n|\n|\r)/gm, "");

  //remove all {{ }} 
  text = text.replace(/{{[^}]*}}/g, '').trim();

  //remove . ' " - , : ; ? ! ( ) [ ] { } / \ | & * ^ % $ # @ + = ~ `
  text = text.replace(/[.\-'",:;?!()[\]{}\/\\|&*^%$#@+=~`]/g, '').trim();

  //text to uppercase
  text = text.toUpperCase().replace(/ /g, '');

  //get first 20 characters
  text = text.substring(0, 50);

  if(text === ''){
    return '';
  }

  return `@@${PREFIX_I18N_NAME}` + CURRENT_FILENAME + "_" + text;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

  let disposable2 = vscode.commands.registerCommand('vs-code-angular-i18n-key-injector.createi18n', function() {

    //set local editor
    var editor = vscode.window.activeTextEditor;

    setLocalFileName(editor);

    //editor to text
    var editorText = editor.document.getText();

    var document = HTMLParser.parse(editorText);

    translateElementTexts(document);

    translateAttributes(document);

    editor.edit(editBuilder => {
      editBuilder.replace(new vscode.Range(0, 0, editor.document.lineCount, 0), document.toString());
    });

  })

  context.subscriptions.push(disposable1);
  context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
}