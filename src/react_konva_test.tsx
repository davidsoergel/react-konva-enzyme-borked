
import * as React from 'react';

import {mount} from './enzyme';
import {Rect, Layer} from 'react-konva';
import {MouseableKonvaStage} from './mouseable_konva_stage';


interface TestAppProps {
  components?: JSX.Element[];
}

class TestApp extends React.Component<TestAppProps, {}> {
  constructor(props: TestAppProps) {
    super(props);
  }

  public render() {
    return (
      <MouseableKonvaStage
        width={1000}
        height={1000}
        forSimulation={true}
      >
        <Layer>
          {this.props.components}
        </Layer>
      </MouseableKonvaStage>
    );
  }
}

describe('<MouseableKonvaStage />', () => {

  it('is testable', () => {

    let clickCount = 0;
    const handleClick = () => {
      clickCount++;
      console.log('click');
    }

    const components = [(
      <Rect
        key='test'
        x={10}
        y={10}
        height={20}
        width={20}
        onClick={handleClick}
      />)];

    const wrapper = mount(<TestApp components={components} />);
    const stage = wrapper.find(
      MouseableKonvaStage).instance() as MouseableKonvaStage;

    // Clicking outside the Rect does nothing, as expected.
    stage.simulateMouseClick({x: 40, y: 40});
    console.log('Click count: ', clickCount);  // 0
    expect(clickCount).toEqual(0);

    // Clicking inside the Rect calls the handler.
    stage.simulateMouseClick({x: 20, y: 20});
    console.log('Click count: ', clickCount);  // 1
    expect(clickCount).toEqual(1);

    // So far, so good!

    // Add a new Rect to the stage
    components.push((<Rect
      key='test2'
      x={30}
      y={30}
      height={20}
      width={20}
      onClick={handleClick}
    />));

    wrapper.setProps({components});

    // PROBLEM: Clicking the new Rect has no effect
    stage.simulateMouseClick({x: 40, y: 40});
    console.log('Click count: ', clickCount);  // still 1!
    // expect(clickCount).toEqual(2);  // fail

    // APPARENT CAUSE: The hit graphs were not redrawn on the props update.
    // Force redraw them to see if that helps.
    stage.redrawLayerHitGraphs();

    // Yep: now clicking the new Rect works
    stage.simulateMouseClick({x: 40, y: 40});
    console.log('Click count: ', clickCount);  // 2
    expect(clickCount).toEqual(2);
  });
});
