import React from 'react';
import { connect } from 'stent/lib/react';
import { Machine } from 'stent';

class Todo extends React.Component {
  constructor(props) {
    super(props);

    this.machine = Machine.create()
  }
  render() {
    const { deleteTodo, changeStatus, index, done, label } = this.props;

    return (
      <li className={ done && 'done' }>
        <span>{ label }</span>
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