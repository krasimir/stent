import React from 'react';
import connect from '../helpers/connect';

export default function(Component) {
  const withFunc = (...names) => {
    const mapFunc = (done, once) => {
      return class StentConnect extends React.Component {
        componentWillMount() {
          this._disconnect = connect()
            .with(...names)[once ? 'mapOnce' : 'map']
            ((...deps) => this.setState(done(...deps)));
        }
        componentWillUnmount() {
          this._disconnect();
        }
        render() {
          return <Component {...this.state} {...this.props} />;
        }
      };;
    }

    return {
      'map': mapFunc,
      'mapOnce': done => mapFunc(done, true)
    }
  }

  return { 'with': withFunc };
}