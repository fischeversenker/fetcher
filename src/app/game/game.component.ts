import { AfterViewInit, Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { BallComponent } from '../ball/ball.component';
import { BasketComponent } from '../basket/basket.component';
import { interval } from 'rxjs';
import { takeUntil, takeWhile, finalize } from 'rxjs/operators';
import { KinectService } from '../kinect.service';

const BALL_ACCELERATION = 0.4;
const GAME_DURATION = 30;

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  host: {
    '(mousemove)': 'onMousemove($event)',
  },
})
export class GameComponent implements AfterViewInit {

  @ViewChild(BasketComponent) basket: BasketComponent;
  @ViewChild('balls', { read: ViewContainerRef }) ballContainer;

  score: number = 0;
  timeLeft: number = 0;
  mouseActivated: boolean = false;

  private _running: boolean;
  private _ballComponents: any[] = [];
  private _ballFactory: ComponentFactory<BallComponent>;

  constructor(
    private resolver: ComponentFactoryResolver,
    private _kinectService: KinectService,
  ) {
    this._ballFactory = this.resolver.resolveComponentFactory(BallComponent);
  }

  ngAfterViewInit() {
    interval(1500).subscribe(() => {
      if (this._running) {
        this.addBall();
      }
    });

    this._kinectService.positionChanges$.subscribe((x: number) => {
      if (!this.mouseActivated) {
        this.basket.x = x;
      }
    });

    this._start();
  }

  onMousemove(event: MouseEvent) {
    if (this.mouseActivated) {
      this.basket.x = event.clientX;
    }
  }

  addBall(x: number = Math.random(), y: number = 0) {
    const ballComponent = this.ballContainer.createComponent(this._ballFactory);

    ballComponent.instance.x = x * window.innerWidth;
    ballComponent.instance.y = y;
    ballComponent.instance.acceleration = BALL_ACCELERATION;

    this._ballComponents.push({
      ref: ballComponent,
      destroyed: false
    });
  }

  private _start() {
    this._running = true;
    this.timeLeft = GAME_DURATION;
    this._update();
    // countdown
    interval(1000).pipe(
      takeWhile(() => this.timeLeft > 0),
      finalize(() => this._stop()),
    ).subscribe(() => this.timeLeft--);
  }

  private _stop() {
    this._running = false;
  }

  private _update() {
    if (!this._running) {
      return false;
    }

    this._ballComponents.forEach(ballComponent => {
      if (ballComponent.destroyed) {
        return;
      }

      ballComponent.ref.instance.update();

      // check if passed bottom of screen
      if (ballComponent.ref.instance.y > window.innerHeight) {
        this._destroyBall(ballComponent);
      }

      // check if caught by mouse
      const ballX = ballComponent.ref.instance.x;
      const ballY = ballComponent.ref.instance.y;
      const requiredY = window.innerHeight - 40; // basket height

      if (ballY >= requiredY && Math.abs(ballX - this.basket.x) < 80) {
        this.score++;
        this._destroyBall(ballComponent);
      }
    });

    window.requestAnimationFrame(() => {
      this._update();
    });
  }

  private _destroyBall(ball: any) {
    ball.ref.destroy();
    ball.destroyed = true;
  }

}
