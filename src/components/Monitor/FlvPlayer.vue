<template>
  <div class="player" @click="$emit('click')">
    <header class="player-header">
      <span>{{ title }}</span>
      <span class="player-header__action">
        <a-icon type="picture" @click="handleScreenshot" />
        <a-icon type="close-circle" @click="handleCloseVideo" />
      </span>
    </header>
    <video :id="videoId" class="player-node" :controls="controls" :muted="muted"></video>
  </div>
</template>

<script>
import _ from 'lodash';
import flvjs from 'flv.js';

export default {
  name: 'FlvPlayer',
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
    autoplay: {
      type: Boolean,
      default: false,
    },
    controls: {
      type: Boolean,
      default: true,
    },
    muted: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    config: {
      type: Object,
      default() {
        return {};
      },
    },
    title: {
      type: String,
      default: 'FlvPlayer',
    },
    url: {
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
      baseOptions: {
        type: 'flv',
        cors: true,
        isLive: true,
        hasAudio: true,
        hasVideo: true,
        withCredentials: false,
      },
      baseConfig: {
        accurateSeek: true,
        enableWorker: true,
        enableStashBuffer: false,
        stashInitialSize: 128,
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
      //if (!this.did || !this.cno) return;
      //let url = this.stream ? `http://${location.hostname}:10080/${this.did}/${this.stream}.flv` : `http://${location.hostname}:10080/${this.did}/${this.cno}.flv` ;
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
    onVideoPlay() {
      console.log('play');
      this.$emit('play');
    },
    onVideoPause() {
      console.log('pause');
      this.$emit('pause');
    },
    onVideoEnded() {
      console.log('ended');
      this.$emit('ended');
    },
    onVideoSeeked() {
      console.log('seeked');
      this.$emit('seeked');
    },
    onVideoSeeking() {
      console.log('seeking', this.video.currentTime);
      this.$emit('seeking', this.video.currentTime);
    },
    onVideoDurationChange() {
      console.log('durationchange', this.video.duration);
    },
    onPlayerError() {
      console.log('player error');
      this.initVideo(this.url);
    },
    initVideo(url) {
      if (flvjs.isSupported()) {
        // 切换流之前先切断流
        this.destroyVideo();
        this.video = document.getElementById(this.videoId);
        this.video.addEventListener('play', this.onVideoPlay);
        this.video.addEventListener('pause', this.onVideoPause);
        this.video.addEventListener('ended', this.onVideoEnded);
        this.video.addEventListener('seeked', this.onVideoSeeked);
        this.video.addEventListener('seeking', this.onVideoSeeking);
        this.video.addEventListener('durationchange', this.onVideoDurationChange);

        this.player = flvjs.createPlayer(
          { url, ...this.baseOptions, ...this.options },
          { ...this.baseConfig, ...this.config }
        );
        // this.player.on(flvjs.Events.ERROR, this.onPlayerError);
        this.player.attachMediaElement(this.video);
        this.player.load();
        this.autoplay && this.player.play();
      } else {
        this.$message.warn('当前浏览器暂不支持FLV视频流，建议使用谷歌/火狐浏览器！');
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
        this.video.removeEventListener('play', this.onVideoPlay);
        this.video.removeEventListener('pause', this.onVideoPause);
        this.video.removeEventListener('ended', this.onVideoEnded);
        this.video.removeEventListener('seeked', this.onVideoSeeked);
        this.video.removeEventListener('seeking', this.onVideoSeeking);
        this.video.removeEventListener('durationchange', this.onVideoDurationChange);
      }
      if (this.player) {
        // this.player.off(flvjs.Events.ERROR, this.onPlayerError);
        this.player.pause();
        this.player.unload();
        this.player.detachMediaElement();
        this.player.destroy();
        this.player = null;
      }
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
