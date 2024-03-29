const vscode = require("vscode");
const HTMLParser = require("node-html-parser");
const data = require("./data/translateable-attributes");

const {convertStringToI18n, extractFileNameWithoutExtension, formatFileNameToUpper} = require("./methods");

//will add for attributes e.g alt="myimagename" alt-i18n="prefix.filename.etc"
const TRANSLATEABLE_ATTRIBUTES = data.TRANSLATEABLE_ATTRIBUTES; 



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



function translateElementTexts(document, CURRENT_FILENAME) {
  const listOfNodes = getAllTextNodes(document);

  listOfNodes.forEach((node) => {
    // Skip nodes where text starts with '@' angular 17 uses @ directive e.g. @if @else etc...
    if (node.rawText.trim().startsWith("@") || node.rawText.trim() === "") {
      return;
    }

    const i18nText = convertStringToI18n(node.rawText, CURRENT_FILENAME);

    if (i18nText === "") {
      return;
    }

    if (node.parentNode.childNodes.length > 1) {
      const element = HTMLParser.parse(`<ng-container i18n="${i18nText}">${node.rawText}</ng-container>`);
      node.parentNode.exchangeChild(node, element);
    } else {
      node.parentNode.rawAttrs = node.parentNode.rawAttrs.replace(/i18n="[^"]*"/g, "").trim();
      node.parentNode.rawAttrs = node.parentNode.rawAttrs === "" ? `i18n="${i18nText}"` : `${node.parentNode.rawAttrs} i18n="${i18nText}"`;
    }
  });
}

function translateAttributes(document, CURRENT_FILENAME) {
  document.querySelectorAll("*").forEach((node) => {
    TRANSLATEABLE_ATTRIBUTES.forEach((attr) => {
      const attrToFind = `${attr}=`;

      if (node.rawAttrs.includes(attrToFind)) {
        const attrString = node.getAttribute(attr);
        const text = convertStringToI18n(attrString, CURRENT_FILENAME);

        if (text === "") {
          return;
        }

        if (node.rawAttrs.includes(`i18n-${attr}`)) {
          node.rawAttrs = node.rawAttrs.replace(new RegExp(`i18n-${attr}="[^"]*"`), "");
        }

        node.rawAttrs = node.rawAttrs.trim();
        node.rawAttrs += node.rawAttrs.endsWith(" ") ? `i18n-${attr}="${text}"` : ` i18n-${attr}="${text}"`;
      }
    });
  });
}

function createi18nHtml(context) {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage("No active text editor found");
    return;
  }

  const filePath = editor.document.fileName;
  var filenameWithoutExtension = extractFileNameWithoutExtension(filePath);
  const filenameForTranslation = formatFileNameToUpper(filenameWithoutExtension);

  const editorText = editor.document.getText();
  const document = HTMLParser.parse(editorText);

  translateElementTexts(document, filenameForTranslation);
  translateAttributes(document, filenameForTranslation);

  editor.edit((editBuilder) => {
    const documentAsString = document.toString();
    editBuilder.replace(new vscode.Range(0, 0, editor.document.lineCount, 0), documentAsString);
  });
}

module.exports = createi18nHtml;
