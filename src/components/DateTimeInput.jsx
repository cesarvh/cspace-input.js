import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Calendar from 'react-calendar';
import BaseDropdownInput from './DropdownInput';
import LineInput from './LineInput';
import changeable from '../enhancers/changeable';
import committable from '../enhancers/committable';
import styles from '../../styles/cspace-input/DateInput.css';
import { pathPropType, getPath } from '../helpers/pathHelpers';



import '!style-loader!css-loader!../../styles/react-calendar/calendar.css';
/*
 * This is currently a read-only input.
 */
import {
  formatDate, 
  normalizeDateString,
  normalizeISO8601DateString,
  parseNormalizedDate,
} from '../helpers/dateHelpers';

const  DropdownInput = committable(changeable(BaseDropdownInput));

const propTypes = {
  name: PropTypes.string,
  // TODO: Stop using propTypes in isInput. Until then, these unused props need to be declared so
  // this component is recognized as an input.
  /* eslint-disable react/no-unused-prop-types */
  parentPath: pathPropType,
  subpath: pathPropType,
  /* eslint-enable react/no-unused-prop-types */
  value: PropTypes.string,
  formatValue: PropTypes.func,

  // New Props
  // eslint-disable-next-line react/forbid-foreign-prop-types
  ...BaseDropdownInput.propTypes,
  locale: PropTypes.string,
  onCommit: PropTypes.func,
  readOnly: PropTypes.bool,

};
 
const defaultProps = {
  name: undefined,
  parentPath: undefined,
  subpath: undefined,
  value: undefined,
  formatValue: undefined,
};

export default class DateTimeInput extends Component {
  constructor(pops) {
    super(props);

    this.focusCalendar = this.focusCalendar.bind(this);
    this.handleCalendarChange = this.handleCalendarChange.bind(this);
    this.handleCalendarContainerRef = this.handleCalendarContainerRef.bind(this);
    this.handleDropdownInputApi = this.handleDropdownInputApi.bind(this);
    this.handleDropdownInputBeforeClose = this.handleDropdownInputBeforeClose.bind(this);
    this.handleDropdownInputChange = this.handleDropdownInputChange.bind(this);
    this.handleDropdownInputClose = this.handleDropdownInputClose.bind(this);

    this.handleDropdownInputKeyDown = this.handleDropdownInputKeyDown.bind(this);
    this.handleDropdownInputMount = this.handleDropdownInputMount.bind(this);
    this.handleDropdownInputOpen = this.handleDropdownInputOpen.bind(this);

    this.state = {
      value,
      date: parseNormalizedDate(value),
      open: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    // No need to format anything?
    const nextValue = nextProps.value;

    this.setState({
      value: nextValue,
      date: nextValue, // we will need  to change this into a date
    });
  }

  commit(date) {
    const {
      onCommit,
    } =  this.props;

    const  {
      value: initialValue,
    } = this.props;

    const normalizedInitialValue = value; // TO DO: normalize?
    const nextValue = date;

    if (
      onCommit 
      && (nextValue || normalizedInitialValue) 
      && (nextValue != normalizedInitialValue)
    ) {
      onCommit(getPath(this.props), nextValue);
    }
  }

  focusCalendar() {
    if  (this.calendarContainerDomNode) {
      const button =  this.calendarContainerDomNode.querySelector('button');

      if (button) {
        button.focus();
      }
    }
  }

  handleCalendarChange(date) {
    this.setState({
      value:  date, // TO DO: format the date,
      open: false,
    })
    
    this.commit(date);
    this.focusInput();
  }

  handleCalendarContainerRef(ref) {
    this.calendarContainerDomNode = ref;
  }

  handleDropdownInputApi(api) {
    this.dropdownInputApi = api;
  }

  handleDropdownInputBeforeClose(isCancelled) {
    if (isCancelled) {
      const {
        value,
      } = this.props;
    }

    this.setState({
      provisionalDate: undefined,
      value: value, // TO DO: normalize it
    });
  }

  handleDropdownInputChange(value) {
    const {
      locale,
    } = this.props;

    const date =  value  // TO DO: format it

    this.setState({
      value,
      provisionalDate: date,
      open:true,
    });
  }

  handleDropdownInputClose() {
    const nextState = {
      provisionalDate: undefined,
      open: false,
    };

    const {
      provisionalDate,
      value,
    } = this.state;

    if (typeof provisionalDate !== 'undefined' && value === '') {
      nextState.value = '';

      const {
        onCommit,
      } = this.props;

      if (onCommit) {
        onCommit(getPath(this.props), '');
      }
    } else {
      const { 
        value:  origValue,
      } = this.props;

      nextState.value = origValue; // TO  DO: format it
    }

    this.setState(nextState);
  }

  handleDropdownInputKeyDown(event) {
    const {
      provisionalDate,
      value,
    } = this.state;

    if (event.key  === 'Tab') {
      this.dropdownInputApi.close();

      this.setState({
        open: false,
      });
    } else if (typeof provisionalDate !== 'undefined' && event.key === 'Enter') {
      event.preventDefault();

      if (provisionalDate !== null || value === '') {
        this.setState({
          open: false,
        });

        this.commit(provisionalDate);
      }
    }
  }

  handleDropdownInputMount({ focusInput }) {
    this.focusInput = focusInput;
  }

  handleDropdownInputOpen() {
    const {
      open,
    } =  this.state;

    if (!open)  {
      this.setState({
        open: true,
        provisionalDate: undefined,
      });
    }
  }

  render() {
    const{
      locale,
      readOnly,
      ...remainingProps
    } = this.props;
  
    const {
      open,
      date,
      provisionalDate,
      value,
    } = this.state;

    if (readOnly)  {
      return (
        <LineInput
        name={name}
        readOnly
        value={value}
        // value={formatValue ? formatValue(value) : value}
      />
      );
    } 

  let calendarValue;

  if (value) {
    calendarValue = (typeof provisionalDate !== 'undefined') ? provisionalDate : date;
  }

  const className = (typeof provisionalDate !== 'undefined') ? styles.provisional : styles.normal;

    return(
      <DropdownInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...remainingProps}
        className={className}
        focusPopup={this.focusCalendar}
        open={open}
        value={value}
        api={this.handleDropdownInputApi}
        onChange={this.handleDropdownInputChange}
        onBeforeClose={this.handleDropdownInputBeforeClose}
        onClose={this.handleDropdownInputClose}
        onKeyDown={this.handleDropdownInputKeyDown}
        onMount={this.handleDropdownInputMount}
        onOpen={this.handleDropdownInputOpen}
      >
        <div ref={this.handleCalendarContainerRef}>
          <Calendar
            locale={locale}
            value={calendarValue}
            onChange={this.handleCalendarChange}
          />
        </div>
      </DropdownInput>
    );
  }
}

DateTimeInput.propTypes = propTypes;
DateTimeInput.defaultProps = defaultProps;
