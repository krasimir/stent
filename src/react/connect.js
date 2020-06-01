import React, { useEffect, useState } from 'react';
import connect from '../helpers/connect';

export default function(Component) {
  const withFunc = (...names) => {
    const mapFunc = (done, once, silent) => {
      const mapping = once ? "mapOnce" : silent ? "mapSilent" : "map";
      const initialState = mapping === "mapSilent" ? {} : null;

      return function StentConnect(props) {
        const [ state, setState ] = useState(initialState);

        useEffect(() => {
          const disconnect = connect({
            meta: { component: Component.name }
          })
            .with(...names)
            [mapping]((...deps) => {
              if (done) {
                setState(done(...deps));
              } else {
                setState({});
              }
            });

          return () => {
            disconnect();
          }
        }, []);

        // Avoid rendering component until connected
        if (state == null) {
          return null;
        }

        return <Component {...state} {...props} />;
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
