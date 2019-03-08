import { Injectable, Output } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { Kinect } from './kinect';

@Injectable({
  providedIn: 'root'
})
export class KinectService {

  @Output() gestureChanges$: Subject<any> = new Subject();
  @Output() stateChanges$: Subject<any> = new Subject();
  @Output() positionChanges$: Subject<number> = new Subject();

  constructor() {
    // const kinect = new Kinect();
    // kinect.connect();

    // kinect.addEventListener('gesture', (event) => {
    //   this.gestureChanges$.next(event.gesture);
    // });

    // kinect.addEventListener('state', (event: any) => {
    //   if (event.connected) {
    //     console.log('connected to kinect at ' + kinect._address);
    //   }
    // });

    interval(100).subscribe(val => this.positionChanges$.next(val * 10));
  }
}
