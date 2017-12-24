import React from 'react';
import { render } from 'react-dom';
import { Machine } from 'stent';
import { StentEmitter, sanitize, createMessenger } from 'kuker-emitters';
import ToDos from './machines/ToDos.js';
import App from './components/App';
import './index.css';

// window.addEventListener('message', event => {
//   console.log(event.data);
// });

// Machine.addMiddleware(StentEmitter());
Machine.create('ToDos', ToDos);

render(<App />, document.getElementById('root'));

// ---------------------------------------------- ReactEmitter


// Implementation taken from https://github.com/facebook/react-devtools/blob/master/backend/attachRenderer.js#L175-L181
// If this breaks make sure that it is in sync with the original
const traverseReactTree = function (root, renderer, { getData, getData012, getDataFiber, getDisplayName }) {
  if (!root) return {};

  const isPre013 = !renderer.Reconciler;
  const walkNode = function (internalInstance) {
    const data = isPre013 ? getData012(internalInstance) : getData(internalInstance);
    var item;

    if (data.children && Array.isArray(data.children)) {
      if (data.children.length > 1) {
        item = data.children.map(child => walkNode(child));
      } else {
        item = walkNode(data.children[0]);
      }
    } else {
      item = data.children || {};
    }
    return {
      [data.name]: item
    };
  }

  return walkNode(root);
}

const ReactEmitter = function () {
  if (typeof window === 'undefined') return;

  const message = createMessenger('ReactEmitter');
  const postMessage = data => {
    message(data);
  };
  const throttle = function (func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    var numOfCalls = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : Date.now();
      timeout = null;
      result = func.apply(context, [...args, numOfCalls]);
      numOfCalls = 0;
      if (!timeout) context = args = null;
    };
    return function() {
      var now = Date.now();
      numOfCalls++;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, [...args, numOfCalls]);
        numOfCalls = 0;
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };
  
  var tries = 5;
  const connect = function (callback) {
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      return callback(window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
    }
    if (tries >= 0) {
      tries -= 1;
      setTimeout(() => connect(callback), 1500);
    }
  }
  
  connect(hook => {
    var getState = null;

    hook.on('renderer-attached', function (attached) {
      const { helpers, renderer } = attached;

      helpers.walkTree(function (item, data) {
        // console.log(data);
      }, function (root) {
        getState = () => sanitize(traverseReactTree(root, renderer, hook.__helpers));
        console.log('Tree: ' + getState());
        postMessage({
          type: '@@react_root_detected',
          state: getState()
        });
      });
    });
    hook.on('root', throttle((component, calls) => {
      postMessage({
        type: '@@react_root',
        state: getState(),
        calls
      });
    }), 100);
    hook.on('mount', throttle((component, calls) => {
      postMessage({
        type: '@@react_mount',
        state: getState(),
        calls
      });
    }), 100);
    hook.on('update', throttle((component, calls) => {
      postMessage({
        type: '@@react_update',
        state: getState(),
        calls
      });    
    }), 100);
    hook.on('unmount', throttle((component, calls) => {
      postMessage({
        type: '@@react_unmount',
        state: getState()
      });
    }), 100);
  });
}

ReactEmitter();
