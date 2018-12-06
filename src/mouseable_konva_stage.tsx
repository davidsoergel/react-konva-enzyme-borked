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

// tslint:disable-next-line:no-empty-interface
interface MouseableKonvaStageProps extends StageProps {
  forSimulation?: boolean;
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
  React.Component<MouseableKonvaStageProps, {}> {
  // TypeScript typings prevent access to private variables, so ignore them
  // by typing this as any instead of Konva.Stage.
  // tslint:disable-next-line:no-any
  private stage: any;

  constructor(props: MouseableKonvaStageProps) {
    super(props);
  }

  public simulateMouseDown(pos: MouseCoordinates) {
    const top = 0; //this.stage.content.getBoundingClientRect().top as number;
    this.stage._mousedown(
      {clientX: pos.x, clientY: pos.y + top, button: pos.button});
  }

  public simulateMouseMove(pos: MouseCoordinates) {
    const top = this.stage.content.getBoundingClientRect().top as number;
    const evt = {clientX: pos.x, clientY: pos.y + top, button: pos.button};
    this.stage._mousemove(evt);
    Konva.DD._drag(evt);
    console.log('dragging');
  }

  public simulateMouseUp(pos: MouseCoordinates) {
    const top = this.stage.content.getBoundingClientRect().top as number;
    const evt = {clientX: pos.x, clientY: pos.y + top, button: pos.button};
    Konva.DD._endDragBefore(evt);
    this.stage._mouseup(evt);
    Konva.DD._endDragAfter(evt);

    console.log('mouse up at', pos);
  }

  public simulateMouseDrag(from: MouseCoordinates, to: MouseCoordinates) {
    this.simulateMouseDown(from);
    this.simulateMouseMove(to);
    this.simulateMouseUp(to);
  }

  public simulateMouseClick(pos: MouseCoordinates) {
    this.simulateMouseDown(pos);
    this.simulateMouseUp(pos);
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


  public componentDidUpdate() {
    // It's overkill to do this on every update...
    // this.redrawLayerHitGraphs();
  }


  public redrawLayerHitGraphs() {
    if (this.props.forSimulation) {
      // If we don't force redrawing the layer hit graphs, then their
      // contents are not clickable.

      // This is needed when using the above simulate*() methods, but I don't
      // understand why.  Real user mouse clicks work fine in production, so
      // we don't want to bog things down there-- hence the forSimulation
      // switch, which we turn on only in tests.

      console.log('Redraw hit graphs');

      // Note find() returns a Konva.Collection, and drawHit() maps over that.
      // tslint:disable-next-line:no-any
      (this.stage.find('Layer') as any).drawHit();
    }
  }
}
