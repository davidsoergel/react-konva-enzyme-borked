/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as Konva from 'konva';
import * as React from 'react';
import { Stage, StageProps } from 'react-konva';

export interface MouseCoordinates {
  x: number;
  y: number;
  // TODO(soergel): Remove button as it seems unused?
  // Maybe we'll need it later to simulate right-click?
  // tslint:disable-next-line:no-any
  button?: any;
}

// Adapted from the react-konva tests:
// https://github.com/konvajs/react-konva/blob/master/tests/mocking.js

/**
 * A Konva Stage on which we can simulate user actions.
 *
 * Typically the simulated mouse events will only be used in testing, but
 * there might be some production use cases too.
 */
export class MouseableKonvaStage extends
  React.Component<StageProps, {}> {
  // TypeScript typings prevent access to private variables, so ignore them
  // by typing this as any instead of Konva.Stage.
  // tslint:disable-next-line:no-any
  private stage: any;

  constructor(props: StageProps) {
    super(props);
  }

  public async simulateMouseDown(pos: MouseCoordinates) {
    await finishPendingCanvasUpdates();
    const top = 0; //this.stage.content.getBoundingClientRect().top as number;
    this.stage._mousedown(
      {clientX: pos.x, clientY: pos.y + top, button: pos.button});
  }

  public async simulateMouseMove(pos: MouseCoordinates) {
    await finishPendingCanvasUpdates();
    const top = this.stage.content.getBoundingClientRect().top as number;
    const evt = {clientX: pos.x, clientY: pos.y + top, button: pos.button};
    this.stage._mousemove(evt);
    Konva.DD._drag(evt);
    console.log('dragging');
  }

  public async simulateMouseUp(pos: MouseCoordinates) {
    await finishPendingCanvasUpdates();
    const top = this.stage.content.getBoundingClientRect().top as number;
    const evt = {clientX: pos.x, clientY: pos.y + top, button: pos.button};
    Konva.DD._endDragBefore(evt);
    this.stage._mouseup(evt);
    Konva.DD._endDragAfter(evt);

    console.log('mouse up at', pos);
  }

  public async simulateMouseDrag(from: MouseCoordinates, to: MouseCoordinates) {
    await this.simulateMouseDown(from);
    await this.simulateMouseMove(to);
    await this.simulateMouseUp(to);
  }

  public async simulateMouseClick(pos: MouseCoordinates) {
    await this.simulateMouseDown(pos);
    await this.simulateMouseUp(pos);
  }

  public getPointerPosition(): MouseCoordinates {
    return (this.stage as Stage).getStage().getPointerPosition();
  }

  public render() {
    return (
      <Stage
        {...this.props}
        ref={(node) => (this.stage = node)}
      >
        {this.props.children}
      </Stage>);
  }

}

async function finishPendingCanvasUpdates() {
  // Give the async layer hit graph redraw a chance to fire.
  // Without this (or, alternatively, forcing a synchronous redraw via
  // `stage.redrawLayerHitGraphs();`), there may be pending canvas updates
  // that are not yet reflected here.
  await new Promise(res => setTimeout(res, 1));
}
