// -------------------------------------------------------------------- //
// Author and Maintainer: Abdurrahman Alshareef                         //
// Date: May 2024                                                       //
// Title: Design and Implementation of DEVS Simulation in JavaScript    //
//              (DEVS.js) for Web Simulation and GenAI-Assisted         //
//              Environments and Applications                           //
// Use Cases and applications: genAI Activities and Flow Diagrams,      //
//          Pathways, MBSE, SysML, UML, BPMN, and more                  //
// Approach: flexibile port and coupling definitions and data typing    //
//          for message content, min heap for imminents, and            //
//          optimized execution and features                            //
// Website: http://ms4.online/ & https://github.com/ms4us               //
// License: MIT License                                                 //
// Version: Beta 1.0.0                                                  //
// -------------------------------------------------------------------- //
const simulation_time = 100;
const execution_delay = 100;

class MinHeap {
    constructor() {
        this.heap = [];
    }

    insert(event) {
        this.heap.push(event);
        let index = this.heap.length - 1;
        let parentIndex = this.getParentIndex(index);

        while (index > 0 && this.heap[parentIndex].time > this.heap[index].time) {
            this.swap(parentIndex, index);
            index = parentIndex;
            parentIndex = this.getParentIndex(index);
        }
    }

    remove() {
        if (this.isEmpty()) {
            console.error("Heap is empty!");
            return;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapify(0);
        return min;
    }

    removeAt(component) {
        let index = -1;
        for (let i = 0; i < this.heap.length; i++) {
            if (this.heap[i].component == component) {
                index = i;
                break;
            }
        }
        if (index == -1) {
            return;
        }
        this.heap[index] = this.heap[this.heap.length - 1];
        this.heap.pop();
        this.heapify(index);
    }

    peek() {
        return this.heap[0];
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    heapify(i) {
        const left = this.getLeftChildIndex(i);
        const right = this.getRightChildIndex(i);
        let smallest = i;

        if (left < this.heap.length && this.heap[left].time < this.heap[smallest].time) {
            smallest = left;
        }
        if (right < this.heap.length && this.heap[right].time < this.heap[smallest].time) {
            smallest = right;
        }
        if (smallest !== i) {
            this.swap(i, smallest);
            this.heapify(smallest);
        }
    }

    getParentIndex(i) {
        return Math.floor((i - 1) / 2);
    }

    getLeftChildIndex(i) {
        return 2 * i + 1;
    }

    getRightChildIndex(i) {
        return 2 * i + 2;
    }

    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
}

class Event {
    constructor(time, component) {
        this.time = time;
        this.component = component;
    }

    getTime() {
        return this.time;
    }

    getComponent() {    
        return this.component;
    }
}

class Bag {
    constructor() {
        this.content = [];
    }

    add(data) {
        this.content.push(data);
    }

    remove() {
        if (this.isEmpty()) {
            console.error("Trying to remove from an empty bag!");
            return;
        }
        return this.content.shift();
    }

    isEmpty() {
        return this.content.length === 0;
    }

    mergeTo(bag) {
        this.content = this.content.concat(bag.content);
    }
}

class Coupling {
    constructor(source, target) {
        this.source = source;
        this.target = target;
    }

    getSource() {
        if (this.source)
            return this.source;
        else
            console.error('Source port not found or null!');
    }

    getTarget() {
        if (this.target)
            return this.target;
        else
            console.error('Target port not found or null!');
    }
}

class Port {
    constructor(name, model) {
        this.id = Symbol();
        this.name = name;
        this.model = model;
        this.messages = new Bag();
    }

    getMessagesBag() {
        return this.messages;
    }

    clearMessages() {
        this.messages = new Bag();
    }

    isEmpty() {
        return this.messages.isEmpty();
    }

    putMessagesToReceive(bag) {
        this.messages = bag;
    }

    addMessageToSend(message) {
        this.messages.add(message);
    }
}

class InputPort extends Port {

}

class OutputPort extends Port {

}

class Component {
    constructor(name) {
        this.id = Symbol();
        this.name = name;
        this.inputPorts = new Map();
        this.outputPorts = new Map();
    }

    addInputPort(name) {
        this.inputPorts.set(name, new InputPort(name, this));
    }

    addOutputPort(name) {
        this.outputPorts.set(name, new OutputPort(name, this));
    }

    addMessageToOutputPort(port, message) {
        if (port)
            this.outputPorts.get(port.name).addMessageToSend(message);
        else
            console.error(`Output port not found in ${this.name}`);
    }

    onOutputPort(name) {
        if (!this.outputPorts.has(name))
            console.error(`Output port ${name} not found in ${this.name}`);
        return this.outputPorts.get(name);
    }

    onInputPort(name) {
        if (!this.inputPorts.has(name))
            console.error(`Input port ${name} not found in ${this.name}`);
        return this.inputPorts.get(name);
    }
}

class AtomicModel extends Component {
    constructor(name) {
        super(name);
        this.currentTime = 0.0;
        this.sigma = Infinity;
        this.phase = "passive";
        this.e = 0.0;
    }

    initialize() {
        console.log(`${this.name} initialized`);
    }

    deltaExternalTransition(e, x) {
        console.log(`${this.name} handling external event at time ${this.currentTime}`);
    }

    deltaInternalTransition() {
        console.log(`${this.name} internal state transition at time ${this.currentTime}`);
    }

    output() {
        console.log(`${this.name} generating output at time ${this.currentTime}`);
    }

    timeAdvance() {
        return this.sigma;
    }

    confluentTransition(e, x) {
        this.deltaInternalTransition();
        this.deltaExternalTransition(e, x);
    }

    holdIn(phase, sigma) {
        this.phase = phase;
        this.sigma = sigma;
    }
}

class CoupledModel extends Component {
    constructor(name) {
        super(name);
        this.couplings = [];
        this.childComponents = new Map();
    }

    addChild(child) {
        this.childComponents.set(child.id, child);
    }

    findChildByName(name) {
        return [...this.childComponents.values()].find(child => child.name === name);
    }

    addCoupling(source_port, target_port) {
        this.couplings.push(new Coupling(source_port, target_port));
    }
}

class Simulator {
    constructor(model, parent, rootCoordinator) {
        this.atomicModel = model;
        this.parent = parent;
        this.name = model.name.concat(' simulator');
        this.rootCoordinator = rootCoordinator;
        this.e = 0;
        this.tL = this.rootCoordinator.t - this.e;
        this.tN = this.tL + this.atomicModel.timeAdvance();
    }

    initialize() {
        this.atomicModel.initialize();
    }

    handleInternalEvents(t) {
        this.tL = t;
        this.atomicModel.currentTime = t;
        this.atomicModel.output();
        this.atomicModel.deltaInternalTransition();
        this.tN = this.tL + this.atomicModel.timeAdvance();
        this.rootCoordinator.scheduleImminentEvent(this.tN, this.atomicModel);
    }

    handleExternalEvents(t) {
        this.atomicModel.currentTime = t;
        this.atomicModel.e = t - this.tL;
        let bag = new Bag();
        this.atomicModel.inputPorts.forEach(port => {
            bag.mergeTo(port.getMessagesBag());
            port.clearMessages();
        });
        if (!bag.isEmpty()) {
            this.atomicModel.deltaExternalTransition(t - this.tL, bag);
            this.tL = t;
            this.tN = t + this.atomicModel.timeAdvance();
            this.rootCoordinator.scheduleImminentEvent(this.tN, this.atomicModel);
        }
    }

    getNextEventTime() {
        return this.tN;
    }
}

class Coordinator {
    constructor(model, parent, rootCoordinator) {
        this.coupledModel = model;
        this.parent = parent;
        this.name = model.name.concat(' coordinator');
        this.rootCoordinator = rootCoordinator;
        this.tL = rootCoordinator.t;
        this.tN = Infinity;
        this.simulatorsAndCoordinators = new Map();
        // to do - this.eventList = new MinHeap();
        this.initializeSimulators();
    }

    initializeSimulators() {
        this.coupledModel.childComponents.forEach((child) => {
            if (child instanceof AtomicModel) {
                let simulator = new Simulator(child, this, this.rootCoordinator);
                this.simulatorsAndCoordinators.set(child, simulator);
                this.rootCoordinator.imminents.insert(new Event(child.sigma, child));
            } else if (child instanceof CoupledModel) {
                this.simulatorsAndCoordinators.set(child, new Coordinator(child, this, this.rootCoordinator));
            }
        });
    }

    initialize() {
        this.coupledModel.childComponents.forEach((child) => {
            this.simulatorsAndCoordinators.get(child).initialize();
        });
    }

    handleInternalEvents(t, nextEvent) {
        this.simulatorsAndCoordinators.forEach((simulator, child) => {
            if (simulator.parent === this && simulator instanceof Simulator) {
                if (child == nextEvent.component) {
                    this.simulatorsAndCoordinators.get(child).handleInternalEvents(nextEvent.time);
                    this.rootCoordinator.t = nextEvent.time;
                }
            } else if (simulator.parent === this && simulator instanceof Coordinator){
                this.simulatorsAndCoordinators.get(child).handleInternalEvents(t, nextEvent);
            }
        });
    }

    handleExternalEvents(t) {
        this.coupledModel.couplings.forEach(coupling => {
            if (coupling.source && coupling.target && !coupling.source.isEmpty()) {
                coupling.target.putMessagesToReceive(coupling.source.getMessagesBag());
                coupling.source.clearMessages();
                if(coupling.target.model === this.coupledModel)
                    this.handleExternalEvents(t);
                else {
                    if(this.simulatorsAndCoordinators.get(coupling.target.model))
                        this.simulatorsAndCoordinators.get(coupling.target.model).handleExternalEvents(t);
                    else
                        console.error('Target model not found, most likely due to error in coupling!');
                }
            }
        });
    }

    getNextEventTime() {
        let minTime = Infinity;
        this.simulatorsAndCoordinators.forEach(simulator => {
            const childTime = simulator.getNextEventTime();
            if (childTime < minTime)
                minTime = childTime;
        });
        return minTime;
    }
}

class RootCoordinator {
    constructor(model, t) {
        this.name = 'root coordinator';
        this.t = t;
        this.imminents = new MinHeap();
        if (model instanceof CoupledModel) {
            this.rootCoordinator = new Coordinator(model, this, this);
            this.rootModel = model;
        }
        else {
            this.rootCoupledModel = new CoupledModel('root');
            this.rootCoupledModel.addChild(model);
            this.rootCoordinator = new Coordinator(this.rootCoupledModel, this, this);
            this.rootModel = this.rootCoupledModel;
        }
        if (!this.imminents.isEmpty())
            this.tN = this.imminents.peek().time;
    }

    initialize() {
        this.rootCoordinator.initialize();
    }

    scheduleImminentEvent(time, model) {
        this.imminents.removeAt(model);
        this.imminents.insert(new Event(time, model));
    }

    removeImminentEvent() {
        return this.imminents.remove();
    }

    startSimulation() {
        console.log('Starting simulation...');
        this.initialize();
    }

    async runSimulationUntil(stopTime) {
        while (this.t < stopTime && this.getNextEventTime() !== Infinity) {
            console.log(this.t);
            const nextEvent = this.removeImminentEvent();
            this.rootCoordinator.handleInternalEvents(this.t, nextEvent);
            this.rootCoordinator.handleExternalEvents(this.t);
            await new Promise(resolve => setTimeout(resolve, execution_delay));
            console.log(this.t);
            this.t = this.getNextEventTime();
        }
        console.log('Simulation completed!');
    }

    getNextEventTime() {
        if (!this.imminents.isEmpty()) {
            return this.imminents.peek().time;
        } else {
            return Infinity;
        }
    }
    // To Do:  run - step - pause - resume - reset
}
