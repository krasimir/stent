import React, { useEffect, useState } from 'react';
import connect from '../helpers/connect';

export default function(Component) {
  const withFunc = (...names) => {
    const mapFunc = (done, once, silent) => {
      let mapping = 'map';
      let dependencies = {};
      let listener = () => {};

      if (once) mapping = 'mapOnce';
      if (silent) mapping = 'mapSilent';

      let disconnect = connect({
        meta: { component: Component.name }
      }).with(...names)[mapping]
        ((...deps) => {
          if (done) {
            listener(dependencies = done(...deps));
          } else {
            listener({});
          }
        })
      return function StentConnect(props) {
        const [ state, setState ] = useState(dependencies);

        useEffect(() => {
          listener = setState;
          return () => {
            disconnect();
          }
        }, []);

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