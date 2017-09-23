import React from 'react';
import { connect } from 'stent/lib/react';
import { connect as connectWithMachineOnly } from 'stent/lib/helpers'
import { Machine } from 'stent';
import CloseIcon from './icons/CloseIcon';
import SquareOIcon from './icons/SquareOIcon';
import SquareOCheckIcon from './icons/SquareOCheckIcon';

const ENTER = 13;

class Todo extends React.Component {
  constructor(props) {
    super(props);

    this._editInputField = null;
    this._onEditFieldKeyUp = this._onEditFieldKeyUp.bind(this);
    this._onEditFieldBlur = this._onEditFieldBlur.bind(this);

    this._machine = Machine.create(
      { name: 'idle' },
      {
        idle: { edit: 'editing' },
        editing: {
          save: (state, newLabel) => {
            props.editTodo(props.index, newLabel);
            return 'idle';
          },
          cancel: 'idle'
        }
      }
    );

    connectWithMachineOnly().with(this._machine).mapSilent(() => this.forceUpdate());
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