import { Injectable, Output, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';

const SERVER_IP = '10.0.1.5';

@Injectable({
  providedIn: 'root'
})
export class KinectService implements AfterViewInit {

  @Output() positionChanges$: Subject<number> = new Subject();

  private _kinectron: Kinectron;

  constructor() {
    this._kinectron = new Kinectron(SERVER_IP);
    console.log({ kinectron: this._kinectron });

    // Connect with server over peer
    // (not sure if necessary)
    this._kinectron.makeConnection();
  }

  ngAfterViewInit() {
    this._kinectron.startTrackedJoint(this._kinectron.HEAD, this._onTrackedHead);
  }

  private _onTrackedHead(head) {
    console.log('tracked head', { head });
    this.positionChanges$.next(head.depthX * window.innerWidth);
  }
}

// typing for KInectron
// https://kinectron.github.io/docs/api2.html
declare class Kinectron {
  constructor(id: string);
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
