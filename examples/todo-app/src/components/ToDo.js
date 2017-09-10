import React from 'react';
import { connect } from 'stent/lib/react';
import { connect as connectWithMachineOnly } from 'stent/lib/helpers'
import { Machine } from 'stent';

const ENTER = 13;
const CloseIcon = () => <svg width='30' height='30' viewBox='0 0 1792 1792'><path d='M1408 960v-128q0-26-19-45t-45-19h-896q-26 0-45 19t-19 45v128q0 26 19 45t45 19h896q26 0 45-19t19-45zm256-544v960q0 119-84.5 203.5t-203.5 84.5h-960q-119 0-203.5-84.5t-84.5-203.5v-960q0-119 84.5-203.5t203.5-84.5h960q119 0 203.5 84.5t84.5 203.5z'/></svg>;
const SquareOIcon = () => <svg width='30' height='30' viewBox='0 0 1792 1792'><path d='M1312 256h-832q-66 0-113 47t-47 113v832q0 66 47 113t113 47h832q66 0 113-47t47-113v-832q0-66-47-113t-113-47zm288 160v832q0 119-84.5 203.5t-203.5 84.5h-832q-119 0-203.5-84.5t-84.5-203.5v-832q0-119 84.5-203.5t203.5-84.5h832q119 0 203.5 84.5t84.5 203.5z'/></svg>;
const SquareOCheckIcon = () => <svg width='30' height='30' viewBox='0 0 1792 1792'><path d='M1472 930v318q0 119-84.5 203.5t-203.5 84.5h-832q-119 0-203.5-84.5t-84.5-203.5v-832q0-119 84.5-203.5t203.5-84.5h832q63 0 117 25 15 7 18 23 3 17-9 29l-49 49q-10 10-23 10-3 0-9-2-23-6-45-6h-832q-66 0-113 47t-47 113v832q0 66 47 113t113 47h832q66 0 113-47t47-113v-254q0-13 9-22l64-64q10-10 23-10 6 0 12 3 20 8 20 29zm231-489l-814 814q-24 24-57 24t-57-24l-430-430q-24-24-24-57t24-57l110-110q24-24 57-24t57 24l263 263 647-647q24-24 57-24t57 24l110 110q24 24 24 57t-24 57z'/></svg>;

class Todo extends React.Component {
  constructor(props) {
    super(props);

    this._editInputField = null;
    this._onEditFieldKeyUp = this._onEditFieldKeyUp.bind(this);
    this._onEditFieldBlur = this._onEditFieldBlur.bind(this);

    this._machine = Machine.create({
      state: { name: 'idle' },
      transitions: {
        idle: { edit: 'editing' },
        editing: {
          save: (state, newLabel) => {
            props.editTodo(props.index, newLabel);
            return 'idle';
          },
          cancel: 'idle'
        }
      }
    });

    connectWithMachineOnly().with(this._machine).mapSilent();
  }
  _onEditFieldKeyUp(event) {
    if (event.keyCode === ENTER) {
      this._machine.save(event.target.value);
    }
  }
  _onEditFieldBlur() {
    this._machine.cancel();
  }
  _renderEditField(label) {
    return (
      <span>
        <input
          defaultValue={ label }
          onKeyUp={ this._onEditFieldKeyUp }
          onBlur={ this._onEditFieldBlur }
          ref={ input => (input && input.focus()) } />
      </span>
    )
  }
  render() {
    const { deleteTodo, changeStatus, index, done, label } = this.props;

    return (
      <li className={ done && 'done' }>
        { this._machine.isEditing() ?
          this._renderEditField(label) :
          <span onClick={ this._machine.edit }>{ label }</span>
        }
        <a onClick={ () => changeStatus(index, !done) } title='change status' className='statusIcon'>
          { done ? <SquareOCheckIcon /> : <SquareOIcon /> }
        </a> 
        <a onClick={ () => deleteTodo(index) } title='delete' className='deleteIcon'>
          <CloseIcon />
        </a>
      </li>
    )
  }
}

export default connect(Todo)
.with('ToDos')
.map(({ deleteTodo, changeStatus, editTodo }) => ({
  deleteTodo,
  changeStatus,
  editTodo
}));