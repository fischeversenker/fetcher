import { Injectable, Output } from '@angular/core';
import { Subject } from 'rxjs';

const SERVER_IP = '127.0.0.1';

@Injectable({
  providedIn: 'root'
})
export class KinectService {

  @Output() positionChanges$: Subject<number> = new Subject();

  private _kinectron: Kinectron;

  constructor() {
    this._kinectron = new Kinectron(SERVER_IP);
    this._kinectron.makeConnection();
    this._kinectron.startTrackedJoint(this._kinectron.SPINEMID, (head) => this.onTrackedHead(head));
  }

  onTrackedHead(data) {
    if (data.cameraZ < 2){
      const newX = (data.depthX * 1.5) - 0.4;
      this.positionChanges$.next(newX * window.innerWidth);
    }
  }
}

// typing for KInectron
// https://kinectron.github.io/docs/api2.html
declare class Kinectron {
  constructor(id?: string);
  makeConnection();
  startTrackedBodies(callback?: Function);
  startColor(callback: Function);
  startDepth(callback: Function);
  startRawDepth(callback: Function);
  startTrackedBodies(callback: Function);
  startTrackedJoint(id: number, callback: Function); // See "Accessing Joints". Head has ID 3 (kinectron.HEAD)
  startBodies(callback: Function);
  startInfrared(callback: Function);
  startLEInfrared(callback: Function);
  startKey(callback: Function);
  startRGBD(callback: Function);
  setColorCallback(callback: Function);
  setDepthCallback(callback: Function);
  setRawDepthCallback(callback: Function);
  setTrackedBodiesCallback(callback: Function);
  setBodiesCallback(callback: Function);
  setInfraredCallback(callback: Function);
  setLeInfraredCallback(callback: Function);
  setKeyCallback(callback: Function);
  setRGBDCallback(callback: Function);

  SPINEBASE: number;
  SPINEMID: number;
  NECK: number;
  HEAD: number;
  SHOULDERLEFT: number;
  ELBOWLEFT: number;
  WRISTLEFT: number;
  HANDLEFT: number;
  SHOULDERRIGHT: number;
  ELBOWRIGHT: number;
  WRISTRIGHT: number;
  HANDRIGHT: number;
  HIPLEFT: number;
  KNEELEFT: number;
  ANKLELEFT: number;
  FOOTLEFT: number;
  HIPRIGHT: number;
  KNEERIGHT: number;
  ANKLERIGHT: number;
  FOOTRIGHT: number;
  SPINESHOULDER: number;
  HANDTIPLEFT : number;
  THUMBLEFT: number;
  HANDTIPRIGHT: number;
  THUMBRIGHT: number;
}
