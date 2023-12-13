const data = require("./data/translateable-attributes");
const MAX_CONTENT_LENGTH = data.MAX_CONTENT_LENGTH; 
const PREFIX_I18N_NAME = data.PREFIX_I18N_NAME;

// Converts string to i18n format or returns empty string
function convertStringToI18n(text, currentFileName) {
  if (typeof text === "undefined" || text.trim() === "") {
    return "";
  }

  const processedText = text
    .replace(/(\r\n|\n|\r)/gm, "")
    .replace(/{{[^}]*}}/g, "")
    .replace(/[.\-'",:;?!()[\]{}\/\\|&*^%$#@+=~`]/g, "")
    .trim()
    .toUpperCase()
    .replace(/ /g, "")
    .substring(0, MAX_CONTENT_LENGTH);

  return processedText ? `@@${PREFIX_I18N_NAME}_${currentFileName}_${processedText}` : "";
}

// Extracts the file name without its extension
function extractFileNameWithoutExtension(filePath) {
  return filePath.split(/[/\\]/).pop().split(".")[0];
}

// Formats file name to uppercase without special characters
function formatFileNameToUpper(fileName) {
  return fileName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

module.exports = {
  convertStringToI18n,
  extractFileNameWithoutExtension,
  formatFileNameToUpper
};