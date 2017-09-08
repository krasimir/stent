import React from 'react';
import { connect } from 'stent/lib/react';

class AddNewTodo extends React.Component {
  constructor(props) {
    super(props);
    
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onChange = this._onChange.bind(this);
    this.state = { value: '' };
  }
  componentDidMount() {
    this.textInput.focus();
  }
  _onChange(event) {
    this.setState({ value: event.target.value });
  }
  _onKeyUp(event) {
    const value = this.state.value;
    
    if (event.key === 'Enter') {
      this.props.addNewTodo({
        label: value,
        done: false
      });
      this.setState({ value: '' });
    }
  }
  render() {
    return (
      <section className='addNewToDo'>
        <input
          ref={ input => this.textInput = input }
          onKeyUp={ this._onKeyUp }
          onChange={ this._onChange }
          value={ this.state.value }
          placeholder='I have to fix ...'
          />
      </section>
    );
  }
}

export default connect(AddNewTodo)
  .with('ToDos')
  .mapOnce(({ addNewTodo }) => ({ addNewTodo }));