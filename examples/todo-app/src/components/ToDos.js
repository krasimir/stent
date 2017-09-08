import React from 'react';
import { connect } from 'stent/lib/react';

const ToDos = ({ todos, deleteTodo, changeStatus }) => (
  <ul>
    {
      todos.map(({ label, done }, index) => {
        console.log(index, label, done);
        return (
          <li key={ index }>
            <span className>{ label }</span>
            <a href='#' onClick={ () => deleteTodo(index) }>X</a>
            <input
              type='checkbox'
              checked={ done }
              onClick={ () => changeStatus(index, !done) }
              />
          </li>
        );
      })
    }
  </ul>
);

export default connect(ToDos)
  .with('ToDos')
  .map(({ state, deleteTodo, changeStatus }) => ({
    todos: state.todos,
    deleteTodo,
    changeStatus
  }));