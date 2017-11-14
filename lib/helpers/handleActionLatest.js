'use strict';

exports.__esModule = true;
exports.default = handleActionLatest;

var _handleAction = require('./handleAction');

var _handleAction2 = _interopRequireDefault(_handleAction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var actions = {}; /*
                  function test (n) {
                    return {
                      type: 'TEST',
                      n
                    };
                  }
                  store.runSaga(function * () {
                    yield takeLatest('TEST', function * ({ n }) {
                      console.log(n);
                      console.log('promise: ' + (yield call(a, n)));
                    });
                  });
                  store.runSaga(function *() {
                    yield put(test(1));
                    yield put(test(2));
                  });
                  
                  1 <-- immediately
                  2 <-- immediately
                  promise 2 <-- a second later
                  */

function handleActionLatest(machine, action) {
  actions[action] && actions[action]();

  for (var _len = arguments.length, payload = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    payload[_key - 2] = arguments[_key];
  }

  actions[action] = _handleAction2.default.apply(undefined, [machine, action].concat(payload));
};
module.exports = exports['default'];