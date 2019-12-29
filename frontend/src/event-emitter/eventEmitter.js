import * as Rx from "rxjs";

const hasOwnProp = {}.hasOwnProperty;

const createName = (name) => "$" + name;

class EventEmitter {
  constructor() {
    this.subjects = {};
  }

  emit(name, data) {
    var fnName = createName(name);
    this.subjects[fnName] || (this.subjects[fnName] = new Rx.Subject());
    this.subjects[fnName].next(data);
  }

  on(name, handler) {
    var fnName = createName(name);
    this.subjects[fnName] || (this.subjects[fnName] = new Rx.Subject());
    return this.subjects[fnName].subscribe(handler);
  }

  off(name) {
    var fnName = createName(name);
    if (this.subjects[fnName]) {
      this.subjects[fnName].dispose();
      delete this.subjects[fnName];
    }
  }

  dispose() {
    var subjects = this.subjects;
    for (var prop in subjects) {
      if (hasOwnProp.call(subjects, prop)) {
        subjects[prop].dispose();
      }
    }

    this.subjects = {};
  }
}

export default new EventEmitter();
