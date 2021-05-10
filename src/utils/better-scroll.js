import BScroll from '@better-scroll/core';
import PullUp from '@better-scroll/pull-up';
import PullDown from '@better-scroll/pull-down';
import ScrollBar from '@better-scroll/scroll-bar';
import MouseWheel from '@better-scroll/mouse-wheel';
import ObserveDOM from '@better-scroll/observe-dom';
import InfinityScroll from '@better-scroll/infinity';

BScroll.use(PullUp);
BScroll.use(PullDown);
BScroll.use(ScrollBar);
BScroll.use(MouseWheel);
BScroll.use(ObserveDOM);
BScroll.use(InfinityScroll);

export default BScroll;
