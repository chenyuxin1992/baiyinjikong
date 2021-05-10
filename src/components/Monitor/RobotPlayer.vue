<template>
  <div class="robot" :class="{ control: control }">
    <main class="robot-main">
      <div class="robot-player" :class="{ left: current !== 'light' }">
        <span class="marker">可见光</span>
        <!-- <video
          class="player"
          :id="lightId"
          :controls="current === 'light'"
          muted
          @click="current = 'light'"
        ></video> -->
        <div :id="lightId" class="player" ref="lightPlayer" @click="current = 'light'"></div>
      </div>
      <div class="robot-player" :class="{ right: current !== 'infrared' }">
        <span class="marker">红外</span>
        <!-- <video
          class="player"
          :id="infraredId"
          :controls="current === 'infrared'"
          muted
          @click="current = 'infrared'"
        ></video> -->
        <div
          :id="infraredId"
          class="player"
          ref="infraredPlayer"
          @click="current = 'infrared'"
        ></div>
      </div>
    </main>
    <aside class="robot-aside">
      <div class="robot-title">机器人本体</div>
      <div class="robot-control">
        <div class="robot-control__item col-3">
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.SELF, robotSelf.REMOTE_RESET)"
            >远方复位
          </a-button>
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.SELF, robotSelf.SELF_CHECK)"
            >系统自检
          </a-button>
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.SELF, robotSelf.RETURN_BACK)"
            >一键返航
          </a-button>
        </div>
        <div class="robot-control__item col-3">
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.SELF, robotSelf.MANUAL_CHARGE)"
            >手动充电
          </a-button>
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.SELF, robotSelf.GAIN_CONTROL)"
            >获得控制权
          </a-button>
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.SELF, robotSelf.RELEASE_CONTROL)"
            >释放控制权
          </a-button>
        </div>
        <div class="robot-control__item col-1">
          <label>切换控制模式：</label>
          <a-select
            v-model="robotModel.robotMode"
            size="small"
            style="width: 150px"
            :options="robotModes"
            @select="onRobotModeSelect"
          ></a-select>
        </div>
      </div>
      <div class="robot-title">机器人车体</div>
      <div class="robot-control">
        <div class="robot-control__item col-1">
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.BODY, robotBody.FORWARD, robotModel.forwardSpeed)"
            >前进
          </a-button>
          <a-input-number
            v-model="robotModel.forwardSpeed"
            :max="1.2"
            :min="0.1"
            :step="0.1"
            size="small"
            placeholder="设置前进速度"
          />
          <span>米/秒</span>
        </div>
        <div class="robot-control__item col-1">
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.BODY, robotBody.BACKWARD, robotModel.backwardSpeed)"
            >后退
          </a-button>
          <a-input-number
            v-model="robotModel.backwardSpeed"
            :max="1.2"
            :min="0.1"
            :step="0.1"
            size="small"
            placeholder="设置后退速度"
          />
          <span>米/秒</span>
        </div>
        <div class="robot-control__item col-1">
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.BODY, robotBody.TURN_LEFT, robotModel.turnLeftSpeed)"
            >左转
          </a-button>
          <a-input-number
            v-model="robotModel.turnLeftSpeed"
            :max="1"
            :min="0.1"
            :step="0.1"
            size="small"
            placeholder="设置左转速度"
          />
          <span>米/秒</span>
        </div>
        <div class="robot-control__item col-1">
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.BODY, robotBody.TURN_RIGHT, robotModel.turnRightSpeed)"
            >右转
          </a-button>
          <a-input-number
            v-model="robotModel.turnRightSpeed"
            :max="1"
            :min="0.1"
            :step="0.1"
            size="small"
            placeholder="设置右转速度"
          />
          <span>米/秒</span>
        </div>
        <div class="robot-control__item col-3">
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.BODY, robotBody.TURN_AROUND, 1, 1)"
            >左转弯
          </a-button>
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.BODY, robotBody.TURN_AROUND, 1, 2)"
            >右转弯
          </a-button>
          <a-button size="small" type="primary" @click="sendRobotCmd(robotCMD.BODY, robotBody.STOP)"
            >停止
          </a-button>
        </div>
      </div>
      <div class="robot-title">机器人云台</div>
      <div class="robot-control">
        <div class="robot-control__item col-2">
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.PTZ, robotPtz.PITCH_UP)"
            >上仰
          </a-button>
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.PTZ, robotPtz.PITCH_DOWN)"
            >下俯
          </a-button>
        </div>
        <div class="robot-control__item col-2">
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.PTZ, robotPtz.TURN_LEFT)"
            >左转
          </a-button>
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.PTZ, robotPtz.TURN_RIGHT)"
            >右转
          </a-button>
        </div>
        <div class="robot-control__item col-2">
          <a-button size="small" type="primary" @click="sendRobotCmd(robotCMD.PTZ, robotPtz.GO_UP)"
            >上升
          </a-button>
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.PTZ, robotPtz.GO_DOWN)"
            >下降
          </a-button>
        </div>
        <div class="robot-control__item col-2">
          <a-button size="small" type="primary" @click="sendRobotCmd(robotCMD.PTZ, robotPtz.STOP)"
            >停止
          </a-button>
          <a-button size="small" type="primary" @click="sendRobotCmd(robotCMD.PTZ, robotPtz.RESET)"
            >复位
          </a-button>
        </div>
        <div class="robot-control__item col-1">
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.PTZ, robotPtz.PRESET, robotModel.presetNumber)"
            >预置位
          </a-button>
          <a-input-number
            v-model="robotModel.presetNumber"
            :max="255"
            :min="0"
            size="small"
            placeholder="设置预置位"
          />
          <span>0-255</span>
        </div>
      </div>
      <div class="robot-title">机器人辅助</div>
      <div class="robot-control">
        <div class="robot-control__item">
          <div class="robot-control__col">
            <label>红外电源：</label>
            <a-switch
              v-model="robotModel.power"
              checked-children="打开"
              un-checked-children="关闭"
              @change="onRobotSwitchChange($event, robotAssist.POWER)"
            />
          </div>
          <div class="robot-control__col">
            <label>雨刷：</label>
            <a-switch
              v-model="robotModel.wiper"
              checked-children="打开"
              un-checked-children="关闭"
              @change="onRobotSwitchChange($event, robotAssist.WIPER)"
            />
          </div>
        </div>
        <div class="robot-control__item">
          <div class="robot-control__col">
            <label>红外射灯：</label>
            <a-switch
              v-model="robotModel.spotlight"
              checked-children="打开"
              un-checked-children="关闭"
              @change="onRobotSwitchChange($event, robotAssist.SPOTLIGHT)"
            />
          </div>
          <div class="robot-control__col">
            <label>超声：</label>
            <a-switch
              v-model="robotModel.ultrasound"
              checked-children="打开"
              un-checked-children="关闭"
              @change="onRobotSwitchChange($event, robotAssist.ULTRASOUND)"
            />
          </div>
        </div>
      </div>
      <div class="robot-title">机器人可见光</div>
      <div class="robot-control">
        <div class="robot-control__item col-3">
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.LENS_NEAR)"
            >镜头拉近
          </a-button>
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.LENS_FAR)"
            >镜头拉远
          </a-button>
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.LENS_STOP)"
            >镜头静止
          </a-button>
        </div>
        <div class="robot-control__item col-3">
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.FOCAL_INCREASE)"
            >焦距增加
          </a-button>
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.FOCAL_REDUCE)"
            >焦距减少
          </a-button>
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.AUTO_FOCUS)"
            >自动聚焦
          </a-button>
        </div>
        <div class="robot-control__item col-2">
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.SNAPSHOT)"
            >抓图
          </a-button>
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.REBOOT)"
            >重启
          </a-button>
        </div>
        <div class="robot-control__item col-1">
          <a-button
            size="small"
            type="primary"
            @click="
              sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.SET_RATIO, robotModel.ratioValue)
            "
            >倍率值
          </a-button>
          <a-input-number
            v-model="robotModel.ratioValue"
            :max="30"
            :min="1"
            :step="1"
            size="small"
            placeholder="设置倍率值"
          />
          <span>1-30倍</span>
        </div>
        <div class="robot-control__item col-1">
          <a-button
            size="small"
            type="primary"
            @click="
              sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.SET_FOCUS, robotModel.focusValue)
            "
            >聚焦值
          </a-button>
          <a-input-number
            v-model="robotModel.focusValue"
            :max="100"
            :min="0"
            :step="1"
            size="small"
            placeholder="设置聚焦值"
          />
          <span>整数</span>
        </div>
        <!-- <div class="robot-control__item col-2">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.START_RECORD)"
                >启动录像
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.STOP_RECORD)"
                >停止录像
              </a-button>
            </div> -->
      </div>
      <div class="robot-title">机器人红外</div>
      <div class="robot-control">
        <div class="robot-control__item col-3">
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.INFRARED_RAY, robotIR.AUTO_FOCUS)"
            >自动聚焦
          </a-button>
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.INFRARED_RAY, robotIR.SNAPSHOT)"
            >抓图
          </a-button>
          <a-button
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.INFRARED_RAY, robotIR.REBOOT)"
            >重启
          </a-button>
        </div>
        <div class="robot-control__item col-1">
          <a-button
            slot="addonBefore"
            size="small"
            type="primary"
            @click="sendRobotCmd(robotCMD.INFRARED_RAY, robotIR.SET_FOCAL, robotModel.focalLength)"
            >设定焦距
          </a-button>
          <a-input-number
            v-model="robotModel.focalLength"
            :max="100"
            :min="0"
            :step="1"
            size="small"
            placeholder="设置焦距值"
          />
          <span>整数</span>
        </div>
      </div>
      <div class="robot-title">设备信息</div>
      <ul class="robot-info">
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
import { sprintf } from '@/utils';
import {
  DETECTOR_MODE,
  ControlCMD,
  RobotCMD,
  RobotSelf,
  RobotBody,
  RobotPTZ,
  RobotAssist,
  RobotLight,
  RobotIR,
} from '@/enum';

export default {
  name: 'RobotPlayer',
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
    detectorId() {
      return this.detector && this.detector.id;
    },
    robotIR() {
      return RobotIR;
    },
    robotCMD() {
      return RobotCMD;
    },
    robotPtz() {
      return RobotPTZ;
    },
    robotSelf() {
      return RobotSelf;
    },
    robotBody() {
      return RobotBody;
    },
    robotLight() {
      return RobotLight;
    },
    robotAssist() {
      return RobotAssist;
    },
    robotModes() {
      return Object.entries(DETECTOR_MODE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
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
    control: {
      type: Boolean,
      default: true,
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
    lightUrl: {
      type: String,
      default: '',
    },
    infraredUrl: {
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
      userIdentify: false,
      current: 'light',
      lightPlayer: null,
      infraredPlayer: null,
      robotModel: {
        robotMode: 1,
        robotModePrev: 1,
        forwardSpeed: undefined,
        backwardSpeed: undefined,
        turnLeftSpeed: undefined,
        turnRightSpeed: undefined,
        presetNumber: undefined,
        power: false,
        wiper: false,
        spotlight: false,
        untrlsound: false,
        ratioValue: 1,
        focusValue: 1,
        focalLength: 1,
      },
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
    this.$bus.$off('cancelled');
    this.$bus.$off('identified');
  },
  methods: {
    onRobotModeSelect(val) {
      this.sendRobotCmd(RobotCMD.SELF, RobotSelf.SWITCH_MODE, val);
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
            reject(err);
          });
      });
    },
    async initVideo(url, type) {
      const videoUrl = await this.loadVideo(url, type);
      if (flvjs.isSupported()) {
        // 切换流之前先切断流
        this.destroyVideo(type);
        if (type === 'light') {
          this.lightPlayer = new WasmPlayer(videoUrl, this.lightId, this.callback, {
            ...this.baseOptions,
            ...this.options,
          });
          this.lightPlayer.play(url, this.autoplay ? 1 : 0, this.options.currentTime || 0);
          // const video = document.getElementById(this.lightId);
          // this.lightPlayer = flvjs.createPlayer(
          //   { url: videoUrl, ...this.flvOptions },
          //   { enableWorker: true, enableStashBuffer: false, stashInitialSize: 128 }
          // );
          // this.lightPlayer.attachMediaElement(video);
          // this.lightPlayer.load();
          // this.autoplay && this.lightPlayer.play();
        } else {
          this.infraredPlayer = new WasmPlayer(videoUrl, this.infraredId, this.callback, {
            ...this.baseOptions,
            ...this.options,
          });
          this.infraredPlayer.play(videoUrl, this.autoplay ? 1 : 0, this.options.currentTime || 0);
          // const video = document.getElementById(this.infraredId);
          // this.infraredPlayer = flvjs.createPlayer(
          //   { url: videoUrl, ...this.flvOptions },
          //   { enableWorker: true, enableStashBuffer: false, stashInitialSize: 128 }
          // );
          // this.infraredPlayer.attachMediaElement(video);
          // this.infraredPlayer.load();
          // this.autoplay && this.infraredPlayer.play();
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
        // this.lightPlayer.pause();
        // this.lightPlayer.unload();
        // this.lightPlayer.detachMediaElement();
        this.lightPlayer.destroy();
        this.lightPlayer = null;
      }
    },
    destroyInfraredPlayer() {
      if (this.infraredPlayer) {
        // this.infraredPlayer.pause();
        // this.infraredPlayer.unload();
        // this.infraredPlayer.detachMediaElement();
        this.infraredPlayer.destroy();
        this.infraredPlayer = null;
      }
    },
    sendRobotCmd(type, cmd, val, dir) {
      if (!this.detectorId) return;
      if (
        (type === RobotCMD.SELF &&
          (cmd === RobotSelf.REMOTE_RESET ||
            cmd === RobotSelf.RETURN_BACK ||
            cmd === RobotSelf.SWITCH_MODE ||
            cmd === RobotSelf.GAIN_CONTROL)) ||
        (type === RobotCMD.PTZ && cmd === RobotPTZ.RESET) ||
        (type === RobotCMD.INFRARED_RAY && cmd === RobotIR.REBOOT)
      ) {
        this.$bus.$emit('identify');
        if (!this.userIdentify) {
          this.userIdentify = true;
          this.$bus.$on('cancelled', () => {
            if (cmd === RobotSelf.SWITCH_MODE) {
              this.robotModel.robotMode = this.robotModel.robotModePrev;
            }
          });
          this.$bus.$on('identified', () => {
            if (cmd === RobotSelf.SWITCH_MODE) {
              this.robotModel.robotModePrev = val;
            }
            this.$api
              .postControlApi({
                action: ControlCMD.REMOTE_CONTROL,
                detector_id: this.detectorId,
                type: type,
                value: val,
                command: cmd,
                direction: dir,
                syn: '机器人控制指令下发',
              })
              .then(() => {
                this.$message.success('机器人控制指令发送成功！');
              })
              .catch(() => {
                this.$message.error('机器人控制指令发送失败！');
              });
          });
        }
      } else {
        this.$api
          .postControlApi({
            action: ControlCMD.REMOTE_CONTROL,
            detector_id: this.detectorId,
            type: type,
            value: val,
            command: cmd,
            direction: dir,
            syn: '机器人控制指令下发',
          })
          .then(() => {
            this.$message.success('机器人控制指令发送成功！');
          })
          .catch(() => {
            this.$message.error('机器人控制指令发送失败！');
          });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.robot {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  transition: all 0.5s;
  background-color: #000;

  &.control {
    .robot-main {
      display: inline-block;
      width: 80%;
    }
    .robot-aside {
      display: inline-block;
    }
  }
  &-main {
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
      font-size: 16px;
    }
    .player {
      display: block;
      width: 100%;
      height: 100%;
      outline: none;
      object-fit: fill;
    }
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

    &__item {
      display: flex;
      align-items: center;
      justify-content: space-around;
      width: 100%;
      white-space: nowrap;

      + .robot-control__item {
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
    &__input {
      margin-bottom: 10px;

      /deep/ .ant-input {
        color: #fff;
        background-color: #000;
        border-color: @theme-color1;

        &-group-addon {
          padding: 0 5px;
          border: none;
          background-color: transparent;
        }
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
