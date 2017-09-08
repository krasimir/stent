import React from 'react';
import { connect } from 'stent/lib/react';
import Todo from './ToDo';

const ToDos = ({ todos }) => {
  const todosItems = todos.map(
    (todo, index) => (<Todo key={ index } { ...todo } index={ index } />)
  );

  return <ul>{ todosItems }</ul>;
};

export default connect(ToDos)
  .with('ToDos')
  .map(({ state, deleteTodo, changeStatus }) => ({ todos: state.todos }));