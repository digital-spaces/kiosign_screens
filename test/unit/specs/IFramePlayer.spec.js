import { mount } from '@vue/test-utils';
import IFramePlayer from '@/components/IFramePlayer';

describe('IFramePlayer.vue', () => {
  it('should render correct contents', () => {
    const wrapper = mount(IFramePlayer);
    expect(wrapper.contains('iframe')).toBe(true);
  });
});
