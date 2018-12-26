// return file extension by file name - Ryan Yang
function getFileExt(fileName) {
  // todo: handle special file names (eg. .gitignore .babelrc)
  let arr = fileName.split(".");
  if (arr.length == 1) return "";
  else return arr[arr.length - 1];
}
// return css class by file extension - Ryan Yang
function getCssClassByFileExt(ext) {
  switch (ext.toUpperCase()) {
    case "JS":
      return "seti-javascript";
    case "JSX":
      return "seti-react";
    case "CSS":
      return "seti-css";
    case "LESS":
      return "seti-less";
    case "SASS":
    case "SCSS":
      return "seti-sass";
    case "JSON":
      return "seti-json";
    case "SVG":
      return "seti-svg";
    case "EOT":
    case "WOFF":
    case "WOFF2":
    case "TTF":
      return "seti-font";
    case "XML":
      return "seti-xml";
    case "YML":
      return "seti-yml";
    case "MD":
      return "seti-markdown";
    case "HTML":
      return "seti-html";
    case "JPG":
    case "PNG":
    case "GIF":
    case "JPEG":
      return "seti-image";
    default:
      return "octi-file-text";
  }
}

module.exports = { getFileExt, getCssClassByFileExt };