import React, { Component, PropTypes } from 'react';
import parseAuthoritySpec from '../helpers/parseAuthoritySpec';
import styles from '../../styles/cspace-input/QuickAdd.css';

const propTypes = {
  add: PropTypes.func,
  authority: PropTypes.string,
  displayName: PropTypes.string,
  formatVocabName: PropTypes.func,
  recordTypes: PropTypes.object,
};

const defaultProps = {
  formatVocabName: vocab => vocab.messages.collectionName.defaultMessage,
};

export default class QuickAdd extends Component {
  constructor(props) {
    super(props);

    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  handleButtonClick(event) {
    event.preventDefault();

    const {
      add,
      displayName,
    } = this.props;

    if (add) {
      const {
        authorityname: authorityName,
        vocabularyname: vocabularyName,
      } = event.currentTarget.dataset;

      add(authorityName, vocabularyName, displayName);
    }
  }

  render() {
    const {
      authority,
      displayName,
      formatVocabName,
      recordTypes,
    } = this.props;

    const authorities = parseAuthoritySpec(authority);

    const buttons = authorities.map((authoritySpec) => {
      const {
        authorityName,
        vocabularyName,
      } = authoritySpec;

      const vocabularyConfig =
        recordTypes[authorityName].vocabularies[vocabularyName];

      if (!vocabularyConfig) {
        return null;
      }

      return (
        <li key={`${authorityName}/${vocabularyName}`}>
          <button
            data-authorityname={authorityName}
            data-vocabularyname={vocabularyName}
            onClick={this.handleButtonClick}
          >
            {formatVocabName(vocabularyConfig)}
          </button>
        </li>
      );
    });

    // TODO: i18n of add message

    return (
      <div className={styles.normal}>
        <div>Add <strong>{displayName}</strong> to</div>
        <ul>
          {buttons}
        </ul>
      </div>
    );
  }
}

QuickAdd.propTypes = propTypes;
QuickAdd.defaultProps = defaultProps;
