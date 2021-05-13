<template>
  <a-row class="sg-row" :gutter="10">
    <a-col class="sg-col" :span="4">
      <div class="sg-tree">
        <a-input-search
          v-model="keyword"
          class="sg-tree-search"
          placeholder="请输入关键字搜索"
          :max-length="20"
          enter-button
          @search="onTreeSearch"
        />
        <a-tree
          :tree-data="treeData"
          :load-data="loadTreeData"
          :checked-keys="checkedKeys"
          :expanded-keys="expandedKeys"
          :auto-expand-parent="expandParent"
          :filter-tree-node="filterTreeNode"
          :replace-fields="{ key: 'id', title: 'name' }"
          check-strictly
          checkable
          show-icon
          @check="onTreeCheck"
          @select="onTreeSelect"
          @expand="onTreeExpand"
        >
          <sg-icon slot="robot" name="robot" style="vertical-align: middle" />
          <sg-icon slot="camera" name="camera" style="vertical-align: middle" />
          <sg-icon slot="videorobot" name="videorobot" style="vertical-align: middle" />
        </a-tree>
      </div>
    </a-col>
    <a-col class="sg-col" :span="16" style="padding: 0">
      <div class="monitor">
        <sg-eplayer
          v-for="(item, index) in videoStreams"
          :key="item.sid"
          :ref="`player-${item.sid}`"
          :class="[{ multiple: videoStreams.length > 1 }, { selected: streamId === item.sid }]"
          v-bind="{
            did: deviceId,
            cno: channelNo,
            stream: item.sid,
            url: item.url,
            title: item.name,
            duration: item.dura,
            filesize: item.size,
            autoplay: true,
            screenshot: true,
          }"
          @close="onPlayerClosed(index)"
          @click="onPlayerSelected(index)"
          @seeking="onPlayerSeeking(item, $event)"
        />
      </div>
    </a-col>
    <a-col class="sg-col video" :span="4" style="padding: 0">
      <a-calendar
        class="video-date"
        v-model="dateSel"
        :fullscreen="false"
        :header-render="renderCalendar"
      />
      <div class="video-time">
        <a-time-picker v-model="timeStart" placeholder="开始时间" />
        <b>至</b>
        <a-time-picker v-model="timeEnd" placeholder="结束时间" />
      </div>
      <div class="video-stream">
        <a-popover title="视频录像类型" placement="top" overlay-class-name="sg-popover">
          <template #content>
            <a-checkbox-group
              class="video-stream__type"
              :options="streamTypes"
              @change="onVideoTypeChange"
            ></a-checkbox-group>
          </template>
          <a-button
            class="video-stream__load"
            type="primary"
            :disabled="!deviceId || !videoType"
            :loading="loadStream"
            block
            @click="getVideoStreamList"
            >加载回放视频流
          </a-button>
        </a-popover>
        <div class="video-stream__action">
          <a-button
            shape="circle"
            icon="step-backward"
            :disabled="!streamId"
            @click="handlePlayback('prev')"
          />
          <a-button
            shape="circle"
            icon="fast-backward"
            :disabled="!videoPlay"
            @click="handlePlayback('slower')"
          />
          <a-button
            class="play"
            shape="circle"
            :disabled="!streamId"
            :class="{ active: videoPlay }"
            :icon="videoPlay ? 'pause-circle' : 'play-circle'"
            @click="handlePlayback(videoPlay ? 'pause' : 'play')"
          />
          <a-button
            shape="circle"
            icon="fast-forward"
            :disabled="!videoPlay"
            @click="handlePlayback('faster')"
          />
          <a-button
            shape="circle"
            icon="step-forward"
            :disabled="!streamId"
            @click="handlePlayback('next')"
          />
        </div>
        <div class="video-stream__speed">
          <span>播放速度</span>
          <a-slider
            v-model="videoSpeed"
            :disabled="!videoPlay"
            :marks="videoMarks"
            :included="false"
            :step="null"
            :min="0.25"
            :max="4"
            dots
          />
        </div>
        <ul v-if="videoStreamList.length > 0" class="video-stream__list">
          <li v-for="item in videoStreamList" :key="item.name">
            <div class="video-stream__item">
              <span>{{ item.name }}</span>
              <a-button
                type="primary"
                shape="circle"
                size="small"
                icon="caret-right"
                @click="pullVideoStream(item)"
              ></a-button>
            </div>
          </li>
        </ul>
        <a-empty v-else class="sg-empty" description="暂无回放视频流" />
      </div>
      <div class="video-record">
        <div class="video-record__btns">
          <a-button size="small" :loading="loadVideo" @click="handleVideoRecord('fetch')"
            >获取录像
          </a-button>
          <a-button size="small" :disabled="!loadVideo" @click="handleVideoRecord('check')"
            >查看进度
          </a-button>
          <a-button size="small" :disabled="!loadVideo" @click="handleVideoRecord('stop')"
            >停止
          </a-button>
        </div>
        <!-- <a-checkbox-group class="video-record__list" v-model="videoRecordSel">
          <a-checkbox :value="item.url">{{ item.name }}</a-checkbox>
          <a-icon type="download" @click="handleDownloadRecord(item)" />
        </a-checkbox-group> -->
        <ul v-if="videoRecordList.length > 0" class="video-record__list">
          <li v-for="item in videoRecordList" :key="item.name">
            <div class="video-record__item">
              <span>{{ item.name }}</span>
              <a-button
                type="primary"
                shape="circle"
                size="small"
                icon="download"
                :disabled="!item.loaded"
                @click="handleDownloadRecord(item)"
              ></a-button>
            </div>
          </li>
        </ul>
        <a-empty v-else class="sg-empty" description="暂无视频录像" />
      </div>
    </a-col>

    <a-modal
      v-model="videoModal"
      dialog-class="sg-modal"
      :title="videoModalTitle"
      :afterClose="afterModalClose"
      :footer="false"
      centered
    >
      <div class="video-modal">
        <img v-if="videoImage" class="video-modal__image" :src="videoImage" alt="#" />
        <swiper v-else class="video-modal__swiper" ref="swiper" :options="videoOptions">
          <swiper-slide v-for="(item, index) in videoRecordSel" :key="index">
            <sg-dplayer class="swiper-no-swiping" :ref="`dplayer-${index}`" :url="item.url" />
          </swiper-slide>
          <div v-show="videoRecordSel.length > 1" class="swiper-pagination" slot="pagination"></div>
          <span
            v-show="videoRecordSel.length > 1"
            class="swiper-button-prev"
            slot="button-prev"
          ></span>
          <span
            v-show="videoRecordSel.length > 1"
            class="swiper-button-next"
            slot="button-next"
          ></span>
        </swiper>
      </div>
    </a-modal>
  </a-row>
</template>

<script>
import _ from 'lodash';
import FileSaver from 'file-saver';
import playback from '@/mixins/playback';
import SgDplayer from '@/components/Monitor/DPlayer';
import SgEplayer from '@/components/Monitor/EasyPlayer';
import { STREAM_TYPE } from '@/enum';

export default {
  name: 'VideoPlayback',
  mixins: [playback],
  components: {
    SgDplayer,
    SgEplayer,
  },
  computed: {
    streamTypes() {
      return Object.entries(STREAM_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    videoSpeedList() {
      return Object.keys(this.videoMarks)
        .map(Number)
        .sort((a, b) => a - b);
    },
    videoTimeRange() {
      return `${this.videoStart}-${this.videoEnd}`;
    },
  },
  watch: {
    videoSpeed(speed) {
      if (speed in this.videoMarks) {
        this.onVideoSpeedChange(speed);
      }
    },
    videoStreams(arr) {
      // 播放器清空时重置控制参数
      if (arr.length === 0) {
        this.streamId = '';
        this.videoPlay = false;
      } else if (arr.length === 1) {
        this.videoStreamIndex = 0;
      }
    },
    videoStreamIndex(index) {
      const video = this.videoStreams[index];
      this.streamId = video.sid;
      this.videoPlay = video.play;
    },
  },
  data() {
    return {
      loadHandler: 0,
      loadStream: false,
      loadVideo: false,
      streamId: '',
      cameraId: '',
      deviceId: '',
      channelNo: '',
      decodeTag: '',
      videoUrl: '',
      videoStart: 0,
      videoEnd: 0,
      videoType: 0,
      videoPlay: false,
      videoModal: false,
      videoModalTitle: '',
      videoImage: '',
      videoSpeed: 1,
      videoSpeedIndex: 3,
      videoMarks: { 0.25: '0.25', 0.5: '', 1: '1', 2: '2', 4: '4' },
      videoStreams: [],
      videoStreamIndex: 0,
      videoStreamList: [
        {
          name: '2020-09-17 23:42:52_2020-09-18 00:00:32',
          fileName: 'ch0001_00000000487000000', //录像名称
          fileSize: 1064904288, //录像大小（字节）
          isLocked: 0, //录像是否锁定（锁定后，不覆盖）
          startTime: '2020-09-17 23:42:52', //开始时间
          stopTime: '2020-09-18 00:00:32', //结束时间
        },
      ],
      videoRecordList: [],
      videoRecordSel: [],
      videoOptions: {
        observer: true,
        observeParents: true,
        pagination: { el: '.swiper-pagination' },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      },
      timeStart: this.$moment().startOf('d'),
      timeEnd: this.$moment().endOf('d'),
      dateSel: this.$moment(),
    };
  },
  methods: {
    renderCalendar({ value, onChange }) {
      const month = this.$moment(value).format('MMMM');
      return (
        <div class="calendar-header">
          <a-icon
            type="caret-left"
            onClick={() => {
              onChange(this.$moment(value).subtract(1, 'M'));
            }}
          />
          <span>{month}</span>
          <a-icon
            type="caret-right"
            onClick={() => {
              onChange(this.$moment(value).add(1, 'M'));
            }}
          />
        </div>
      );
    },
    // 视频流播放控制
    handlePlayback(action) {
      if (!this.deviceId) return this.$message.warn('请先选择视频设备！');
      const video = this.videoStreams[this.videoStreamIndex];
      const player = this.$refs[`player-${this.streamId}`][0];
      switch (action) {
        case 'play':
          this.$api
            .getMediaApi('playback_pause', {
              idx: this.deviceId,
              streamid: this.streamId,
              pause: 0,
            })
            .then(() => {
              this.$message.success('视频回放已开始！');
              this.videoPlay = video.play = true;
              player && player.playVideo();
            });
          break;
        case 'pause':
          this.$api
            .getMediaApi('playback_pause', {
              idx: this.deviceId,
              streamid: this.streamId,
              pause: 1,
            })
            .then(() => {
              this.$message.warn('视频回放已暂停！');
              this.videoPlay = video.play = false;
              player && player.pauseVideo();
            });
          break;
        case 'faster':
          if (this.videoSpeedIndex < this.videoSpeedList.length - 1) {
            this.videoSpeedIndex++;
            this.videoSpeed = this.videoSpeedList[this.videoSpeedIndex];
          }
          break;
        case 'slower':
          if (this.videoSpeedIndex > 0) {
            this.videoSpeedIndex--;
            this.videoSpeed = this.videoSpeedList[this.videoSpeedIndex];
          }
          break;
        case 'prev':
          if (this.videoStreamIndex === 0) {
            this.videoStreamIndex = this.videoStreamList.length - 1;
          } else {
            this.videoStreamIndex--;
          }
          break;
        case 'next':
          if (this.videoStreamIndex === this.videoStreamList.length - 1) {
            this.videoStreamIndex = 0;
          } else {
            this.videoStreamIndex++;
          }
          break;
        default:
          break;
      }
    },
    // 视频录像操作
    handleVideoRecord(action) {
      switch (action) {
        case 'fetch':
          {
            if (!this.deviceId) return this.$message.warn('请先选择视频设备！');
            this.loadVideo = true;
            const date = this.$moment(this.dateSel).format('YYYY-MM-DD');
            const timeEnd = this.$moment(this.timeEnd).format('HH:mm:ss');
            const timeStart = this.$moment(this.timeStart).format('HH:mm:ss');
            console.log(`${date}T${timeStart}Z`);
            this.$api
              .getMediaApi('gethistoryrecord', {
                devidx: this.deviceId,
                channelno: this.channelNo,
                start: `${date}T${timeStart}Z`,
                stop: `${date}T${timeEnd}Z`,
              })
              .then((res) => {
                if (!res) return;
                this.$message.info('开始加载录像文件！');
                const { fileName, handle, video } = res;
                this.loadHandle = handle;
                this.videoRecordList.push({
                  loaded: false,
                  handle: handle,
                  name: fileName,
                  url: video,
                });
              });
          }
          break;
        case 'check':
          this.$api
            .getMediaApi('/getrecordpos', {
              devidx: this.deviceId,
              handle: this.loadHandle,
            })
            .then((res) => {
              if (!res) return;
              if (res.pos === 100) {
                this.$message.success('录像文件加载完成！');
                const video = this.videoRecordList.find((item) => item.handle === this.loadHandle);
                if (video) video.loaded = true;
                this.loadVideo = false;
              } else {
                this.$message.loading('录像文件加载中...下载进度：' + res.pos + '%' );
              }
            });
          break;
        case 'stop':
          this.$api
            .getMediaApi('/stophistoryrecord', {
              devidx: this.deviceId,
              handle: this.loadHandle,
            })
            .then(() => {
              this.$message.warn('停止加载录像文件！');
              const video = this.videoRecordList.find((item) => item.handle === this.loadHandle);
              if (video) video.loaded = true;
              this.loadVideo = false;
            });
          break;
        default:
          break;
      }
    },
    // 视频录像下载
    handleDownloadRecord(video) {
      if (video) {
        window.open(`https://${location.hostname}:8443/media/api/v2/downloadMp4?devidx=${this.deviceId}&channelno=${this.channelNo}&filename=${video.name}`);
        // FileSaver.saveAs(
        //   `https://${location.hostname}:8443/media/api/v2/downloadMp4?devidx=${this.deviceId}&channelno=${this.channelNo}&filename=${video.name}`,
        //   '任务巡视报告.docx'
        // );     
        // this.$api
        //   .getMediaApi('downloadMp4', {
        //     devidx: this.deviceId,
        //     channelno: this.channelNo,
        //     filename: video.name,
        //   })
        //   .then(() => {
        //     this.$message.success('录像文件下载成功！');
        //   })
        //   .catch(() => {
        //     this.$message.error('录像文件下载失败！');
        //   });
      } else {
        this.videoRecordSel.forEach((item) => {
          const matches = item.match(/\d+-\d+-\d+-\d+.mp4$/);
          const fileName = matches ? matches[0] : item;
          FileSaver.saveAs(item, fileName);
        });
      }
    },
    // 选择回放视频类型
    onVideoTypeChange(checkedVal) {
      if (checkedVal.length === 0) {
        this.videoType = 0;
      } else if (checkedVal.length === 10) {
        this.videoType = -1;
      } else {
        this.videoType = checkedVal.reduce((acc, val) => ((acc += Math.pow(2, val)), acc), 0);
      }
      console.log(this.videoType);
    },
    // 切换视频播放速度
    onVideoSpeedChange(speed) {
      if (!this.streamId) return this.$message.warn('暂未回放视频流！');
      this.$api
        .getMediaApi('playback_scale', {
          idx: this.deviceId,
          streamid: this.streamId,
          scale: speed,
        })
        .then((res) => {
          if (!res) return;
          this.$message.success(`播放速度切换至${speed}倍速`);
        });
    },
    // 关闭播放器
    onPlayerClosed(index) {
      if (this.videoStreamIndex === index) {
        this.videoStreamIndex = 0;
      }
      this.videoStreams.splice(index, 1);
    },
    // 选中播放器
    onPlayerSelected(index) {
      this.videoStreamIndex = index;
    },
    // 播放器进度跳转
    onPlayerSeeking(stream, seekTime) {
      console.log(stream.dura, seekTime);
      // 设置录像开始时间点
      this.playVideoStream(stream, Math.round(seekTime));
    },
    // 播放器视频抓图
    onPlayerScreenshot({ image, title }) {
      this.videoImage = image || require('@/assets/images/img_substation.jpg');
      this.videoModalTitle = title;
      this.videoModal = true;
    },
    afterModalClose() {
      this.videoRecordSel.forEach((_, index) => {
        const dplayer = this.$refs[`dplayer-${index}`];
        dplayer && dplayer[0].destroyVideo();
      });
    },
    playVideoRecord() {
      const stream = this.videoStreamList[this.videoStreamIndex];
      this.$api
        .getMediaApi('startplayback', {
          devidx: this.deviceId,
          channelno: this.channelNo,
          start: this.$moment(stream.startTime).format('YYYY_MM_DD_HH_mm_ss'),
          stop: this.$moment(stream.stopTime).format('YYYY_MM_DD_HH_mm_ss'),
        })
        .then((res) => {
          if (!res) return;
          if (res.flv_url) {
            this.videoPlay = true;
            this.streamId = res.stream;
            this.videoUrl = `wss://${location.hostname}:8443/media/${this.deviceId}/${this.streamId}.flv`;
          } else {
            this.$message.warn('未找到回放流地址！');
            if (this.videoStreamIndex === this.videoStreamList.length - 1) {
              this.videoStreamIndex = 0;
            } else {
              this.videoStreamIndex++;
            }
          }
        });
    },
    // 播放视频流
    playVideoStream(stream, start = 0) {
      this.$api
        .getMediaApi('playback_play', {
          idx: this.deviceId,
          streamid: stream.sid,
          range: `${start}-${stream.dura}`,
        })
        .then(() => {
          this.videoPlay = stream.play = true;
          const player = this.$refs[`player-${stream.sid}`][0];
          player && player.playVideo();
        });
    },
    // 拉取视频流
    pullVideoStream(video) {
      // if (!this.deviceId || this.channelNo) return this.$message.warn('请先选择视频设备！');
      this.$api
        .getMediaApi('startplayback', {
          devidx: this.deviceId,
          cameraIdx: this.channelNo,
          decodeTag: video.DecoderTag,
          rtspUrl: video.FileUrl,
          range: `0-${video.range}`,
          start: video.recordStarttime,
          stop: video.recordStoptime,
        })
        .then((res) => {
          if (!res) return;
          const { stream, channelName } = res;
          if (stream) {
            if (this.videoStreams.length === 4) {
              this.$message.warn('已达到可播放数量上限！');
            } else {
              this.streamId = stream;
              const videoStream = {
                play: false,
                sid: stream,
                name: channelName,
                size: video.Size,
                dura: video.range,
                url: `https://${location.hostname}:8443/media/${this.deviceId}/${stream}.flv`,
              };
              this.videoStreams.push(videoStream);
              setTimeout(() => {
                this.playVideoStream(videoStream);
              }, 1000);
            }
          } else {
            this.$message.warn('未找到视频流地址！');
          }
        })
        .finally(() => {
          // if (this.videoStreams.length === 4) {
          //   this.$message.warn('已达到可播放数量上限！');
          // } else {
          //   this.videoPlay = true;
          //   this.streamId = '1615821596695';
          //   const videoStream = {
          //     play: false,
          //     sid: this.streamId,
          //     name: this.streamId,
          //     size: 1024,
          //     dura: 600,
          //     url: '',
          //   };
          //   this.videoStreams.push(videoStream);
          //   this.playVideoStream(videoStream);
          // }
        });
    },
    // 获取视频流列表
    getVideoStreamList() {
      if (!this.deviceId) return this.$message.warn('请先选择视频设备！');
      if (!this.videoType) return this.$message.warn('请先选择录像类型！');
      this.loadStream = true;
      const date = this.$moment(this.dateSel).format('YYYY-MM-DD');
      const timeEnd = this.$moment(this.timeEnd).format('HH:mm:ss');
      const timeStart = this.$moment(this.timeStart).format('HH:mm:ss');
      this.$api
        .getMediaApi('request_history_video', {
          idx: this.deviceId,
          no: this.channelNo,
          type: this.videoType,
          fromindex: 1,
          toindex: 1000,
          begintime: `${date}T${timeStart}Z`,
          endtime: `${date}T${timeEnd}Z`,
        })
        .then((res) => {
          if (!res) return;
          this.videoStreamList = res.data.videoList.map((item) => ({
            ...item,
            name: `${item.BeginTime}_${item.EndTime}`,
            range: this.$moment(item.EndTime).diff(this.$moment(item.BeginTime), 'seconds'),
            recordStarttime: item.BeginTime,
            recordStoptime: item.EndTime,
          }));
        })
        .finally(() => {
          this.loadStream = false;
        });
    },
    // 获取视频文件列表
    getVideoFileList() {
      if (!this.deviceId) return this.$message.warn('请先选择视频设备！');
      this.loadVideo = true;
      const date = this.$moment(this.dateSel).format('YYYY-MM-DD');
      this.$api
        .getMediaApi('getrecordfile', {
          period: date,
          devidx: this.deviceId,
          channelno: this.channelNo,
        })
        .then((res) => {
          if (!res) return;
          const basePath = `https://${location.hostname}:8443/media/record/${this.deviceId}/${this.channelno}/${date}`;
          this.videoRecordList = res.paths.map((item) => ({
            name: item,
            url: `${basePath}/${item}`,
          }));
        })
        .finally(() => {
          this.loadVideo = false;
        });
    },
  },
};
</script>

<style lang="less" scoped>
.monitor {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000;

  .toolbar {
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50px;
    padding: 0 10px;
    visibility: hidden;
    background-color: #222;
    transition: visibility 0.5s;

    .sg-icon + .sg-icon {
      margin-left: 10px;
    }
  }
}
.video {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: flex-start;
  background-color: #fff;

  /deep/ .ant-empty {
    height: 10vh;
    margin-top: 2vh;

    &-image {
      height: 5vh;
    }
  }
  &-date {
    width: 100%;

    .calendar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 36px;
      padding: 0 10px;
      color: #fff;
      font-size: 20px;
      font-weight: bold;
      background-color: @theme-color1;
    }
    /deep/ .ant-fullcalendar {
      &-calendar-body {
        padding: 0;
      }
      &-column-header {
        height: 30px;
        color: #fff;
        border: @border-default;
        background-color: @theme-color2;
      }
      &-tbody {
        background-color: #eee;
      }
    }
  }
  &-time {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1vh;

    .ant-time-picker {
      width: 120px;
    }
    > b {
      margin: 0 15px;
    }
  }
  &-stream {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;

    &__load {
      width: 90%;
      margin-top: 1vh;

      > .ant-btn {
        width: 100%;
        margin-top: 0;
      }
    }
    &__type {
      width: 15vw;

      /deep/ .ant-checkbox-group-item {
        display: inline-block;
        width: 50%;
        margin-right: 0;
        white-space: nowrap;
      }
    }
    &__action {
      display: flex;
      align-items: center;
      margin-top: 2vh;

      .ant-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        border: none;

        + .ant-btn {
          margin-left: 15px;
        }
        &.play {
          font-size: 40px;
        }
        &.active {
          color: @theme-color1;
        }
      }
    }
    &__speed {
      display: flex;
      align-items: center;
      margin-top: 2vh;

      .ant-slider {
        width: 200px;
        margin: 0 0 0 10px;
      }
    }
    &__list {
      width: 100%;
      height: 15vh;
      margin-top: 3vh;
      padding: 0 30px;
      overflow-y: auto;
      list-style: decimal outside;

      li + li {
        margin-top: 1vh;
      }
    }
    &__item {
      display: flex;
      align-items: center;
      width: 100%;

      > span {
        width: 90%;
        .text-ellipsis();
      }
      .anticon {
        font-size: 20px;
        cursor: pointer;
      }
      .ant-btn {
        line-height: 15px;
      }
    }
  }
  &-record {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;

    &__btns {
      display: flex;
      align-items: center;
      margin-top: 1vh;

      .ant-btn {
        width: 80px;

        + .ant-btn {
          margin-left: 10px;
        }
      }
    }
    &__list {
      width: 100%;
      height: 15vh;
      margin-top: 1vh;
      padding: 0 30px;
      overflow-y: auto;
      list-style: decimal outside;

      li + li {
        margin-top: 1vh;
      }
    }
    &__item {
      display: flex;
      align-items: center;
      width: 100%;

      > span {
        width: 90%;
        .text-ellipsis();
      }
      .anticon {
        font-size: 20px;
        cursor: pointer;
      }
      .ant-btn {
        line-height: 15px;
      }
    }
  }
  &-modal {
    width: 100%;
    height: 60vh;

    &__image {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    &__swiper {
      width: 100%;
      height: 100%;

      /deep/ .swiper-pagination {
        width: auto;
        left: 50%;
        transform: translateX(-50%);
      }
    }
  }
}
</style>
