import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GameComponent } from './game.component';
import { BallComponent } from '../ball/ball.component';

@NgModule({
  declarations: [
    GameComponent,
  ],
  exports: [
    GameComponent,
  ],
  imports: [
    CommonModule
  ],
  entryComponents: [
    BallComponent,
  ],
})
export class GameModule { }
