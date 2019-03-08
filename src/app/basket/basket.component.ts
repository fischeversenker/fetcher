import { Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent {

  @Input()
  set x(value: number) {
    this._x = value;
    this._setProperty('left', value + 'px');
  }
  get x(): number {
    return this._x;
  }
  private _x: number = 0;

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
  ) { }

  private _setProperty(key: string, value: string): void {
    this._elementRef.nativeElement.style.setProperty('--' + key, value);
  }

}
