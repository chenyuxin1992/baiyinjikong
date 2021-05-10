<template>
  <div class="camera" @click="$emit('click')">
    <header class="camera-header">
      <span>{{ title }}</span>
      <span class="camera-header__action">
        <a-icon
          v-if="record"
          type="video-camera"
          :class="{ record: recording }"
          :theme="recording ? 'filled' : 'outlined'"
          @click="handleRecordVideo"
        />
        <a-icon v-if="screenshot" type="picture" @click="handleScreenshot" />
        <a-icon type="close-circle" @click="handleCloseVideo" />
      </span>
    </header>
    <div
      :id="videoId"
      :style="{ cursor: cursor }"
      class="camera-player"
      ref="player"
      @wheel="onMouseWheel"
      @mouseup="onMouseUp"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
    ></div>
  </div>
</template>

<script>
import _ from 'lodash';
import flvjs from 'flv.js';
import { PtzCMD } from '@/enum';

export default {
  name: 'CameraMonitor',
  computed: {
    title() {
      return this.detector ? this.detector.name : '摄像机';
    },
    videoId() {
      return _.uniqueId('player_');
    },
    detectorId() {
      return this.detector && this.detector.id;
    },
  },
  watch: {
    url(url) {
      this.initVideo(url);
    },
    polling(bool) {
      if (bool) {
        this.initPresetPolling();
      } else {
        if (this.presetInterval) {
          clearInterval(this.presetInterval);
          this.presetInterval = null;
        }
      }
    },
  },
  props: {
    record: {
      type: Boolean,
      default: false,
    },
    screenshot: {
      type: Boolean,
      default: false,
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    gesture: {
      type: Boolean,
      default: true,
    },
    polling: {
      type: Boolean,
      default: false,
    },
    interval: {
      type: Number,
      dafault: 10000,
    },
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    url: {
      required: true,
      type: String,
      default: '',
    },
    did: {
      type: [Number, String],
      default: '100110000000000000',
    },
    cno: {
      type: [Number, String],
      default: '100110000003010001',
    },
    preset: {
      type: Object,
      default() {
        return null;
      },
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
      player: null,
      moving: false,
      rotate: false,
      cursor: 'auto',
      command: 0,
      offset: 20,
      offsetX: 0,
      offsetY: 0,
      recording: false,
      presetList: [],
      presetIndex: 0,
      presetInterval: null,
      baseOptions: {
        Height: true,
        BigPlay: true,
        HideKbs: false,
        openAudio: true,
        decodeType: 'auto',
        cfKbs: () => {},
      },
    };
  },
  created() {
    this.getPresetList();
  },
  mounted() {
    if (this.preset) {
      this.setPtzPreset(this.preset);
    }
    if (this.url) {
      this.initVideo(this.url);
    }
  },
  beforeDestroy() {
    this.destroyVideo();
  },
  methods: {
    handleScreenshot() {
      this.$api
        .getMediaApi('getSnap', {
          // devidx: this.did,
          // channelno: this.cno,
          url: `http://${location.hostname}:10080/${this.did}/${this.cno}.flv`,
          timeout_sec: 10,
          expire_sec: 5,
        })
        .then((res) => {
          if (!res) return;
          this.$emit('screenshot', {
            image: `https://${location.hostname}:8443/media/index/api/getSnap?url=http%3A%2F%2F${
              location.hostname
            }%3A10080%2F${this.did}%2F${
              this.cno
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
    handleRecordVideo() {
      if (!this.recording) {
        this.$api
          .getMediaApi('startRecord', { devidx: this.did, channelno: this.cno })
          .then(() => {
            this.$message.success('监控视频录制已开始！');
            this.recording = true;
          })
          .catch(() => {
            this.$message.error('监控视频录制开始失败！');
          });
      } else {
        this.$api
          .getMediaApi('stopRecord', { devidx: this.did, channelno: this.cno })
          .then(() => {
            this.$message.success('监控视频录制已结束！');
            this.recording = false;
          })
          .catch(() => {
            this.$message.error('监控视频录制结束失败！');
          });
        const date = this.$moment().format('YYYY-MM-DD');
        this.$api
          .getMediaApi('getMp4RecordFile', {
            period: date,
            devidx: this.did,
            channelno: this.cno,
          })
          .then((res) => {
            if (!res) return;
            const videos = res.paths.map(
              (item) =>
                `https://${location.hostname}:8443/media/record/${this.did}/${this.cno}/${date}/${item}`
            );
            this.$emit('recording', { videos, title: this.title });
          });
        this.$emit('recording', { videos: null, title: this.title });
      }
    },
    onMouseUp() {
      if (!this.gesture || !this.moving) return;
      this.cursor = 'auto';
      this.moving = false;
      if (this.rotate) {
        // 发送停止指令
        this.sendPtzCmd(this.command - 1);
      }
    },
    onMouseDown(e) {
      if (!this.gesture) return;
      const { offsetX, offsetY } = e;
      this.offsetX = offsetX;
      this.offsetY = offsetY;
      this.moving = true;
    },
    onMouseMove: _.throttle(async function (e) {
      if (!this.gesture || !this.moving) return;
      const { offsetX, offsetY } = e;
      const moveX = offsetX - this.offsetX;
      const moveY = offsetY - this.offsetY;
      console.log('mousemove: ', moveX, moveY);
      let command = 0;
      let cursor = 'auto';
      if (moveX < -this.offset && moveY < -this.offset) {
        cursor = 'nw-resize';
        command = PtzCMD.UP_LEFT_START;
      } else if (moveX > this.offset && moveY < -this.offset) {
        cursor = 'ne-resize';
        command = PtzCMD.UP_RIGHT_START;
      } else if (moveX < -this.offset && moveY > this.offset) {
        cursor = 'sw-resize';
        command = PtzCMD.DOWN_LEFT_START;
      } else if (moveX > this.offset && moveY > this.offset) {
        cursor = 'se-resize';
        command = PtzCMD.DOWN_RIGHT_START;
      } else if (moveY < -this.offset) {
        cursor = 'n-resize';
        command = PtzCMD.TILT_UP_START;
      } else if (moveY > this.offset) {
        cursor = 's-resize';
        command = PtzCMD.TILT_DOWN_START;
      } else if (moveX < -this.offset) {
        cursor = 'w-resize';
        command = PtzCMD.PAN_LEFT_START;
      } else if (moveX > this.offset) {
        cursor = 'e-resize';
        command = PtzCMD.PAN_RIGHT_START;
      } else {
        return false;
      }
      this.offsetX = offsetX;
      this.offsetY = offsetY;
      if (this.cursor !== cursor) {
        this.cursor = cursor;
      }
      if (this.command !== command) {
        // 判断云台当前状态
        if (this.rotate) {
          await this.sendPtzCmd(this.command - 1);
        }
        this.sendPtzCmd(command);
        this.command = command;
      }
    }, 1000),
    onMouseLeave() {
      if (!this.gesture || !this.moving) return;
      this.cursor = 'auto';
      this.moving = false;
      if (this.rotate) {
        // 发送停止指令
        this.sendPtzCmd(this.command - 1);
      }
    },
    async onMouseWheel(e) {
      if (!this.gesture) return;
      const { deltaY, wheelDelta } = e;
      let command = 0;
      let cursor = 'auto';
      if (wheelDelta > 0) {
        cursor = 'zoom-out';
        command = PtzCMD.ZOOM_OUT_START;
        console.log('zoomout: ', deltaY);
      } else {
        cursor = 'zoom-in';
        command = PtzCMD.ZOOM_IN_START;
        console.log('zoomin: ', deltaY);
      }
      if (this.cursor !== cursor) {
        this.cursor = cursor;
      }
      if (this.command !== command) {
        // 判断云台当前状态
        if (this.rotate) {
          await this.sendPtzCmd(this.command - 1);
        }
        this.sendPtzCmd(command);
        this.command = command;
        // 发送缩放指令后定时取消
        this.stopPtzZoom(command - 1);
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
      } else {
        this.$message.warn('当前浏览器暂不支持FLV视频流，建议使用谷歌/火狐浏览器！');
      }
    },
    callback() {
      // console.log(e);
    },
    playVideo() {
      this.player && this.player.play();
    },
    pauseVideo() {
      this.player && this.player.pause();
    },
    destroyVideo() {
      if (this.player) {
        // this.player.pause();
        // this.player.unload();
        // this.player.detachMediaElement();
        this.player.destroy();
        this.player = null;
      }
    },
    // 自动停止云台缩放
    stopPtzZoom: _.debounce(function (cmd) {
      this.rotate && this.sendPtzCmd(cmd);
    }, 1000),
    sendPtzCmd(cmd, para1 = 5, para2 = 5) {
      if (!this.did || !this.cno) return;
      this.$api
        .getMediaApi('ptzControl', {
          idx: this.did,
          no: this.cno,
          command: cmd,
          para1: para1,
          para2: para2,
        })
        .then((res) => {
          if (res.success) {
            // 设置云台状态
            if ((cmd & 1) === 0) {
              this.rotate = true;
            } else {
              this.command = 0;
              this.rotate = false;
            }
          }
        });
    },
    // setPtzPreset(preset, speed = 5) {
    //   this.$api
    //     .getMediaApi('ptzControl', {
    //       idx: this.did,
    //       no: this.cno,
    //       command: PtzCMD.GET_PRESET,
    //       para1: preset.preset_no,
    //       para2: speed,
    //     })
    //     .then((res) => {
    //       if (!res) return;
    //       console.log(res);
    //     });
    // },
    setPtzPreset(preset) {
      this.$api
        .getMediaApi('setptzpos', {
          idx: this.did,
          no: this.cno,
          ptzh: preset.ptz_h,
          ptzv: preset.ptz_v,
          ptzz: preset.ipc_z,
        })
        .then((res) => {
          // if (res.success) {
          //   // 设置云台状态
          //   if ((cmd & 1) === 0) {
          //     this.rotate = true;
          //   } else {
          //     this.command = 0;
          //     this.rotate = false;
          //   }
          // }
        });           
    },  
    initPresetPolling() {
      if (!this.presetInterval && this.presetList.length > 1) {
        this.presetInterval = setInterval(() => {
          const preset = this.presetList[this.presetIndex];
          this.setPtzPreset(preset);
          if (this.presetIndex === this.presetList.length - 1) {
            this.presetIndex = 0;
          } else {
            this.presetIndex++;
          }
        }, this.interval);
      }
    },
    getPresetList() {
      if (!this.detectorId) return;
      this.$api.getBaseApi('preset', { detector: this.detectorId }).then((res) => {
        if (!res) return;
        this.presetList = res.results;
        if (this.polling) {
          this.initPresetPolling();
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
.camera {
  z-index: 90;
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
      &-video-camera.record {
        color: @theme-color2;
      }
    }
  }
  &-player {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
