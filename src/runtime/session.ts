// provides easily interceptable indirection.
import HashMap from '../shared/hash-map';
import EventArray from '../shared/event-array';
import CounterStore from '../shared/counter-store';

export default class HeimdallSession {
  monitors: CounterStore;
  configs: HashMap<any>;
  events: EventArray;

  constructor() {
    this.init();
  }

  init(): void {
    this.monitors = new CounterStore();
    this.configs = new HashMap();
    this.events = new EventArray(640000 * 4);
  }

  // mostly for test helper purposes
  reset(): void {
    this.monitors.clean();
    this.events.length = 0;
  }
}
