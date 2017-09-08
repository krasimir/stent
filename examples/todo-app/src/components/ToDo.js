import React from 'react';
import { connect } from 'stent/lib/react';
import { Machine } from 'stent';

class Todo extends React.Component {
  constructor(props) {
    super(props);

    this.machine = Machine.create({
      state: { name: 'idle' },
      transitions: {
        idle: { edit: 'editing' },
        editing: {
          save: (state, newLabel) => {
            props.editToDo(props.index, newLabel);
            return 'idle';
          }
        }
      }
    });
  }
  render() {
    const { deleteTodo, changeStatus, index, done, label } = this.props;

    return (
      <li className={ done && 'done' }>
        { this.machine.isIdle() ?
          <span onClick={ this.machine.edit() }>{ label }</span> :
          <input defaultValue={ label } />
        }        
        <a onClick={ () => deleteTodo(index) }>X</a>
        <label>
          <input
            type='checkbox'
            checked={ done }
            onChange={ () => changeStatus(index, !done) }
            />
            done
        </label>
      </li>
    )
  }
}

export default connect(Todo)
.with('ToDos')
.map(({ deleteTodo, changeStatus }) => ({
  deleteTodo,
  changeStatus
}));