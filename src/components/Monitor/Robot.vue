<template>
  <div class="robot" @click="$emit('click')">
    <header class="robot-header">
      <span>{{ title }}</span>
      <span class="robot-header__action">
        <a-icon type="close-circle" @click="handleCloseVideo" />
      </span>
    </header>
    <div class="robot-wrapper">
      <div class="robot-player" :class="{ left: current !== 'light' }">
        <span class="marker light">可见光</span>
        <div :id="lightId" class="player" ref="lightPlayer" @click="current = 'light'"></div>
      </div>
      <div class="robot-player" :class="{ right: current !== 'infrared' }">
        <span class="marker infrared">红外</span>
        <div
          :id="infraredId"
          class="player"
          ref="infraredPlayer"
          @click="current = 'infrared'"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import flvjs from 'flv.js';
import { sprintf } from '@/utils';

export default {
  name: 'RobotMonitor',
  computed: {
    title() {
      return this.detector ? this.detector.name : '机器人';
    },
    lightId() {
      return _.uniqueId('player_');
    },
    infraredId() {
      return _.uniqueId('player_');
    },
  },
  watch: {
    lightUrl(url) {
      this.initVideo(url, 'light');
    },
    infraredUrl(url) {
      this.initVideo(url, 'infrared');
    },
  },
  props: {
    autoplay: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    lightUrl: {
      required: true,
      type: String,
      default: '',
    },
    infraredUrl: {
      required: true,
      type: String,
      default: '',
    },
    detector: {
      type: Object,
      default() {
        return null;
      },
    },
  },
  data() {
    return {
      current: 'light',
      lightPlayer: null,
      infraredPlayer: null,
      baseOptions: {
        Height: true,
        BigPlay: true,
        HideKbs: false,
        openAudio: true,
        decodeType: 'auto',
        cfKbs: (e) => {},
      },
    };
  },
  mounted() {
    if (this.lightUrl) {
      this.initVideo(this.lightUrl, 'light');
    }
    if (this.infraredUrl) {
      this.initVideo(this.infraredUrl, 'infrared');
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
    loadVideo(url, type) {
      const streamId = type === 'light' ? 1 : 2;
      return new Promise((resolve, reject) => {
        this.$api
          .getMediaApi('addStreamProxy', {
            secret: '035c73f7-bb6b-4889-a715-d9eb2d1925cc',
            url: url.replace('&', '0%26'),
            app: 8888,
            stream: streamId,
            enable_rtsp: 1,
            enable_rtmp: 1,
            vhost: sprintf('%d.%d.%d.%d', 172, 18, 0, 90),
          })
          .then(() => {
            resolve(`wss://${location.hostname}:8443/media/8888/${streamId}.flv`);
          })
          .catch((err) => {
            resolve('');
            reject(err);
          });
      });
    },
    async initVideo(url, type) {
      //const videoUrl = await this.loadVideo(url, type);
      const videoUrl = `wss://${location.hostname}:8443/media/${url}.flv`;
      console.log(videoUrl);

      if (flvjs.isSupported()) {
        // 切换流之前先切断流
        this.destroyVideo(type);
        if (type === 'light') {
          this.lightPlayer = new WasmPlayer(videoUrl, this.lightId, this.callback, {
            ...this.baseOptions,
            ...this.options,
          });
          this.lightPlayer.play(videoUrl, this.autoplay ? 1 : 0, this.options.currentTime || 0);
        } else {
          this.infraredPlayer = new WasmPlayer(videoUrl, this.infraredId, this.callback, {
            ...this.baseOptions,
            ...this.options,
          });
          this.infraredPlayer.play(videoUrl, this.autoplay ? 1 : 0, this.options.currentTime || 0);
        }
      } else {
        this.$message.warn('当前浏览器暂不支持FLV视频流，建议使用谷歌/火狐浏览器！');
      }
    },
    callback() {
      // console.log(e);
    },
    playVideo(type) {
      if (type === 'light') {
        this.lightPlayer && this.lightPlayer.play();
      } else if (type === 'infrared') {
        this.infraredPlayer && this.infraredPlayer.play();
      } else {
        this.lightPlayer && this.lightPlayer.play();
        this.infraredPlayer && this.infraredPlayer.play();
      }
    },
    pauseVideo(type) {
      if (type === 'light') {
        this.lightPlayer && this.lightPlayer.pause();
      } else if (type === 'infrared') {
        this.infraredPlayer && this.infraredPlayer.pause();
      } else {
        this.lightPlayer && this.lightPlayer.pause();
        this.infraredPlayer && this.infraredPlayer.pause();
      }
    },
    destroyVideo(type) {
      if (type === 'light') {
        this.destroyLightPlayer();
      } else if (type === 'infrared') {
        this.destroyInfraredPlayer();
      } else {
        this.destroyLightPlayer();
        this.destroyInfraredPlayer();
      }
    },
    destroyLightPlayer() {
      if (this.lightPlayer) {
        this.lightPlayer.destroy();
        this.lightPlayer = null;
      }
    },
    destroyInfraredPlayer() {
      if (this.infraredPlayer) {
        this.infraredPlayer.destroy();
        this.infraredPlayer = null;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.robot {
  // display: flex;
  // align-items: center;
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
  &.mode-1 {
    width: 100%;
    height: 100%;
  }
  &.mode-4 {
    width: 50%;
    height: 50%;
  }
  &.mode-9 {
    width: 33.33%;
    height: 33.33%;
  }
  &.mode-16 {
    width: 25%;
    height: 25%;
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
  &-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }
  &-player {
    z-index: 90;
    width: 100%;
    height: 100%;
    transition: all 0.5s;

    &.left {
      z-index: 100;
      position: absolute;
      top: 40%;
      left: 1px;
      width: 20%;
      height: 20%;
      outline: @theme-color1 solid 1px;

      &:hover {
        cursor: pointer;
        outline-color: @theme-color3;
      }
    }
    &.right {
      z-index: 100;
      position: absolute;
      top: 40%;
      right: 1px;
      width: 20%;
      height: 20%;
      outline: @theme-color1 solid 1px;

      &:hover {
        cursor: pointer;
        outline-color: @theme-color3;
      }
    }
    .marker {
      z-index: 95;
      position: absolute;
      top: 10px;
      right: 10px;
      color: #fff;
      font-size: 14px;
      font-weight: bold;

      &.light {
        color: #52c41a;
      }
      &.infrared {
        color: #f5222d;
      }
    }
    .player {
      display: block;
      width: 100%;
      height: 100%;
      outline: none;
      object-fit: fill;
    }
  }
}
</style>
