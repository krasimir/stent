import React, { Component } from 'react';
import { connect } from 'stent/lib/react';

class App extends Component {
  componentDidMount() {
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
      <p>Hello world</p>
    );
  }
}

export default connect(App)
  .with('todos')
  .map(({ fetchTodos, isFetching, state }) => ({
    fetchTodos,
    isFetching,
    error: state.error
  }));
