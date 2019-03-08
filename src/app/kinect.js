import EventEmitter from 'events';

export class Kinect extends EventEmitter {
  constructor() {
    super();
    this.connected = false;
    this.socket = null;
    this.timer = null;
    this.address = '127.0.0.1';
    this.sensor = {
      available: true,
      trackedBodies: 0
    };

    this.on('newListener', this.handleNewListener);
    this.on('removeListener', this.handleRemoveListener);
  }

  connect(address, secure) {
    if (address !== undefined) {
      this.address = address;
    }
    if (secure === undefined) {
      secure = true;
    }
    if (this.socket !== null) {
      this.socket.close();
    }

    this.socket = new WebSocket(`${secure ? 'wss' : 'ws'}://${this.address}:8181`);
    this.socket.binaryType = 'arraybuffer';

    this.lastAdded = null;
    this.lastRemoved = null;

    this.socket.onopen = () => {
      clearTimeout(this.timer);
      this.timer = null;

      this.connected = true;
      this.updateSessionOptions();
      this.updateState();
    };

    this.socket.onclose = () => {
      if (this.socket.readyState === WebSocket.OPEN) {
        // Previous connection closed.
        return;
      }

      this.close();

      this.timer = setTimeout(() => {
        this.connect();
      }, 1000);

    };

    this.socket.onmessage = msg => {
      if (typeof msg.data === 'string') {
        const event = JSON.parse(msg.data);

        switch (event.type) {
          case 'state':
            this.handleStateEvent(event);
            break;
          case 'bodies':
            this.handleBodiesEvent(event);
            break;
          case 'gesture':
            this.handleGestureEvent(event);
            break;
          default:
            break;
        }
      }
      else if (msg.data instanceof ArrayBuffer) {
        this.handleStreamEvent(msg.data);
      }
    };
  }

  close() {
    this.connected = false;
    this.sensor.available = false;
    this.sensor.trackedBodies = 0;
    this.updateState();

    if (this.socket !== null) {
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
  }

  /* Private methods */
  handleNewListener(event) {
    this.lastAdded = event;
    this.updateSessionOptions();
  }

  handleRemoveListener(event) {
    this.lastRemoved = event;
    this.updateSessionOptions();
  }

  sendServerEvent(eventType, data) {
    const event = { Type: eventType, Data: JSON.stringify(data) };
    this.socket.send(JSON.stringify(event));
  }

  updateState() {
    const state = {
      connected: this.connected,
      available: this.sensor.available,
      trackedBodies: this.sensor.trackedBodies
    };
    this.emit('state', state);
  }

  listenersCount(event) {
    let count = this.listenerCount(event);
    if (this.lastAdded !== null && event === this.lastAdded) {
      count++;
      this.lastAdded = null;
    }
    if (this.lastRemoved !== null && event === this.lastAdded) {
      count--;
      this.lastRemoved = null;
    }
    return count;
  }

  updateSessionOptions() {
    const config = {
      GestureEvents: this.listenersCount('gesture') > 0,
      BodyEvents: this.listenersCount('bodies') > 0,
      DepthEvents: this.listenersCount('depth') > 0
    };

    if (this.connected) {
      this.sendServerEvent('SessionConfig', config);
    }
  }

  /* Server event handlers */
  handleStateEvent(event) {
    this.sensor.available = event.state.available;
    this.sensor.trackedBodies = event.state.trackedBodies;
    this.updateState();
  }

  handleBodiesEvent(event) {
    const bodies = [];
    for (let i = 0; i < event.bodies.length; i++) {
      bodies.push(new Body(event.bodies[i]));
    }
    this.emit('bodies', bodies, event.floorClipPlane);
  }

  handleGestureEvent(event) {
    const { gesture, body } = event;
    this.emit('gesture', gesture, body);
  }

  handleStreamEvent(data) {
    const desc = new Uint16Array(data, 0, 10);

    if (desc[0] === Kinect.StreamType.Depth) {
      const frameDesc = {width: desc[1], height: desc[2], minDistance: desc[3], maxDistance: desc[4]};
      this.emit('depth', new Uint16Array(data, 10), frameDesc);
    }
  }
}

Kinect.StreamType = Object.freeze({
  'IR': 0,
  'Depth': 1,
  'Color': 2
});

Kinect.JointType = Object.freeze({
  0: 'SpineBase',
  1: 'SpineMid',
  2: 'Neck',
  3: 'Head',
  4: 'ShoulderLeft',
  5: 'ElbowLeft',
  6: 'WristLeft',
  7: 'HandLeft',
  8: 'ShoulderRight',
  9: 'ElbowRight',
  10: 'WristRight',
  11: 'HandRight',
  12: 'HipLeft',
  13: 'KneeLeft',
  14: 'AnkleLeft',
  15: 'FootLeft',
  16: 'HipRight',
  17: 'KneeRight',
  18: 'AnkleRight',
  19: 'FootRight',
  20: 'SpineShoulder',
  21: 'HandTipLeft',
  22: 'ThumbLeft',
  23: 'HandTipRight',
  24: 'ThumbRight'
});

Kinect.HandState = Object.freeze({
  0: 'Unknown',
  1: 'NotTracked',
  2: 'Open',
  3: 'Closed',
  4: 'Lasso'
});

Kinect.TrackingConfidence = Object.freeze({
  0: 'Hight',
  1: 'Low'
});

Kinect.TrackingState = Object.freeze({
  0: 'NotTracked',
  1: 'Inferred',
  2: 'Tracked'
});

export class Body {
  constructor(compactBody) {
    this.trackingId = compactBody.TI;
    this.isClosest = compactBody.IC;
    this.handLeftConfidence = Kinect.TrackingConfidence[compactBody.HLC];
    this.handLeftState = Kinect.HandState[compactBody.HLS];
    this.handRightConfidence = Kinect.TrackingConfidence[compactBody.HRC];
    this.handRightState = Kinect.HandState[compactBody.HRS];
    this.leanTrackingState = Kinect.TrackingState[compactBody.LTS];
    this.lean = compactBody.LN;
    this.skeleton = {};

    for (let i = 0; i < compactBody.JN.length; i++) {
      this.skeleton[Kinect.JointType[i]] = new Joint(compactBody.JN[i]);
    }
  }
}

export class Joint {
  constructor(compactJoint) {
    this.pos = compactJoint.P;
    this.orient = compactJoint.O;
    this.state = Kinect.TrackingState[compactJoint.S];
  }
}
