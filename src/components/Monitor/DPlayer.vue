<template>
  <div class="player" @click="$emit('click')">
    <header class="player-header">
      <span>{{ title }}</span>
      <span class="player-header__action">
        <a-icon type="close-circle" @click="handleCloseVideo" />
      </span>
    </header>
    <div :id="videoId" class="player-node"></div>
  </div>
</template>

<script>
import _ from 'lodash';
import flvjs from 'flv.js';
import hlsjs from 'hls.js';
import DPlayer from 'dplayer';

export default {
  name: 'DPlayer',
  computed: {
    videoId() {
      return _.uniqueId('player_');
    },
  },
  watch: {
    type(type) {
      this.destroyVideo();
      this.initVideo(this.url, type);
    },
    url(url) {
      this.player && this.player.switchVideo({ url });
    },
  },
  props: {
    contextmenu: {
      type: Array,
      default() {
        return [];
      },
    },
    highlight: {
      type: Array,
      default() {
        return [];
      },
    },
    subtitle: {
      type: Object,
      default() {
        return {};
      },
    },
    danmaku: {
      type: Object,
      default() {
        return {};
      },
    },
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
    video: {
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
      default: 'DPlayer',
    },
    type: {
      type: String,
      default: 'auto',
    },
    url: {
      type: String,
      default: 'https://s1.pstatp.com/cdn/expire-1-M/byted-player-videos/1.0.0/xgplayer-demo.mp4',
      // 'https://sf1-hscdn-tos.pstatp.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-480p.flv',
    },
  },
  data() {
    return {
      player: null,
      baseOptions: {
        volume: 1,
        live: false,
        loop: false,
        mutex: true,
        hotkey: true,
        autoplay: false,
        screenshot: false,
        lang: 'zh-cn',
        preload: 'auto',
        theme: '#008c74',
        playbackSpeed: [0.5, 0.75, 1, 1.25, 1.5, 2],
      },
      flvOptions: {
        type: 'flv',
        cors: true,
        isLive: true,
        hasAudio: true,
        hasVideo: true,
        withCredentials: false,
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
    initVideo(url, type) {
      let customType;
      switch (type) {
        case 'flv':
          type = 'customFlv';
          customType = {
            customFlv: (video, player) => {
              if (flvjs.isSupported()) {
                const flvPlayer = flvjs.createPlayer(
                  { url: video.src, ...this.flvOptions },
                  this.flvConfig
                );
                flvPlayer.attachMediaElement(video);
                flvPlayer.load();
              } else {
                this.$message.warn('当前浏览器暂不支持FLV视频流，建议使用谷歌/火狐浏览器！');
              }
            },
          };
          break;
        case 'hls':
          type = 'customHls';
          customType = {
            customHls: (video, player) => {
              const hlsPlayer = new hlsjs();
              hlsPlayer.loadSource(video.src);
              hlsPlayer.attachMedia(video);
            },
          };
          break;
        default:
          break;
      }
      this.player = new DPlayer({
        container: document.getElementById(this.videoId),
        video: { url, type, customType },
        pluginOptions: this.plugins,
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
        console.log('seeking', this.player.video.currentTime);
      });
      this.player.on('durationchange', () => {
        console.log('durationchange', this.video.duration);
      });
    },
    playVideo() {
      this.player && this.player.play();
    },
    pauseVideo() {
      this.player && this.player.pause();
    },
    toggleVideo() {
      this.player && this.player.toggle();
    },
    destroyVideo() {
      this.player && this.player.destroy();
    },
  },
};
</script>

<style lang="less" scoped>
.player {
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
    box-sizing: border-box;

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
    box-sizing: border-box;
  }
}
</style>
