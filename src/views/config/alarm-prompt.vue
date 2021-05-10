<template>
  <a-row class="sg-row" :gutter="10">
    <a-col class="sg-col" :span="20"> </a-col>
    <a-col class="sg-col" :span="4">
      <!-- <a-list class="alarm" item-layout="vertical" :data-source="alarmList">
        <a-list-item slot="renderItem" slot-scope="item">
          <div>{{ item.content }}</div>
        </a-list-item>
      </a-list> -->

      <div class="alarm">
        <header class="alarm-header">
          <span class="alarm-title">告警提醒</span>
          <span class="alarm-count">
            未确认告警: <b>{{ alarmCount }}</b>
          </span>
        </header>
        <main class="alarm-scroll" ref="scroll">
          <ul v-if="alarmList.length > 0" class="alarm-list">
            <li class="alarm-item" v-for="(item, index) in alarmList" :key="index">
              <div class="alarm-item__header">
                <span class="alarm-item__time">{{ item.time }}</span>
                <a-popconfirm
                  title="是否确认该联动告警信息?"
                  @confirm="handleAlarmInfo(item, 'confirm')"
                >
                  <a-button class="alarm-item__confirm" size="small" type="link">确认</a-button>
                </a-popconfirm>
                <a-button
                  class="alarm-item__check"
                  size="small"
                  type="link"
                  @click="handleAlarmInfo(item, 'check')"
                >
                  查看
                </a-button>
              </div>
              <div class="alarm-item__main" :class="`level-${item.alarm_level}`">
                <a-icon v-if="item.dec_type === 0 || item.dec_type === 2" type="video-camera" />
                <span class="alarm-item__content">{{ item.content }}</span>
              </div>
            </li>
          </ul>
          <a-empty v-else class="sg-empty" description="暂无告警信息" />
        </main>
      </div>
    </a-col>
  </a-row>
</template>

<script>
import BScroll from 'better-scroll';

export default {
  name: 'AlarmPrompt',
  components: {
    // SgCamera,
  },
  watch: {
    alarmCount() {
      return this.alarmList.length;
    },
  },
  data() {
    return {
      bscroll: null,
      videoUrl: '',
      deviceId: '',
      channelNo: '',
      alarmList: Array.from({ length: 10 }, (_, index) => ({
        detector_id: ++index,
        time: this.$current(),
        content: '告警信息内容',
        dec_type: Math.random() > 0.5 ? 0 : 1,
        alarm_type: this.$random(10),
        alarm_level: this.$random(3) + 2,
      })),
    };
  },
  created() {
    this.onWebsocketPush();
  },
  beforeDestroy() {
    this.$bus.$off('stomp');
  },
  methods: {
    handleAlarmInfo(item, action) {
      switch (action) {
        case 'check':
          break;
        case 'confirm':
          break;

        default:
          break;
      }
    },
    onWebsocketPush() {
      this.$bus.$on('stomp', (msg) => {
        const { action, item } = msg;
        // if (action !== 'detector_station_alarm' || action !== 'task_station_alarm') return;
        if (action === 'task_station_alarm') {
          this.alarmList.push({
            dec_type: 0,
            time: item.time,
            alarm_type: item.alarm_type,
            alarm_level: item.alarm_level,
            detector_id: item.detector_id,
            content: `${item.task_name}-${item.content}`,
          });
        } else if (action === 'detector_station_alarm') {
          this.alarmList.push({
            dec_type: 1,
            alarm_ype: 0,
            alarm_level: 0,
            time: item.time,
            detector_id: item.detector_id,
            content: `${item.detector_name}-${item.content}`,
          });
        }
      });
    },
    initBScroll() {
      this.bscroll = new BScroll(this.$refs.scroll, {
        click: true,
        scrollY: true,
        observeDOM: true,
      });
    },
  },
};
</script>

<style lang="less" scoped>
.alarm {
  width: 100%;
  height: 100%;
  background-color: #fff;

  /deep/ .ant-list {
    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 4vh;
      padding: 0 10px;
    }
  }
  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 4vh;
    padding: 0 10px;
    border-bottom: @border-default;
  }
  &-title {
    font-size: 16px;
    font-weight: bold;
  }
  &-count {
    font-weight: 600;

    > b {
      color: @warning-color;
    }
  }
  &-scroll {
    width: 100%;
    height: 85vh;
    overflow-y: auto;
  }
  &-list {
    width: 100%;
    height: 100%;
    padding: 0 10px;
    overflow-y: auto;
  }
  &-item {
    width: 100%;
    padding: 0.5vh 0;
    border-bottom: @border-light;

    &__header {
      display: flex;
      align-items: center;
      width: 100%;
    }
    &__main {
      display: flex;
      align-items: center;
      width: 100%;
      height: 3vh;
      .text-ellipsis();

      .anticon {
        margin-right: 5px;
      }
      &.level-2 {
        color: #ffc357;
      }
      &.level-3 {
        color: #f2764c;
      }
      &.level-4 {
        color: #f5222d;
      }
    }
    &__confirm {
      margin-left: auto;
    }
  }
}
</style>
