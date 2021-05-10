<template>
  <div class="xgplayer" @click="$emit('click')">
    <header class="xgplayer-header">
      <span>{{ title }}</span>
      <span class="xgplayer-header__action">
        <a-icon type="close-circle" @click="handleCloseVideo" />
      </span>
    </header>
    <div :id="videoId" class="xgplayer-node"></div>
  </div>
</template>

<script>
import _ from 'lodash';
import 'xgplayer';
import FlvPlayer from 'xgplayer-flv';
// import FlvPlayer from 'xgplayer-flv.js';
// import { progress } from 'xgplayer/dist/controls';

export default {
  name: 'XgPlayer',
  computed: {
    videoId() {
      return _.uniqueId('player_');
    },
  },
  watch: {
    url(url) {
      if (this.player) {
        if (this.player.hasStart) {
          this.player.src = url;
        } else {
          this.player.start(url);
        }
      }
    },
  },
  props: {
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    plugins: {
      type: Object,
      default() {
        return {};
      },
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'XgPlayer',
    },
    type: {
      type: String,
      default: 'auto',
    },
    url: {
      type: String,
      default:
        'https://sf1-hscdn-tos.pstatp.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-480p.flv',
    },
  },
  data() {
    return {
      player: null,
      baseOptions: {
        cors: true,
        isLive: true,
        preloadTime: 30,
        minCachedTime: 5,
        volume: 1,
        fluid: false,
        width: '100%',
        height: '100%',
        autoplay: false,
        videoInit: true,
        lang: 'zh-cn',
      },
      flvConfig: {
        accurateSeek: true,
        enableWorker: true,
        enableStashBuffer: false,
        stashInitialSize: 128,
      },
    };
  },
  mounted() {
    if (this.url) {
      this.initVideo(this.url, this.type);
    }
  },
  beforeDestroy() {
    this.destroyVideo();
  },
  methods: {
    handleCloseVideo() {
      this.$emit('close');
      this.destroyVideo();
    },
    initVideo(url) {
      this.player = new FlvPlayer({
        id: this.videoId,
        url: url,
        ...this.baseOptions,
        ...this.options,
      });
      this.player.on('play', () => {
        console.log('play');
      });
      this.player.on('pause', () => {
        console.log('pause');
      });
      this.player.on('ended', () => {
        console.log('ended');
      });
      this.player.on('seeking', () => {
        console.log('seeking', this.player.currentTime);
      });
      this.player.on('durationchange', () => {
        console.log('durationchange', this.player.duration);
      });
    },
    playVideo() {
      this.player && this.player.play();
    },
    pauseVideo() {
      this.player && this.player.pause();
    },
    destroyVideo() {
      this.player && this.player.destroy();
    },
  },
};
</script>

<style lang="less" scoped>
.xgplayer {
  position: relative;
  width: 100%;
  height: 100%;
  padding-top: 3vh;
  transition: all 0.5s;
  background-color: #000;
  border: @border-dark;

  &.selected {
    border: 2px solid @theme-color1;
  }
  &.multiple {
    width: 50%;
    height: 50%;
  }
  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3vh;
    padding: 0 10px;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    background-color: #222;

    .anticon {
      font-size: 18px;
      cursor: pointer;

      + .anticon {
        margin-left: 10px;
      }
      &:hover {
        color: @theme-color2;
      }
    }
  }
  &-node {
    width: 100%;
    height: 100%;
    outline: none;
  }
}
</style>
