import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { Subject } from 'rxjs';

const MAX_VELOCITY = 10;

@Component({
  selector: 'app-ball',
  templateUrl: './ball.component.html',
  styleUrls: ['./ball.component.scss'],
})
export class BallComponent {

  @Input()
  set x(value: number) {
    this._x = value;
    this._setProperty('left', value + 'px');
  }
  get x(): number { return this._x; }
  private _x: number = 0;

  @Input()
  set y(value: number) {
    this._y = value;
    this._setProperty('top', value + 'px');
  }
  get y(): number { return this._y; }
  private _y: number = 0;

  private _velocity: number = 0;
  @Input() acceleration: number = 0.3;

  @Input() caught: boolean = false;

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
  ) {
    this.x = 0;
    this.y = 0;
    this._setProperty('size', '100px');
  }

  update() {
    this.y += this._velocity;
    if (this._velocity < MAX_VELOCITY || this.acceleration < 0) {
      this._velocity += this.acceleration;
    }
  }

  private _setProperty(key: string, value: string): void {
    this._elementRef.nativeElement.style.setProperty('--' + key, value);
  }

}
