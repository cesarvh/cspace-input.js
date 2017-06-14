import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import BaseDropdownMenuInput from './DropdownMenuInput';
import changeable from '../enhancers/changeable';
import { getOptionForLabel, getOptionForValue } from '../helpers/optionHelpers';
import { getPath } from '../helpers/pathHelpers';
import styles from '../../styles/cspace-input/ComboBoxInput.css';

const DropdownMenuInput = changeable(BaseDropdownMenuInput);

const propTypes = {
  ...DropdownMenuInput.propTypes,
  blankable: PropTypes.bool,
  onAddOption: PropTypes.func,
};

const defaultProps = {
  blankable: true,
};

export default class ComboBoxInput extends Component {
  constructor(props) {
    super(props);

    this.handleDropdownInputChange = this.handleDropdownInputChange.bind(this);
    this.handleDropdownInputClose = this.handleDropdownInputClose.bind(this);
    this.handleDropdownInputCommit = this.handleDropdownInputCommit.bind(this);
    this.handleDropdownInputKeyDown = this.handleDropdownInputKeyDown.bind(this);
    this.handleDropdownInputOpen = this.handleDropdownInputOpen.bind(this);

    this.state = {
      isAdding: false,
      open: false,
      value: this.props.value,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value,
    });
  }

  commit(value) {
    const {
      onCommit,
    } = this.props;

    if (onCommit) {
      onCommit(getPath(this.props), value);
    }
  }

  handleDropdownInputChange(value) {
    this.setState({
      isAdding: true,
      open: true,
      valueLabel: value,
    });
  }

  handleDropdownInputCommit(path, value) {
    this.setState({
      value,
      isAdding: false,
      open: false,
    });

    this.commit(value);
  }

  handleDropdownInputKeyDown(event) {
    if (event.key === 'Enter') {
      const {
        isAdding,
        valueLabel,
      } = this.state;

      if (isAdding) {
        const {
          blankable,
          options,
          onAddOption,
        } = this.props;

        // If the current content of the input matches an option exactly, select it.

        const matchingOption = getOptionForLabel(options, valueLabel);

        if (matchingOption) {
          this.setState({
            isAdding: false,
            open: false,
            value: matchingOption.value,
            valueLabel: matchingOption.valueLabel,
          });

          this.commit(matchingOption.value);
        } else if (valueLabel !== '' || blankable) {
          this.setState({
            valueLabel,
            open: false,
          });

          if (onAddOption) {
            onAddOption(valueLabel);
          }
        }
      }
    }
  }

  handleDropdownInputClose() {
    this.setState({
      isAdding: false,
      open: false,
    });

    const {
      onClose,
    } = this.props;

    if (onClose) {
      onClose();
    }
  }

  handleDropdownInputOpen() {
    this.setState({
      isAdding: false,
      open: true,
    });
  }

  render() {
    const {
      isAdding,
      open,
      value,
      valueLabel,
    } = this.state;

    const {
      className,
      /* eslint-disable no-unused-vars */
      onAddOption,
      /* eslint-enable no-unused-vars */
      ...remainingProps
    } = this.props;

    let valueProp;

    if (isAdding) {
      valueProp = { valueLabel };
    } else if (getOptionForValue(this.props.options, value)) {
      valueProp = { value };
    } else {
      valueProp = { valueLabel: value };
    }

    const classes = classNames(className, {
      [styles.adding]: isAdding,
    });

    return (
      <DropdownMenuInput
        {...remainingProps}
        {...valueProp}
        className={classes}
        open={open}
        onChange={this.handleDropdownInputChange}
        onClose={this.handleDropdownInputClose}
        onCommit={this.handleDropdownInputCommit}
        onKeyDown={this.handleDropdownInputKeyDown}
        onOpen={this.handleDropdownInputOpen}
      />
    );
  }
}

ComboBoxInput.propTypes = propTypes;
ComboBoxInput.defaultProps = defaultProps;
