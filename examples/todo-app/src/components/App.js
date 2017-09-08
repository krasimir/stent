import React from 'react';
import { connect } from 'stent/lib/react';
import AddNewTodo from './AddNewTodo';
import ToDos from './ToDos';

class App extends React.Component {
  componentDidMount() {
    console.log('mounted');
    this.props.fetchTodos();
  }
  render() {
    const { fetchTodos, isFetching, error } = this.props;

    if (isFetching()) {
      return <p>Loading</p>;
    }
    if (error) {
      return (
        <section>
          <h2>Oops, something happened ...</h2>
          <p>{ error }</p>
          <button onClick={ fetchTodos }>Try again</button>
        </section>
      )
    }
    return (
      <div>
        <AddNewTodo />
        <section>
          <ToDos />
        </section>
      </div>
    );
  }
}

export default connect(App)
  .with('ToDos')
  .map(({ fetchTodos, isFetching, state }) => ({
    fetchTodos,
    isFetching,
    error: state.error
  }));