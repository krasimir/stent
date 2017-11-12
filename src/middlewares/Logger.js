const Logger = {
  onActionDispatched(actionName, ...args) {
    if (args.length === 0) {
      console.log(`${ this.name }: "${ actionName }" dispatched`);
    } else {
      console.log(`${ this.name }: "${ actionName }" dispatched with payload ${ args }`);
    }
  },
  onStateChanged() {
    console.log(`${ this.name }: state changed to "${ this.state.name }"`);
  },
  onGeneratorStep(yielded) {
    console.log(`${ this.name }: generator step -> ${ yielded }`);
  }
}

export default Logger;