import React from 'react';
import RenameForm from './RenameForm';
import PropTypes from 'prop-types';

function getCssByFlleExt(ext) {
  switch(ext.toUpperCase()) {
    case 'JS':
      return 'seti-javascript';
    case 'JSX':
      return 'seti-react';
    case 'CSS':
      return 'seti-css';
    case 'LESS':
      return 'seti-less';
    case 'SASS':
    case 'SCSS':
      return 'seti-sass';
    case 'JSON':
      return 'seti-json';
    case 'SVG':
      return 'seti-svg';
    case 'EOT':
    case 'WOFF':
    case 'WOFF2':
    case 'TTF':
      return 'seti-font';
    case 'XML':
      return 'seti-xml';
    case 'YML':
      return 'seti-yml';
    case 'MD':
      return 'seti-markdown';
    case 'HTML':
      return 'seti-html';
    case 'JPG':
    case 'PNG':
    case 'GIF':
    case 'JPEG':
      return 'seti-image';
    default:
      return 'octi-file-text'; 
  }
}

const File = ({ file, dblClickHandler, selectedItem, id, clickHandler, renameFlag, renameHandler }) => {
  return (
    <li
      className={selectedItem.id === id ? 'list-item selected' : 'list-item'}
      onDoubleClick={dblClickHandler.bind(null, file)}
      onClick={clickHandler.bind(null, id, file.path, file.type)}
    >
      {renameFlag && selectedItem.id === id
        ? <RenameForm renameHandler={renameHandler} />
        : <span className={getCssByFlleExt(file.ext)}>{file.name}</span>}
    </li>
  );
};


File.propTypes = {
  file: PropTypes.object.isRequired,
  dblClickHandler: PropTypes.func.isRequired,
  selectedItem: PropTypes.object.isRequired,
  id: PropTypes.number.isRequired,
  clickHandler: PropTypes.func.isRequired,
  renameFlag: PropTypes.bool.isRequired,
  renameHandler: PropTypes.func.isRequired
};

export default File;
