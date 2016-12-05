import React, { Component, PropTypes } from 'react';
import { getDisplayName } from 'cspace-refname';
import FilteringDropdownMenuInput from './FilteringDropdownMenuInput';
import QuickAdd from './QuickAdd';
import parseAuthoritySpec from '../helpers/parseAuthoritySpec';
import { getPath } from '../helpers/pathHelpers';
import styles from '../../styles/cspace-input/AuthorityControlledInput.css';

const propTypes = {
  ...FilteringDropdownMenuInput.propTypes,
  addTerm: PropTypes.func,
  findMatchingTerms: PropTypes.func,
  formatMoreCharsRequiredMessage: PropTypes.func,
  formatSearchResultMessage: PropTypes.func,
  formatVocabName: PropTypes.func,
  matches: PropTypes.object,
  minLength: PropTypes.number,
  recordTypes: PropTypes.object,
};

const defaultProps = {
  formatMoreCharsRequiredMessage: () => 'Continue typing to find matching terms',
  formatSearchResultMessage: (count) => {
    const matches = count === 1 ? 'match' : 'matches';
    const num = count === 0 ? 'No' : count;

    return `${num} ${matches} found`;
  },
  // TODO: Make configurable
  minLength: 3,
};

const getOptions = (authority, matches, partialTerm, recordTypes) => {
  const authorities = parseAuthoritySpec(authority);
  const options = [];

  if (matches) {
    const partialTermMatch = matches.get(partialTerm);

    if (partialTermMatch) {
      authorities.forEach((authoritySpec) => {
        const {
          authorityName,
          vocabularyName,
        } = authoritySpec;

        const authorityServiceName = recordTypes[authorityName].serviceConfig.name;
        const authorityMatch = partialTermMatch.getIn([authorityServiceName, vocabularyName]);

        if (authorityMatch) {
          const items = authorityMatch.get('items');

          if (items) {
            const authorityOptions = items.map(item => ({
              value: item.refName,
              label: item.termDisplayName,
            }));

            options.push(...authorityOptions);
          }
        }
      });
    }
  }

  return options;
};

const isPending = (authority, matches, partialTerm, recordTypes) => {
  const authorities = parseAuthoritySpec(authority);
  let foundPending = false;

  if (matches) {
    const partialTermMatch = matches.get(partialTerm);

    if (partialTermMatch) {
      authorities.forEach((authoritySpec) => {
        const {
          authorityName,
          vocabularyName,
        } = authoritySpec;

        const authorityServiceName = recordTypes[authorityName].serviceConfig.name;
        const authorityMatch = partialTermMatch.getIn([authorityServiceName, vocabularyName]);

        if (authorityMatch) {
          foundPending = foundPending || authorityMatch.get('isSearchPending') || authorityMatch.get('isAddPending');
        }
      });
    }
  }

  return foundPending;
};

const getNewTerm = (authority, matches, partialTerm, recordTypes) => {
  const authorities = parseAuthoritySpec(authority);
  let newTerm = null;

  if (matches) {
    const partialTermMatch = matches.get(partialTerm);

    if (partialTermMatch) {
      authorities.forEach((authoritySpec) => {
        const {
          authorityName,
          vocabularyName,
        } = authoritySpec;

        const authorityServiceName = recordTypes[authorityName].serviceConfig.name;
        const authorityMatch = partialTermMatch.getIn([authorityServiceName, vocabularyName]);

        if (authorityMatch) {
          newTerm = newTerm || authorityMatch.get('newTerm');
        }
      });
    }
  }

  return newTerm;
};

export default class AuthorityControlledInput extends Component {
  constructor(props) {
    super(props);

    this.findMatchingTerms = this.findMatchingTerms.bind(this);
    this.handleDropdownInputCommit = this.handleDropdownInputCommit.bind(this);
    this.handleDropdownInputRef = this.handleDropdownInputRef.bind(this);

    this.state = {
      partialTerm: null,
      value: props.value,
    };
  }

  componentWillReceiveProps(nextProps) {
    const newTerm = getNewTerm(
      nextProps.authority, nextProps.matches, this.state.partialTerm, nextProps.recordTypes
    );

    const hadNewTerm = getNewTerm(
      this.props.authority, this.props.matches, this.state.partialTerm, this.props.recordTypes
    );

    if (newTerm && !hadNewTerm) {
      this.commit(newTerm.getIn(['document', 'ns2:collectionspace_core', 'refName']));
      this.dropdownInput.close();
    } else {
      const newState = {
        value: nextProps.value,
      };

      if (!isPending(
        nextProps.authority, nextProps.matches, this.state.partialTerm, nextProps.recordTypes
      )) {
        newState.options = getOptions(
          nextProps.authority, nextProps.matches, this.state.partialTerm, nextProps.recordTypes
        );
      }

      this.setState(newState);
    }
  }

  commit(value) {
    this.setState({
      options: [],
      partialTerm: null,
      value,
    });

    const {
      onCommit,
    } = this.props;

    if (onCommit) {
      onCommit(getPath(this.props), value);
    }
  }

  findMatchingTerms(partialTerm) {
    const {
      authority,
      findMatchingTerms,
      matches,
      minLength,
      recordTypes,
    } = this.props;

    const newState = {
      partialTerm,
    };

    const searchNeeded =
      findMatchingTerms && partialTerm
      && partialTerm.length >= minLength
      && (!matches || !matches.has(partialTerm));

    if (searchNeeded) {
      // TODO: Pause to debounce
      findMatchingTerms(partialTerm);
    } else {
      newState.options = getOptions(authority, matches, partialTerm, recordTypes);
    }

    this.setState(newState);
  }

  handleDropdownInputCommit(path, value) {
    this.commit(value);
  }

  handleDropdownInputRef(ref) {
    this.dropdownInput = ref;
  }

  renderQuickAdd() {
    const {
      addTerm,
      authority,
      formatVocabName,
      minLength,
      recordTypes,
    } = this.props;

    const {
      partialTerm,
    } = this.state;

    if (partialTerm && partialTerm.length >= minLength) {
      return (
        <QuickAdd
          add={addTerm}
          authority={authority}
          displayName={partialTerm}
          formatVocabName={formatVocabName}
          recordTypes={recordTypes}
        />
      );
    }

    return null;
  }

  render() {
    const {
      authority,
      formatMoreCharsRequiredMessage,
      formatSearchResultMessage,
      matches,
      minLength,
      recordTypes,
      /* eslint-disable no-unused-vars */
      addTerm,
      findMatchingTerms,
      formatVocabName,
      /* eslint-enable no-unused-vars */
      ...remainingProps
    } = this.props;

    const {
      options,
      partialTerm,
      value,
    } = this.state;

    const moreCharsRequired = (
      typeof partialTerm !== 'undefined' &&
      partialTerm !== null &&
      partialTerm.length < minLength
    );

    const formatStatusMessage = moreCharsRequired
      ? formatMoreCharsRequiredMessage
      : formatSearchResultMessage;

    const className = isPending(authority, matches, partialTerm, recordTypes)
      ? styles.searching
      : styles.normal;

    return (
      <FilteringDropdownMenuInput
        {...remainingProps}
        className={className}
        filter={this.findMatchingTerms}
        formatStatusMessage={formatStatusMessage}
        menuFooter={this.renderQuickAdd()}
        options={options}
        ref={this.handleDropdownInputRef}
        value={value}
        valueLabel={getDisplayName(value)}
        onCommit={this.handleDropdownInputCommit}
      />
    );
  }
}

AuthorityControlledInput.propTypes = propTypes;
AuthorityControlledInput.defaultProps = defaultProps;