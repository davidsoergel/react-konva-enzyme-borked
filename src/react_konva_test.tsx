
import * as React from 'react';

import {mount} from './enzyme';
import {Rect} from 'react-konva';

describe('<Rect />', () => {

  it('is testable', () => {

    let clickCount = 0;
    const handleClick = () => {
      clickCount++;
      console.log('click');
    }

    // This produces the 'PascalCase' error and the 'tag unrecognized' error
    const rect = mount(<Rect id='test' onClick={handleClick} />);

    // the wrapper looks OK, with capitalized name 'Rect'
    console.log('Wrapper debug:', rect.debug());
    console.log('Wrapper props:', rect.props());

    // Unclear to me what the instance is, but anyway it has no props.
    // I think it's supposed to be a React Component, but the Konva binding
    // doesn't quite provide that (??).
    console.log('Instance:', rect.instance());
    console.log('Instance props:', rect.instance().props);
    console.log('Instance props:', rect.instance().state);

    // the DOM node has no onClick handler, and the name is 'rect' (lowercase)
    console.log('DOMNode:', rect.getDOMNode());

    // This does not work because props is undefined
    // rect.instance().props['onClick']();

    // this does not work
    const clickEvent = new MouseEvent('click');
    rect.getDOMNode().dispatchEvent(clickEvent);
    console.log('Click count: ', clickCount);  // still 0

    // this does not work, despite @Anupheaus suggestion at
    // https://github.com/airbnb/enzyme/issues/1357#issuecomment-404665936
    const clickEvent2 = new (window as any)['MouseEvent']('click');
    rect.getDOMNode().dispatchEvent(clickEvent2);
    console.log('Click count: ', clickCount);  // still 0

    // this works, but is disindicated by
    // https://github.com/airbnb/enzyme/issues/1357
    rect.simulate('click')
    console.log('Click count: ', clickCount);  // prints 1

    // This works, but I'm not sure it tests enough.
    // This is different but related, arguing that this 'direct' test is good:
    // https://bambielli.com/til/2018-03-04-directly-test-react-component-methods/
    rect.prop('onClick')();
    console.log('Click count: ', clickCount);  // prints 2
  });
});
