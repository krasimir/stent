const printObject = obj => {
  if (String(obj) === '[object Object]') {
    return JSON.stringify(obj);
  }
  return obj;
}

const Logger = {
  onActionDispatched(next, actionName, ...args) {
    if (args.length === 0) {
      console.log(`${ this.name }: "${ actionName }" dispatched`);
    } else {
      console.log(`${ this.name }: "${ actionName }" dispatched with payload ${ args.map(a => printObject(a) ) }`);
    }
    next();
  },
  onStateChanged(next) {
    next();
    console.log(`${ this.name }: state changed to "${ this.state.name }"`);
  },
  onGeneratorStep(next, yielded) {
    console.log(`${ this.name }: generator step -> ${ printObject(yielded) }`);
    next();
  }
}

export default Logger;