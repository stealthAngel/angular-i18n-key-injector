  const vscode = require('vscode');
  const HTMLParser = require('node-html-parser');
  const data = require('./data/translateable-attributes');

  const TRANSLATEABLE_ATTRIBUTES = data.TRANSLATEABLE_ATTRIBUTES; //will add for attributes e.g alt="myimagename" alt-i18n="prefix.filename.etc"
  const PREFIX_I18N_NAME = data.PREFIX_I18N_NAME;

  function getFileNameWithoutExtension(filePath) {
      return filePath.split(/[/\\]/).pop().split('.').shift();
  }

  function formatFileName(fileName) {
    // Replace non-letter and non-number characters with empty string
    // and convert to uppercase
    return fileName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  function getAllTextNodes(node) {
      if (!node) return [];

      return node.childNodes.reduce((listOfNodes, childNode) => {
          if (childNode.nodeType === 3 && childNode.rawText.trim()) {
              listOfNodes.push(childNode);
          } else {
              listOfNodes.push(...getAllTextNodes(childNode));
          }
          return listOfNodes;
      }, []);
  }

  function stringToi18nTextOrEmpty(text, CURRENT_FILENAME) {
      if (typeof text === 'undefined') return '';

      text = text.replace(/(\r\n|\n|\r)/gm, "")
          .replace(/{{[^}]*}}/g, '')
          .replace(/[.\-'",:;?!()[\]{}\/\\|&*^%$#@+=~`]/g, '')
          .trim()
          .toUpperCase()
          .replace(/ /g, '')
          .substring(0, 50);

      return text ? `@@${PREFIX_I18N_NAME}${CURRENT_FILENAME}_${text}` : '';
  }

  function translateElementTexts(document, CURRENT_FILENAME) {
      const listOfNodes = getAllTextNodes(document);

      listOfNodes.forEach(node => {
        // Skip nodes where text starts with '@' angular 17 uses @ directive e.g. @if @else etc...
        if (node.rawText.trim().startsWith('@') || node.rawText.trim() === '') {
          return;
        }

        const i18nText = stringToi18nTextOrEmpty(node.rawText, CURRENT_FILENAME);

        if (i18nText === '') {
            return;
        }

        if (node.parentNode.childNodes.length > 1) {
            const element = HTMLParser.parse(`<ng-container i18n="${i18nText}">${node.rawText}</ng-container>`);
            node.parentNode.exchangeChild(node, element);
        } else {
            node.parentNode.rawAttrs = node.parentNode.rawAttrs.replace(/i18n="[^"]*"/g, '').trim();
            node.parentNode.rawAttrs = node.parentNode.rawAttrs === '' ? `i18n="${i18nText}"` : `${node.parentNode.rawAttrs} i18n="${i18nText}"`;
        }
      });
  }

  function translateAttributes(document, CURRENT_FILENAME) {
      document.querySelectorAll('*').forEach(node => {
          TRANSLATEABLE_ATTRIBUTES.forEach(attr => {
              const attrToFind = `${attr}=`;

              if (node.rawAttrs.includes(attrToFind)) {
                  const attrString = node.getAttribute(attr);
                  const text = stringToi18nTextOrEmpty(attrString, CURRENT_FILENAME);

                  if (text === '') {
                      return;
                  }

                  if (node.rawAttrs.includes(`i18n-${attr}`)) {
                      node.rawAttrs = node.rawAttrs.replace(new RegExp(`i18n-${attr}="[^"]*"`), '');
                  }

                  node.rawAttrs = node.rawAttrs.trim();
                  node.rawAttrs += node.rawAttrs.endsWith(' ') ? `i18n-${attr}="${text}"` : ` i18n-${attr}="${text}"`;
              }
          });
      });
  }

  function activate(context) {
      let disposable = vscode.commands.registerCommand('angular-i18n-key-injector.createi18n', function () {
          const editor = vscode.window.activeTextEditor;

          if (!editor) {
              vscode.window.showErrorMessage("No active text editor found");
              return;
          }

          const filePath = editor.document.fileName;
          var filenameWithoutExtension = getFileNameWithoutExtension(filePath);
          const filenameForTranslation = formatFileName(filenameWithoutExtension);

          const editorText = editor.document.getText();
          const document = HTMLParser.parse(editorText);

          translateElementTexts(document, filenameForTranslation);
          translateAttributes(document, filenameForTranslation);

          editor.edit(editBuilder => {
              const documentAsString = document.toString();
              editBuilder.replace(new vscode.Range(0, 0, editor.document.lineCount, 0), documentAsString);
          });
      });

      context.subscriptions.push(disposable);
  }

  function deactivate() {}

  module.exports = {
      activate,
      deactivate
  };