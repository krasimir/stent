import React from 'react';
import connect from '../helpers/connect';

export default function(Component) {
  const withFunc = (...names) => {
    const mapFunc = (done, once, silent) => {
      return class StentConnect extends React.Component {
        componentWillMount() {
          var mapping = 'map';

          if (once) mapping = 'mapOnce';
          if (silent) mapping = 'mapSilent';

          this._disconnect = connect()
            .with(...names)[mapping]
            ((...deps) => {
              if (!done) {
                this.forceUpdate();
              } else {
                this.setState(done(...deps));
              }
            })
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
      'mapOnce': done => mapFunc(done, true),
      'mapSilent': done => mapFunc(done, false, true),
    }
  }

  return { 'with': withFunc };
}