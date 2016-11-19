import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import BaseTextInput from './TextInput';
import Popup from './Popup';
import changeable from '../enhancers/changeable';
import styles from '../../styles/cspace-input/DropdownInput.css';

const TextInput = changeable(BaseTextInput);

const propTypes = {
  ...TextInput.propTypes,
  children: PropTypes.node,
  className: PropTypes.string,
  open: PropTypes.bool,

  /*
   * A function that may be called to give focus to the contents of the popup. This is supplied as
   * a prop because DropdownInput does not know the contents of the popup. Only the caller knows
   * which element in the popup should receive focus.
   */
  focusPopup: PropTypes.func,

  onChange: PropTypes.func,
  onClose: PropTypes.func,
  onKeyDown: PropTypes.func,
  onOpen: PropTypes.func,
};

const defaultProps = {
  className: '',
};

export default class DropdownInput extends Component {
  constructor(props) {
    super(props);

    this.handleInputBlur = this.handleInputBlur.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputMouseDown = this.handleInputMouseDown.bind(this);
    this.handleInputKeyDown = this.handleInputKeyDown.bind(this);
    this.handlePopupBlur = this.handlePopupBlur.bind(this);
    this.handlePopupKeyDown = this.handlePopupKeyDown.bind(this);
    this.handlePopupMounted = this.handlePopupMounted.bind(this);
    this.handleRef = this.handleRef.bind(this);

    this.state = {
      open: props.open,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      open: nextProps.open,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.open && !this.state.open) {
      const {
        onClose,
      } = this.props;

      if (onClose) {
        onClose();
      }
    }
  }

  close() {
    if (this.state.open) {
      this.setState({
        open: false,
      });
    }
  }

  open() {
    if (!this.state.open) {
      const {
        onOpen,
      } = this.props;

      if (onOpen) {
        onOpen();
      }

      this.setState({
        open: true,
      });
    }
  }

  focusInput() {
    // FIXME: This breaks the TextInput component abstraction by selecting the rendered DOM node
    // directly and calling focus() on it. But fixing this would require saving a ref to the
    // TextInput; making TextInput a class instead of a function; and adding a focus() method to
    // that class, which could be called here. LineInput and MultilineInput would also need to
    // become classes instead of functions, each with their own focus() method, in order to
    // properly implement TextInput.focus(). This seems like overkill at the moment.

    this.domNode.querySelector('input, textarea').focus();
  }

  focusPopup() {
    const {
      focusPopup,
    } = this.props;

    if (focusPopup) {
      focusPopup();
    }
  }

  handleInputBlur(event) {
    if (!this.domNode.contains(event.relatedTarget)) {
      this.close();
    }
  }

  handleInputChange(value) {
    const {
      onChange,
    } = this.props;

    this.open();

    if (onChange) {
      onChange(value);
    }
  }

  handleInputMouseDown() {
    this.open();
  }

  handleInputKeyDown(event) {
    if (event.key === 'ArrowDown') {
      // Prevent the page from scrolling.
      event.preventDefault();

      if (this.state.open) {
        this.focusPopup();
      } else {
        this.open();
        this.focusPopupNeeded = true;
      }
    } else if (event.key === 'Escape') {
      this.close();
    }

    const {
      onKeyDown,
    } = this.props;

    if (onKeyDown) {
      onKeyDown(event);
    }
  }

  handlePopupBlur(event) {
    if (!this.domNode.contains(event.relatedTarget)) {
      this.close();
    }
  }

  handlePopupKeyDown(event) {
    if (event.key === 'Escape') {
      this.close();
      this.focusInput();
    }
  }

  handlePopupMounted() {
    if (this.focusPopupNeeded) {
      this.focusPopup();
      this.focusPopupNeeded = false;
    }
  }

  handleRef(ref) {
    this.domNode = ref;
  }

  renderInput() {
    const {
      /* eslint-disable no-unused-vars */
      children,
      className,
      focusPopup,
      onChange,
      onClose,
      onKeyDown,
      onOpen,
      /* eslint-enable no-unused-vars */
      ...remainingProps
    } = this.props;

    return (
      <TextInput
        {...remainingProps}
        autoSyncValue={false}
        onBlur={this.handleInputBlur}
        onChange={this.handleInputChange}
        onKeyDown={this.handleInputKeyDown}
        onMouseDown={this.handleInputMouseDown}
      />
    );
  }

  renderDropdown() {
    const {
      open,
    } = this.state;

    const {
      children,
    } = this.props;

    if (open) {
      return (
        <Popup
          onBlur={this.handlePopupBlur}
          onKeyDown={this.handlePopupKeyDown}
          onMounted={this.handlePopupMounted}
        >
          {children}
        </Popup>
      );
    }

    return null;
  }

  render() {
    const {
      className,
    } = this.props;

    const classes = classNames(styles.common, className);

    return (
      <div
        ref={this.handleRef}
        className={classes}
      >
        {this.renderInput()}
        {this.renderDropdown()}
      </div>
    );
  }
}

DropdownInput.propTypes = propTypes;
DropdownInput.defaultProps = defaultProps;
