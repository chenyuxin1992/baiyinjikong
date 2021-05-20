<template>
  <div class="camera">
    <a-popover
      v-for="(item, key) in monitorData"
      :key="key"
      trigger="click"
      placement="top"
      overlay-class-name="sg-popover"
    >
      <div class="camera-item" :class="`camera-${key}`">
        <span class="camera-item__value">{{ item.value }}</span>
        <span class="camera-item__name">{{ item.name }}</span>
      </div>
      <template #content>
        <div class="camera-detail">
          <a-statistic title="在线设备" :value="item.online" :value-style="{ color: '#52c41a' }" />
          <a-divider type="vertical" style="height: 2vh" />
          <a-statistic title="离线设备" :value="item.offline" :value-style="{ color: '#f5222d' }" />
        </div>
      </template>
    </a-popover>
    <img class="camera-image" src="../../assets/images/img_camera.png" alt="#" />
    <div class="camera-detector">
      <div class="camera-detector__legend">
        <span v-for="(item, key) in detectorData" :key="key" :class="`detector-${key}`">
          {{ item.name }} {{ item.value }}
        </span>
      </div>
      <a-popover placement="top" overlay-class-name="sg-popover">
        <div class="camera-detector__progress">
          <span
            v-for="(item, key) in detectorData"
            :key="key"
            :class="`detector-${key}`"
            :style="{ width: `${item.percent}%` }"
          ></span>
        </div>
        <template #content>
          <div class="camera-detail">
            <a-statistic
              :title="detectorData[1].name"
              :value="detectorData[1].value"
              :value-style="{ color: '#52c41a' }"
            />
            <a-divider type="vertical" style="height: 2vh" />
            <a-statistic
              :title="detectorData[2].name"
              :value="detectorData[2].value"
              :value-style="{ color: '#f5222d' }"
            />
          </div>
        </template>
      </a-popover>
    </div>
  </div>
</template>

<script>
import { ControlCMD } from '@/enum';
export default {
  name: 'CameraStatis',
  props: {
    detector: {
      type: Object,
      default() {
        return {
          1: { name: '可见光', value: 5010, percent: 100 },
          2: { name: '红外', value: 0, percent: 0 },
        };
      },
    },
    stationId: {
      type: String,
      default() {
        return '';
      },
    },
    monitor: {
      type: Object,
      default() {
        return {
          11: { name: '球机', value: 2 },
          12: { name: '云台', value: 5 },
          10: { name: '枪机', value: 5003 },
        };
      },
    },
  },
  data() {
    return {
      detectorData: {
        1: { name: '可见光', value: 5010, percent: 100 },
        2: { name: '红外', value: 0, percent: 0 },
      },
      monitorData: {
        11: { name: '球机', value: 2, online: 2, offline: 0 },
        12: { name: '云台', value: 5, online: 1, offline: 4 },
        10: { name: '枪机', value: 5003, online: 5003, offline: 0 },
      },
    };
  },
  created() {
    this.getCameraStatisData();
  },
  watch: {
    stationId: {
      handler(val) {
        this.getCameraStatisData();
      },
    },
  },
  methods: {
    getCameraStatisData() {
      this.$api
        .getBaseApi('detector', { substation: this.stationId, dec_type: 10, page_size: 6000 })
        .then((res) => {
          // console.log('摄像头',res);
          //if (!res || !res.results) return;
          const { count, results } = res;
          let detectorData = {
              1: { name: '可见光', value: 0, percent: 0 },
              2: { name: '红外', value: 0, percent: 0 },
            },
            monitorData = {
              11: { name: '球机', value: 0, online: 0, offline: 0 },
              12: { name: '云台', value: 0, online: 0, offline: 0 },
              10: { name: '枪机', value: 0, online: 0, offline: 0 },
            };
          for (const item of results) {
            const { status, video_mode, camera_type } = item;
            if (detectorData[video_mode]) {
              detectorData[video_mode].value += 1;
            }
            if (monitorData[camera_type]) {
              monitorData[camera_type].value += 1;
              if (status) {
                monitorData[camera_type].online += 1;
              } else {
                monitorData[camera_type].offline += 1;
              }
            }
          }
          for (const key in detectorData) {
            const item = detectorData[key];
            item.percent = Math.round((item.value / count) * 100);
          }
          this.detectorData = detectorData;
          this.monitorData = monitorData;
        });
    },
  },
};
</script>

<style lang="less" scoped>
.camera {
  &-item {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    position: absolute;
    color: #fff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;

    &.camera-11 {
      top: 50%;
      left: 27%;
      width: 120px;
      height: 120px;
      background-color: #f7c709;
    }
    &.camera-12 {
      top: 20%;
      right: 30%;
      width: 80px;
      height: 80px;
      background-color: #2bd5d5;
    }
    &.camera-10 {
      top: 55%;
      right: 10%;
      width: 100px;
      height: 100px;
      background-color: #33cc70;
    }
    &__name {
      font-size: 12px;
    }
    &__value {
      font-size: 20px;
      font-weight: 600;
    }
  }
  &-image {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80px;
    height: 80px;
    transform: translate(-50%, -50%);
  }
  &-detail {
    display: flex;
    align-items: center;
    text-align: center;
  }
  &-detector {
    display: inline-flex;
    align-items: center;
    flex-direction: column;
    position: absolute;
    left: 50%;
    bottom: 10%;
    transform: translateX(-50%);

    &__legend {
      display: flex;
      align-items: center;

      span {
        position: relative;
        font-size: 12px;

        + span {
          margin-left: 20px;
        }
        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: -12px;
          width: 8px;
          height: 8px;
          margin-top: -4px;
          border-radius: 50%;
        }
        &.detector-1::before {
          background-color: #09f7f7;
        }
        &.detector-2::before {
          background-color: #ee3d11;
        }
      }
    }
    &__progress {
      display: flex;
      align-items: center;
      width: 300px;
      height: 20px;
      margin-top: 10px;
      border-radius: 10px;
      border: @border-default;
      overflow: hidden;
      cursor: pointer;

      span {
        height: 100%;
        transform: skewX(-15deg);

        &.detector-1 {
          background-color: #09f7f7;
        }
        &.detector-2 {
          background-color: #ee3d11;
        }
      }
    }
  }
}
</style>
