import React from 'react';
import { Simulate } from 'react-addons-test-utils';
import { render } from 'react-dom';
import chai from 'chai';

import createTestContainer from '../../helpers/createTestContainer';

import isInput from '../../../src/helpers/isInput';
import CompoundInput from '../../../src/components/CompoundInput';
import InputRow from '../../../src/components/InputRow';
import Label from '../../../src/components/Label';
import LabelRow from '../../../src/components/LabelRow';
import TextInput from '../../../src/components/TextInput';
import RepeatingInput from '../../../src/components/RepeatingInput';

chai.should();

describe('CompoundInput', function suite() {
  beforeEach(function before() {
    this.container = createTestContainer(this);
  });

  it('should be considered an input by isInput()', function test() {
    isInput(<CompoundInput />).should.equal(true);
  });

  it('should render as a fieldset', function test() {
    render(<CompoundInput />, this.container);

    this.container.firstElementChild.nodeName.should.equal('FIELDSET');
  });

  it('should distribute values to child inputs', function test() {
    const compoundValue = {
      objectNumber: '1-200',
      comment: 'Hello world!',
    };

    render(
      <CompoundInput value={compoundValue}>
        <TextInput name="objectNumber" />
        <div>
          <TextInput name="comment" multiline />
        </div>
      </CompoundInput>, this.container);

    this.container.querySelector('input').value.should.equal(compoundValue.objectNumber);
    this.container.querySelector('textarea').value.should.equal(compoundValue.comment);
  });

  it('should distribute values to descendant inputs recursively', function test() {
    const compoundValue = {
      objectNumber: '1-200',
      comment: 'Hello world!',
      group: {
        nested: 'Nested 1',
        deepGroup: {
          deeplyNested: 'Nested 2',
        },
      },
    };

    render(
      <CompoundInput value={compoundValue}>
        <TextInput name="objectNumber" />
        <div>
          <TextInput name="comment" multiline />
          <CompoundInput name="group">
            <p>Interspersed nodes of other types<br />should have no effect</p>
            <div>
              <TextInput name="nested" />
              <CompoundInput name="deepGroup">
                <span>Deeply nested field</span>
                <TextInput name="deeplyNested" label="Label" />
              </CompoundInput>
            </div>
          </CompoundInput>
        </div>
      </CompoundInput>, this.container);

    this.container.querySelector('input[name="objectNumber"]').value.should
      .equal(compoundValue.objectNumber);

    this.container.querySelector('textarea').value.should
      .equal(compoundValue.comment);

    this.container.querySelector('input[name="nested"]').value.should
      .equal(compoundValue.group.nested);

    this.container.querySelector('input[name="deeplyNested"]').value.should
      .equal(compoundValue.group.deepGroup.deeplyNested);
  });

  it('should use the path prop of child inputs to locate values', function test() {
    const compoundValue = {
      collectionobjects_common: {
        objectNumber: '1-200',
        comment: 'Hello world!',
      },
      collectionobjects_extension: {
        color: 'red',
        comment: 'Extension comment',
      },
    };

    render(
      <CompoundInput value={compoundValue}>
        <TextInput name="objectNumber" path="collectionobjects_common" />
        <TextInput name="color" path="collectionobjects_extension" />
        <TextInput name="comment" path="collectionobjects_extension" />
      </CompoundInput>, this.container);

    this.container.querySelector('input[name="objectNumber"]').value.should
      .equal(compoundValue.collectionobjects_common.objectNumber);

    this.container.querySelector('input[name="color"]').value.should
      .equal(compoundValue.collectionobjects_extension.color);

    this.container.querySelector('input[name="comment"]').value.should
      .equal(compoundValue.collectionobjects_extension.comment);
  });

  it('should use the default path if specified', function test() {
    const compoundValue = {
      collectionobjects_common: {
        objectNumber: '1-200',
        comment: 'Hello world!',
      },
      collectionobjects_extension: {
        color: 'red',
        comment: 'Extension comment',
      },
    };

    render(
      <CompoundInput value={compoundValue} defaultPath="collectionobjects_common">
        <TextInput
          name="objectNumber"
          label="collectionobjects_common:objectNumber"
        />
        <TextInput
          name="comment"
          label="collectionobjects_common:comment"
        />
        <TextInput
          name="comment"
          path="collectionobjects_extension"
          label="collectionobjects_extension:comment"
        />
      </CompoundInput>, this.container);

    this.container.querySelector('input[name="objectNumber"]').value.should
      .equal(compoundValue.collectionobjects_common.objectNumber);

    this.container.querySelector('input[name="comment"]').value.should
      .equal(compoundValue.collectionobjects_common.comment);

    this.container.querySelectorAll('input[name="comment"]')[1].value.should
      .equal(compoundValue.collectionobjects_extension.comment);
  });

  it('should render an InputRow template and a LabelRow label', function test() {
    const labelRow = (
      <LabelRow>
        <Label>Alternate title</Label>
        <Label>Type</Label>
        <Label>Language</Label>
      </LabelRow>
    );

    render(
      <CompoundInput label={labelRow}>
        <InputRow>
          <TextInput embedded name="title" />
          <TextInput embedded name="type" />
          <TextInput embedded name="language" />
        </InputRow>
      </CompoundInput>, this.container);

    this.container.querySelectorAll('label').length.should.equal(3);
    this.container.querySelectorAll('input').length.should.equal(3);
  });

  it('should call the onCommit callback when a child input is committed', function test() {
    let committedName = null;
    let committedValue = null;

    const handleCommit = (name, value) => {
      committedName = name;
      committedValue = value;
    };

    const compoundValue = {
      objectNumber: '1-200',
      comment: 'Hello world!',
      group: {
        nested: 'Nested 1',
        deepGroup: {
          deeplyNested: 'Nested 2',
        },
      },
    };

    render(
      <CompoundInput name="compound" value={compoundValue} onCommit={handleCommit}>
        <TextInput name="objectNumber" />
        <div>
          <TextInput name="comment" multiline />
          <CompoundInput name="group">
            <TextInput name="nested" />
            <RepeatingInput name="rpt">
              <TextInput />
            </RepeatingInput>
            <CompoundInput name="deepGroup">
              <TextInput name="deeplyNested" />
              <TextInput name="deepRpt" repeating />
            </CompoundInput>
          </CompoundInput>
        </div>
      </CompoundInput>, this.container);

    const input = this.container.querySelectorAll('input')[4];

    input.value = 'New value';

    Simulate.keyPress(input, { key: 'Enter' });

    committedName.should.equal('compound.group.deepGroup.deepRpt[0]');
    committedValue.should.equal('New value');
  });
});
