<template>
  <div class="camera" :class="{ control: control }">
    <!-- <video
      :id="videoId"
      :style="{ cursor: cursor }"
      class="camera-player"
      ref="player"
      controls
      muted
      @wheel="onMouseWheel"
      @mouseup="onMouseUp"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
    ></video> -->
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
    <aside class="camera-aside">
      <div class="camera-title">摄像机控制</div>
      <div class="camera-control">
        <div class="camera-control__operate">
          <a-icon
            type="caret-up"
            :rotate="-45"
            @mousedown="sendPtzCmd(ptzCMD.UP_LEFT_START)"
            @mouseup="sendPtzCmd(ptzCMD.UP_LEFT_STOP)"
          />
          <a-icon
            type="caret-up"
            @mousedown="sendPtzCmd(ptzCMD.TILT_UP_START)"
            @mouseup="sendPtzCmd(ptzCMD.TILT_UP_STOP)"
          />
          <a-icon
            type="caret-up"
            :rotate="45"
            @mousedown="sendPtzCmd(ptzCMD.UP_RIGHT_START)"
            @mouseup="sendPtzCmd(ptzCMD.UP_RIGHT_STOP)"
          />
          <a-icon
            type="caret-left"
            @mousedown="sendPtzCmd(ptzCMD.PAN_LEFT_START)"
            @mouseup="sendPtzCmd(ptzCMD.PAN_LEFT_STOP)"
          />
          <span class="zoom">
            <a-icon
              type="plus"
              @mousedown="sendPtzCmd(ptzCMD.ZOOM_IN_START)"
              @mouseup="sendPtzCmd(ptzCMD.ZOOM_IN_STOP)"
            />
            <a-icon
              type="minus"
              @mousedown="sendPtzCmd(ptzCMD.ZOOM_OUT_START)"
              @mouseup="sendPtzCmd(ptzCMD.ZOOM_OUT_STOP)"
            />
          </span>
          <a-icon
            type="caret-right"
            @mousedown="sendPtzCmd(ptzCMD.PAN_RIGHT_START)"
            @mouseup="sendPtzCmd(ptzCMD.PAN_RIGHT_STOP)"
          />
          <a-icon
            type="caret-down"
            :rotate="45"
            @mousedown="sendPtzCmd(ptzCMD.DowmLeftStart)"
            @mouseup="sendPtzCmd(ptzCMD.DowmLeftStop)"
          />
          <a-icon
            type="caret-down"
            @mousedown="sendPtzCmd(ptzCMD.TILT_DOWN_START)"
            @mouseup="sendPtzCmd(ptzCMD.TILT_DOWN_STOP)"
          />
          <a-icon
            type="caret-down"
            :rotate="-45"
            @mousedown="sendPtzCmd(ptzCMD.DOWN_RIGHT_START)"
            @mouseup="sendPtzCmd(ptzCMD.DOWN_RIGHT_STOP)"
          />
        </div>
        <div class="camera-control__item col-1">
          <label>云台转速：</label>
          <a-slider
            v-model="cameraModel.ptzSpeed"
            class="slider"
            :min="1"
            :max="9"
            :included="false"
          />
        </div>
        <div class="camera-control__item col-3">
          <a-button
            size="small"
            type="primary"
            @mousedown="sendCameraCmd(ptzCMD.FOCUS_NEAR_START)"
            @mouseup="sendCameraCmd(ptzCMD.FOCUS_NEAR_STOP)"
            >近聚焦
          </a-button>
          <a-button
            size="small"
            type="primary"
            @mousedown="sendCameraCmd(ptzCMD.FOCUS_FAR_START)"
            @mouseup="sendCameraCmd(ptzCMD.FOCUS_FAR_STOP)"
            >远聚焦
          </a-button>
          <a-button size="small" type="primary" @click="sendCameraCmd(ptzCMD.LAMP_START)"
            >开灯
          </a-button>
        </div>
        <div class="camera-control__item col-3">
          <a-button
            size="small"
            type="primary"
            @mousedown="sendCameraCmd(ptzCMD.OPEN_IRIS_START)"
            @mouseup="sendCameraCmd(ptzCMD.OPEN_IRIS_STOP)"
            >开光圈
          </a-button>
          <a-button
            size="small"
            type="primary"
            @mousedown="sendCameraCmd(ptzCMD.CLOSE_IRIS_START)"
            @mouseup="sendCameraCmd(ptzCMD.CLOSE_IRIS_STOP)"
            >关光圈
          </a-button>
          <a-button size="small" type="primary" @click="sendCameraCmd(ptzCMD.LAMP_STOP)"
            >关灯
          </a-button>
        </div>
        <div class="camera-control__item col-2">
          <a-button size="small" type="primary" @click="sendCameraCmd(ptzCMD.SET_PRESET, 199)"
            >设置守望位
          </a-button>
          <a-button size="small" type="primary" @click="sendCameraCmd(ptzCMD.GET_PRESET, 199)"
            >调用守望位
          </a-button>
        </div>
        <div class="camera-control__item col-1">
          <a-button
            size="small"
            type="primary"
            @click="sendCameraCmd(ptzCMD.SET_PRESET, cameraModel.setPreset)"
            >设预置位
          </a-button>
          <a-input-number
            v-model="cameraModel.setPreset"
            :max="256"
            :min="1"
            size="small"
            placeholder="设置预置位"
          />
          <span>1-256</span>
        </div>
        <div class="camera-control__item col-1">
          <a-button
            size="small"
            type="primary"
            @click="sendCameraCmd(ptzCMD.GET_PRESET, cameraModel.getPreset)"
            >调预置位
          </a-button>
          <a-input-number
            v-model="cameraModel.getPreset"
            :max="256"
            :min="1"
            size="small"
            placeholder="调用预置位"
          />
          <span>1-256</span>
        </div>
      </div>
      <div class="camera-title">预置点位</div>
      <ul class="camera-preset">
        <template v-if="presetList.length > 0">
          <li v-for="item in presetList" :key="item.id" @dblclick="setPtzPreset(item)">
            {{ item.name }}
          </li>
        </template>
        <a-empty v-else class="sg-empty" description="暂无预置位" />
      </ul>
      <div class="camera-title">设备信息</div>
      <ul class="camera-info">
        <li>设备名称：{{ detector.name || '-' }}</li>
        <li>设备类型：{{ detector.manufacturer || '-' }}</li>
        <li>设备状态：{{ detector.status ? '在线' : '离线' }}</li>
      </ul>
    </aside>
  </div>
</template>

<script>
import _ from 'lodash';
import flvjs from 'flv.js';
import { PtzCMD } from '@/enum';

export default {
  name: 'CameraPlayer',
  computed: {
    title() {
      return this.detector ? this.detector.name : '摄像机';
    },
    ptzCMD() {
      return PtzCMD;
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
    autoplay: {
      type: Boolean,
      default: false,
    },
    control: {
      type: Boolean,
      default: true,
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
    type: {
      type: String,
      default: 'flv',
    },
    url: {
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
      presetList: [],
      presetIndex: 0,
      presetInterval: null,
      cameraModel: { ptzSpeed: 5, setPreset: 1, getPreset: 1 },
      baseOptions: {
        Height: true,
        BigPlay: true,
        HideKbs: false,
        openAudio: true,
        decodeType: 'auto',
        cfKbs: (e) => {
          console.log(e);
        },
      },
      flvOptions: {
        type: 'flv',
        cors: true,
        isLive: true,
        hasAudio: true,
        hasVideo: true,
        withCredentials: false,
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
        // const video = document.getElementById(this.videoId);
        // this.player = flvjs.createPlayer(
        //   { url, ...flvOptions },
        //   { enableWorker: true, enableStashBuffer: false, stashInitialSize: 128 }
        // );
        // this.player.attachMediaElement(video);
        // this.player.load();
        // this.autoplay && this.player.play();
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
    sendPtzCmd(cmd, para1, para2) {
      if (!this.did || !this.cno) return;
      this.$api
        .getMediaApi('ptzControl', {
          idx: this.did,
          no: this.cno,
          command: cmd,
          para1: para1 || this.cameraModel.ptzSpeed,
          para2: para2 || this.cameraModel.ptzSpeed,
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
    setPtzPreset(preset, speed = 5) {
      this.$api
        .getMediaApi('ptzControl', {
          idx: this.did,
          no: this.cno,
          command: PtzCMD.GET_PRESET,
          para1: preset.preset_no,
          para2: speed,
        })
        .then((res) => {
          if (!res) return;
          console.log(res);
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
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  transition: all 0.5s;
  background-color: #000;

  &.control {
    .camera-player {
      display: inline-block;
      width: 80%;
    }
    .camera-aside {
      display: inline-block;
    }
  }
  &-player {
    display: block;
    width: 100%;
    height: 100%;
    outline: none;
  }
  &-aside {
    display: none;
    width: 20%;
    height: 100%;
    color: #fff;
    overflow-y: auto;
    background-color: #333;
  }
  &-title {
    width: 100%;
    height: 3vh;
    padding-left: 10px;
    line-height: 3vh;
    font-size: 16px;
    font-weight: bold;
    background-color: #000;
  }
  &-control {
    width: 100%;
    padding: 10px;

    &__operate {
      display: flex;
      flex-wrap: wrap;
      align-content: space-between;
      justify-content: space-between;
      width: 200px;
      height: 200px;
      margin: 0 auto 1vh;

      .zoom {
        display: inline-flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .anticon {
        width: 60px;
        height: 60px;
        color: #fff;
        font-size: 40px;
        line-height: 60px;
        background-color: #aaa;
        cursor: pointer;

        &.anticon-plus,
        &.anticon-minus {
          height: 28px;
          font-size: 24px;
          line-height: 28px;
        }
        &:hover {
          background-color: #ccc;
        }
        &:active {
          color: @theme-color1;
          background-color: #eee;
        }
      }
    }
    &__item {
      display: flex;
      align-items: center;
      justify-content: space-around;
      width: 100%;
      white-space: nowrap;

      + .camera-control__item {
        margin-top: 10px;
      }
      .ant-btn {
        padding: 0;
      }
      &.col-1 {
        > span {
          width: 20%;
        }
        > .ant-btn {
          width: 25%;
        }
        /deep/ .ant-slider {
          width: 150px;
          margin: 0;

          &-rail {
            background-color: #ccc;
          }
        }
        /deep/ .ant-input-number {
          width: 50%;
          &-input {
            color: #fff;
            background-color: #000;
          }
        }
      }
      &.col-2 > .ant-btn {
        width: 40%;
      }
      &.col-3 > .ant-btn {
        width: 30%;
      }
      &.col-4 > .ant-btn {
        width: 24%;
      }
    }
    &__col {
      display: inline-flex;
      align-items: center;
    }
  }
  &-preset {
    width: 100%;
    height: 30vh;
    overflow-y: auto;

    li {
      width: 100%;
      height: 4vh;
      padding-left: 10px;
      line-height: 4vh;
      border-bottom: 1px solid #444;
      cursor: pointer;
      .text-ellipsis();

      &:hover {
        background-color: #222;
      }
    }
  }
  &-info {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 10px;

    li {
      margin-bottom: 10px;
    }
  }
}
</style>
