const vscode = require("vscode");
const {extractFileNameWithoutExtension, formatFileNameToUpper} = require("./methods");
const data = require("./data/translateable-attributes");
const MAX_CONTENT_LENGTH = data.MAX_CONTENT_LENGTH; 
const PREFIX_I18N_NAME = data.PREFIX_I18N_NAME; 

function transformString(input, fileName) {
  // Extract content from the entire input, including template literals
  const regexPattern = /["'`](.*?)["'`]|([^\s"']+?)/g;
  let match;
  let content = '';

  while ((match = regexPattern.exec(input))) {
    content += match[1] || match[2];
  }

  // Remove template literals from the content for the key
  const keyContent = content.replace(/\${.*?}/g, '').trim();

  // Keep only A-Z and 0-9 characters, then truncate to MAX_CONTENT_LENGTH characters and convert to uppercase
  const formattedKeyContent = keyContent.replace(/[^a-zA-Z0-9]/g, '');
  const truncatedKeyContent = formattedKeyContent.substring(0, MAX_CONTENT_LENGTH).toUpperCase();

  // Format fileName to uppercase and remove unwanted characters
  const formattedFileName = fileName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  const key = `@@${PREFIX_I18N_NAME}_${formattedFileName}_${truncatedKeyContent}`;

  return `$localize\`:${key}:${content}\``;
}



function createI18nTsCommand(context) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active text editor found");
    return;
  }

  const filePath = editor.document.fileName;
  const filenameWithoutExtension = extractFileNameWithoutExtension(filePath);
  const filenameForTranslation = formatFileNameToUpper(filenameWithoutExtension);

  editor.edit(editBuilder => {
    // Iterate over all selections
    editor.selections.forEach(selection => {
      const selectedText = editor.document.getText(selection);
      const transformedText = transformString(selectedText, filenameForTranslation);

      // Replace each selected text with its transformed version
      editBuilder.replace(selection, transformedText);
    });
  });
}

module.exports = createI18nTsCommand;

module.exports = createI18nTsCommand;
