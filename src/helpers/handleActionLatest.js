/*
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


import handleAction from './handleAction';

const actions = {};

export default function handleActionLatest(machine, action, ...payload) {
  actions[action] && actions[action]();
  actions[action] = handleAction(machine, action, ...payload);
};