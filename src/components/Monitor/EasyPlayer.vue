<template>
  <div class="eplayer" ref="player" @click="$emit('click')">
    <header class="eplayer-header">
      <span>{{ title }}</span>
      <span class="eplayer-header__action">
        <a-icon v-if="screenshot" type="picture" @click="handleScreenshot" />
        <a-icon type="close-circle" @click="handleCloseVideo" />
      </span>
    </header>
    <div :id="videoId" class="eplayer-node"></div>
    <a-slider
      v-if="duration > 0"
      class="eplayer-slider"
      v-model="progress"
      :max="duration"
      :tip-formatter="(current) => Math.round((current / duration) * 100) + '%'"
      :get-tooltip-popup-container="(node) => node.parentNode"
      @change="onSliderChange"
    />
  </div>
</template>

<script>
import _ from 'lodash';
import flvjs from 'flv.js';

export default {
  name: 'EasyPlayer',
  computed: {
    videoId() {
      return _.uniqueId('player_');
    },
  },
  watch: {
    url(url) {
      this.initVideo(url);
    },
  },
  props: {
    screenshot: {
      type: Boolean,
      default: false,
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      default: 0,
    },
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    title: {
      type: String,
      default: '视频抓图',
    },
    url: {
      require: true,
      type: String,
      default:
        'https://sf1-hscdn-tos.pstatp.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-480p.flv',
    },
    did: {
      type: [Number, String],
      default: '100110000000000000',
    },
    cno: {
      type: [Number, String],
      default: '100110000003010001',
    },
    stream: {
      type: [Number, String],
      default: '',
    },
  },
  data() {
    return {
      video: null,
      player: null,
      interval: null,
      progress: 0,
      baseOptions: {
        Height: true,
        BigPlay: true,
        HideKbs: true,
        openAudio: true,
        decodeType: 'auto',
        cfKbs: (e) => {
          console.log(e);
        },
      },
    };
  },
  mounted() {
    if (this.url) {
      this.initVideo(this.url);
    }
  },
  beforeDestroy() {
    this.destroyVideo();
  },
  methods: {
    handleScreenshot() {
      if (!this.did || !this.cno) return;
      this.$api;
      this.$api
        .getMediaApi('getSnap', {
          url: `http://${location.hostname}:10080/${this.did}/${this.stream}.flv`,
          timeout_sec: 10,
          expire_sec: 5,
        })
        .then((res) => {
          //if (!res) return;
          this.$emit('screenshot', {
            image: `https://${location.hostname}:8443/media/index/api/getSnap?url=http%3A%2F%2F${
              location.hostname
            }%3A10080%2F${this.did}%2F${
              this.stream
            }.flv&timeout_sec=10&expire_sec=5&time=${this.$moment()}`,
            title: this.title,
          });
        })
        .finally(() => {
          //this.$emit('screenshot', { image: '', title: this.title });
        });
    },
    handleCloseVideo() {
      this.$emit('close');
      this.destroyVideo();
    },
    onDurationChange() {
      console.log('durationchange', this.video.duration);
    },
    onSliderChange(val) {
      console.log(val);
      if (!this.interval) {
        this.interval = setInterval(() => {
          this.progress++;
          if (this.progress === this.duration) {
            clearInterval(this.interval);
            this.interval = null;
          }
        }, 1000);
      }
      this.$emit('seeking', val);
    },
    initSlider() {
      if (this.duration > 0 && !this.interval) {
        this.interval = setInterval(() => {
          this.progress++;
          if (this.progress === this.duration) {
            clearInterval(this.interval);
            this.interval = null;
          }
        }, 1000);
      }
    },
    initVideo(url) {
      if (flvjs.isSupported()) {
        // 切换流之前先切断流
        this.destroyVideo();
        this.player = new WasmPlayer(url, this.videoId, this.callback, {
          ...this.baseOptions,
          ...this.options,
        });
        this.player.play(url, this.autoplay ? 1 : 0, this.options.currentTime || 0);
        // 初始化播放进度条
        this.initSlider();
      } else {
        this.$message.warn('当前浏览器暂不支持FLV视频流，建议使用谷歌/火狐浏览器！');
      }
    },
    callback(e) {
      this.video = this.$refs.player.getElementsByTagName('video')[0];
      if (this.video) {
        console.log(e, this.video.duration);
        this.video.addEventListener('durationchange', this.onDurationChange);
      }
    },
    playVideo() {
      this.player && this.player.play();
    },
    pauseVideo() {
      this.player && this.player.pause();
    },
    destroyVideo() {
      if (this.video) {
        this.video.removeEventListener('durationchange', this.onDurationChange);
      }
      if (this.player) {
        this.player.destroy();
        this.player = null;
      }
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.eplayer {
  position: relative;
  width: 100%;
  height: 100%;
  padding-top: 3vh;
  transition: all 0.5s;
  background-color: #000;
  border: @border-dark;

  &:hover {
    .eplayer-slider {
      visibility: visible;
    }
  }
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
  &-slider {
    z-index: 100;
    position: absolute;
    left: 150px;
    right: 150px;
    bottom: 0;
    margin: 8px 0;
    visibility: hidden;
    transition: visibility 5s;
  }
}
</style>
