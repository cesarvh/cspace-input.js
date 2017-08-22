/* global document */

import React from 'react';
import { render } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import QuickAdd from '../../../src/components/QuickAdd';

import createTestContainer from '../../helpers/createTestContainer';

chai.should();

describe('QuickAdd', function suite() {
  const recordTypes = {
    person: {
      serviceConfig: {
        name: 'personauthorities',
        quickAddData: () => { },
      },
      vocabularies: {
        person: {
          messages: {
            collectionName: {
              id: 'vocab.person.local.collectionName',
              defaultMessage: 'Local Persons',
            },
          },
        },
        ulan: {
          messages: {
            collectionName: {
              id: 'vocab.person.ulan.collectionName',
              defaultMessage: 'ULAN Persons',
            },
          },
        },
      },
    },
    collectionobject: {
      messages: {
        record: {
          collectionName: {
            id: 'record.collectionobject.collectionName',
            defaultMessage: 'Objects',
          },
        },
      },
    },
  };

  beforeEach(function before() {
    this.container = createTestContainer(this);
  });

  it('should render as a div', function test() {
    render(
      <QuickAdd
        to="person/person"
        recordTypes={recordTypes}
      />, this.container);

    this.container.firstElementChild.nodeName.should.equal('DIV');
  });

  it('should use the vocabulary\'s collection name default message as the destination resource name', function test() {
    render(
      <QuickAdd
        to="person/person"
        recordTypes={recordTypes}
      />, this.container);

    this.container.querySelector('button').textContent.should.equal('Local Persons');
  });

  it('should use the record\'s collection name default message as the destination resource name if there is no vocabulary', function test() {
    render(
      <QuickAdd
        to="collectionobject"
        recordTypes={recordTypes}
      />, this.container);

    this.container.querySelector('button').textContent.should.equal('Objects');
  });

  it('should call formatDestinationName to format the destination resource name', function test() {
    const formatDestinationName = () => 'formatDestinationName called';

    render(
      <QuickAdd
        to="person/person"
        formatDestinationName={formatDestinationName}
        recordTypes={recordTypes}
      />, this.container);

    this.container.querySelector('button').textContent.should.equal('formatDestinationName called');
  });

  it('should render a menu', function test() {
    render(
      <QuickAdd
        to="person/person"
        recordTypes={recordTypes}
      />, this.container);

    this.container.querySelector('div').children[1].className.should.equal('cspace-input-Menu--common cspace-input-Input--common');
  });

  it('should not render menu items for unknown procedures', function test() {
    render(
      <QuickAdd
        to="person/person,badProcedure/xyz"
        recordTypes={recordTypes}
      />, this.container);

    this.container.querySelectorAll('li').should.have.lengthOf(1);
  });

  it('should not render menu items for unknown vocabularies', function test() {
    render(
      <QuickAdd
        to="person/person,person/badVocabulary"
        recordTypes={recordTypes}
      />, this.container);

    this.container.querySelectorAll('li').should.have.lengthOf(1);
  });

  it('should call add when an add button is clicked', function test() {
    let funcCalled = false;

    const add = () => {
      funcCalled = true;
    };

    render(
      <QuickAdd
        add={add}
        to="person/person"
        recordTypes={recordTypes}
      />, this.container);

    Simulate.click(this.container.querySelector('button'));

    funcCalled.should.equal(true);
  });

  it('should focus the menu when focusMenu is called', function test() {
    let quickAddRef = null;

    render(
      <QuickAdd
        to="person/person"
        recordTypes={recordTypes}
        ref={(ref) => { quickAddRef = ref; }}
      />, this.container);

    quickAddRef.focusMenu();

    const menu = this.container.querySelector('.cspace-input-Menu--common');

    menu.should.equal(document.activeElement);
  });
});
