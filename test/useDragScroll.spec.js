import React from 'react'
import { mount } from 'enzyme'
import useDragScroll from '../src'

const HookWrapper = () => {
  const ref = useDragScroll()
  return <div ref={ref} />
}

describe('useDragScroll', () => {
  let wrapper

  afterEach(() => {
    wrapper.unmount()
  })

  it('should do something', () => {
    wrapper = mount(<HookWrapper />)

    wrapper.find('div').first().simulate('dragover')

    expect(wrapper).toMatchSnapshot()
  })
})
