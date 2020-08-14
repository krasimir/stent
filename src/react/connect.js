import React from 'react';
import connect from '../helpers/connect';

export default function(Component) {
  const withFunc = (...names) => {
    const mapFunc = (done, once, silent) => {
      const mapping = once ? "mapOnce" : silent ? "mapSilent" : "map";

      return class StentConnect extends React.Component {
        constructor(props) {
          super(props);

          this.initialStateHasBeenSet = false;
          this.state = {};

          this.disconnect = connect({
            meta: { component: Component.name }
          })
            .with(...names)
            [mapping]((...deps) => {
              const nextState = done ? done(...deps) : {};

              if (
                this.initialStateHasBeenSet === false &&
                mapping !== 'mapSilent'
              ) {
                this.state = nextState;
                this.initialStateHasBeenSet = true;
                return;
              }

              this.setState(function () {
                return nextState;
              });
            });
        }

        componentWillUnmount() {
          if (this.disconnect) {
            this.disconnect();
          }
        }

        render() {
          return <Component {...this.state} {...this.props} />;
        }
      }
    }

    return {
      'map': mapFunc,
      'mapOnce': done => mapFunc(done, true),
      'mapSilent': done => mapFunc(done, false, true),
    }
  }

  return { 'with': withFunc };
}
