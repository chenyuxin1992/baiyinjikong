<template>
  <a-row class="sg-row">
    <a-col class="sg-col" :span="18">
      <div class="map">
        <a-input-search
          v-model="keyword"
          class="map-search"
          placeholder="请输入关键字搜索"
          :max-length="20"
          enter-button
          allow-clear
          @search="onMapSearch"
        />

        <sg-tmap />

        <ul class="map-action">
          <li><a-icon type="robot" @click="handleMapLocate('robot')" /></li>
          <li>
            <a-popover placement="leftBottom" overlay-class-name="sg-popover">
              <a-icon type="environment" @click="handleMapLocate('point')" />
              <template #content>
                <div class="map-popover">
                  <div class="map-popover__item">
                    <label for="map_alarm">告警等级：</label>
                    <a-radio-group
                      id="map_alarm"
                      v-model="mapAlarm"
                      :options="alarmLevels"
                    ></a-radio-group>
                  </div>
                  <div class="map-popover__item">
                    <label for="map_view">地图视野：</label>
                    <a-radio-group id="map_view" v-model="mapView">
                      <a-radio :value="1">已覆盖</a-radio>
                      <a-radio :value="0">未覆盖</a-radio>
                    </a-radio-group>
                  </div>
                </div>
              </template>
            </a-popover>
          </li>
        </ul>
        <a-modal
          v-model="mapModal"
          width="15vw"
          dialog-class="sg-modal map-modal"
          :title="mapModalTitle"
          :footer="false"
          centered
        >
          <ul class="map-modal__list">
            <li v-for="(item, index) in mapModalList" :key="index">
              {{ item.name }}：{{ item.value }}
            </li>
          </ul>
          <a-button
            v-if="mapAction === 'alarm'"
            class="map-modal__btn"
            icon="video-camera"
            type="primary"
            block
            @click="handleMapAction('monitor')"
            >视频监控
          </a-button>
        </a-modal>
      </div>
      <a-table
        class="table"
        table-layout="auto"
        row-key="id"
        :scroll="{ y: '18vh' }"
        :loading="tableLoad"
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="false"
        bordered
        @change="onTableChange"
      >
        <template #title>
          <!-- <a-select
              class="task-station"
              v-model="stationId"
              :options="stationList"
              placeholder="请选择变电站"
              @change="onStationChange"
            ></a-select> -->
          <a-dropdown-button class="task-list" type="primary">
            <div>当天巡视任务总数 {{ taskToday }} 个</div>
            <div>执行中巡视任务数 {{ taskCurrent }} 个</div>
            <a-icon slot="icon" type="down" />
            <a-menu v-if="taskList.length > 0" slot="overlay" selectable @select="onTaskSelect">
              <a-menu-item v-for="item in taskList" :key="item.id">
                {{ item.plantask_name }}
              </a-menu-item>
            </a-menu>
          </a-dropdown-button>
          <div v-if="taskData" class="task-info">
            <span class="task-info__main">
              <div class="task-info__name">
                <a-icon type="fire" />
                <span>{{ taskData.plantask_name }}</span>
              </div>
              <a-progress class="task-info__progress" :percent="taskData.progress" />
            </span>
            <a-button
              class="task-info__btn"
              shape="circle"
              type="link"
              :icon="taskData.status === 2 ? 'pause-circle' : 'play-circle'"
              @click="handleTaskToggle"
            ></a-button>
          </div>
          <ul class="task-alarm">
            <li
              class="task-alarm__item"
              v-for="(val, key) in taskAlarm"
              :key="key"
              :class="`level-${key}`"
            >
              <a-icon type="alert" />
              <span class="task-alarm__info">
                <span class="task-alarm__value">{{ val.value }}</span>
                <span class="task-alarm__label">{{ val.label }}</span>
              </span>
            </li>
          </ul>
        </template>
      </a-table>
    </a-col>
    <a-col class="sg-col monitor" :span="6">
      <sg-robot
        v-for="(item, index) in robotList"
        :class="{ selected: robotIndex === index }"
        :key="index"
        v-bind="{
          detector: item.detector,
          lightUrl: item.lightUrl,
          infraredUrl: item.infraredUrl,
          autoplay: true,
        }"
        @click="robotIndex = index"
      />
      <sg-camera
        v-for="(item, index) in cameraList"
        :class="{ selected: cameraIndex === index }"
        :key="item.id"
        v-bind="{
          url: item.url,
          did: item.did,
          cno: item.cno,
          preset: item.preset,
          detector: item.detector,
          autoplay: true,
        }"
        @click="cameraIndex = index"
      />
    </a-col>
  </a-row>
</template>

<script>
import SgTmap from '@/components/Map/3DMap';
import SgRobot from '@/components/Monitor/Robot';
import SgCamera from '@/components/Monitor/Camera';
import { ControlCMD, ALARM_LEVEL, DATA_SOURCE, RECOGNITION_TYPE } from '@/enum';

export default {
  name: 'RealtimeMonitor',
  components: {
    SgTmap,
    SgRobot,
    SgCamera,
  },
  computed: {
    alarmLevels() {
      return Object.entries(ALARM_LEVEL).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    taskToday() {
      return this.taskList.length;
    },
    taskCurrent() {
      return this.taskList.filter((item) => item.status === 2).length;
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 100 },
        { title: '任务名称', dataIndex: 'plantask_name', align: 'center', width: 200 },
        { title: '点位名称', dataIndex: 'patrolpoint_name', align: 'center', width: 200 },
        { title: '检测时间', dataIndex: 'record_time', align: 'center', width: 200 },
        { title: '识别类型', dataIndex: 'recognType', align: 'center', width: 200 },
        { title: '识别结果', dataIndex: 'result', align: 'center', width: 200 },
        {
          title: '告警等级',
          dataIndex: 'alarmLevel',
          align: 'center',
          width: 200,
          filterMultiple: false,
          filters: this.alarmLevels,
        },
        { title: '数据来源', dataIndex: 'dataSource', align: 'center', width: 200 },
      ];
    },
  },
  data() {
    return {
      keyword: '',
      mapView: 1,
      mapAlarm: 1,
      mapAction: '',
      mapModal: false,
      mapModalTitle: '',
      mapModalList: [],
      mapModalData: null,
      timeStart: this.$moment().startOf('y').format('YYYY-MM-DD HH:mm:ss'),
      timeEnd: this.$moment().startOf('d').format('YYYY-MM-DD HH:mm:ss'),
      stationId: undefined,
      stationList: [],
      robotIndex: 0,
      robotList: Array(2).fill({
        lightUrl: '',
        infraredUrl: '',
        detector: { name: '机器人监控' },
      }),
      cameraIndex: 0,
      cameraList: Array(2).fill({
        url: '',
        did: 1,
        cno: 2,
        preset: null,
        detector: { name: '摄像头监控' },
      }),
      taskData: null,
      taskList: [],
      taskAlarm: Object.entries(ALARM_LEVEL).reduce(
        (acc, [key, val]) => ((acc[key] = { label: val, value: 0 }), acc),
        {}
      ),
      taskSelect: [],
      alarmLevel: undefined,
      tableLoad: false,
      tableData: [],
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10,
        showQuickJumper: true,
        showTotal: (total) => `当前共有记录${total}条`,
      },
    };
  },
  created() {
    this.getTaskListData();
    this.getSelectData();
    this.getTableData();
  },
  mounted() {
    // this.handleMapAction('alarm');
  },
  methods: {
    handleMapAction(action) {
      this.mapAction = action;
      switch (action) {
        case 'alarm':
          this.mapModalTitle = '设备告警信息详情';
          this.mapModalList = [
            { name: '变电站', value: '' },
            { name: '运维单位', value: '' },
            { name: '设备名称', value: '' },
            { name: '电压等级', value: '' },
            { name: '告警等级', value: '' },
            { name: '告警类型', value: '' },
            { name: '告警来源', value: '' },
            { name: '告警时间', value: '' },
            { name: '告警信息', value: '' },
          ];
          break;
        case 'point':
          this.mapModalTitle = '巡视点位分析详情';
          this.mapModalList = [
            { name: '运维单位', value: '' },
            { name: '设备类型', value: '' },
            { name: '设备型号', value: '' },
            { name: '生产厂家', value: '' },
            { name: '使用单位', value: '' },
            { name: '运维部门', value: '' },
            { name: '安装位置', value: '' },
            { name: '安装时间', value: '' },
            { name: '安装状态', value: '' },
          ];
          break;
        case 'ledger':
          this.mapModalTitle = '设备台账信息详情';
          this.mapModalList = [
            { name: '任务名称', value: '' },
            { name: '点位名称', value: '' },
            { name: '检测时间', value: '' },
            { name: '识别类型', value: '' },
            { name: '识别结果', value: '' },
            { name: '告警等级', value: '' },
            { name: '数据来源', value: '' },
          ];
          break;
        case 'monitor':
          if (!this.mapModalData) return;
          this.monitorList[this.monitorIndex] = this.mapModalData;
          break;
        default:
          break;
      }
      this.mapModal = true;
    },
    handleMapLocate(key) {
      switch (key) {
        case 'point':
          break;
        case 'robot':
          break;
        case 'camera':
          break;
        default:
          break;
      }
    },
    handleTaskToggle() {
      if (!this.taskData) return;
      if (this.taskData.status === 2) {
        this.$api
          .postControlApi({
            action: ControlCMD.TASK_CONTROL,
            command: 2,
            task_id: this.taskData.plantask_id,
            syn: `${this.taskData.plantask_name}任务暂停指令下发`,
          })
          .then(() => {
            this.$message.success('任务暂停指令下发成功！');
            this.taskData.status = 3;
          });
      } else {
        this.$api
          .postControlApi({
            action: ControlCMD.TASK_CONTROL,
            command: 1,
            task_id: this.taskData.plantask_id,
            syn: `${this.taskData.plantask_name}任务启动指令下发`,
          })
          .then(() => {
            this.$message.success('任务启动指令下发成功！');
            this.taskData.status = 2;
          });
      }
    },
    onMapSearch(val) {
      console.log(val);
    },
    onTaskSelect({ key }) {
      const taskItem = this.taskList.find((item) => item.id === key);
      console.log(taskItem);
      if (!taskItem) return;
      this.taskData = taskItem;
      this.getTableData();
      this.getTaskAlarmData(taskItem.task_id);
    },
    onStationChange(val) {
      this.getTaskListData(val);
    },
    onTableChange(_, filters) {
      if (filters['alarmLevel'] && filters['alarmLevel'].length > 0) {
        this.alarmLevel = filters['alarmLevel'][0];
      } else {
        this.alarmLevel = undefined;
      }
      this.getTableData();
    },
    getTableData() {
      this.tableLoad = true;
      let params = [];
      this.taskData && params.push({ match: { task_id: this.taskData.task_id } });
      this.alarmLevel && params.push({ match: { alarm_level: this.alarmLevel } });
      this.$api
        .postHistoryApi('alarmitems', '_search', {
          from: this.pagination.pageSize * (this.pagination.current - 1),
          size: this.pagination.pageSize,
          query: {
            bool: {
              must: params,
              filter: [
                { range: { record_time: { gte: this.timeStart, lte: this.timeEnd } } },
                { range: { status: { gte: 2, lte: 4 } } },
              ],
            },
          },
          track_total_hits: true,
        })
        .then((res) => {
          console.log(res.hits.hits);
          if (!res || !res.hits.total.value) return;
          this.tableData = res.hits.hits.map((item, index) => {
            const source = item._source;
            return {
              ...source,
              id: item._id,
              index: index + 1,
              result: `${source.value}${source.Unit}`,
              dataSource: DATA_SOURCE[source.source] || '-',
              alarmLevel: ALARM_LEVEL[source.alarm_level] || '-',
              recognType: RECOGNITION_TYPE[source.Recognition_type] || '-',
            };
          });
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    getSelectData() {
      this.$api.getBaseApi('substation').then((res) => {
        if (!res || !res.results) return;
        this.stationList = res.results.map((item) => ({ label: item.name, value: item.id }));
      });
    },
    getTaskListData(stationId) {
      this.$api
        .postHistoryApi('historytask', '_search', {
          query: {
            bool: {
              // must: [{ match: { substation_id: stationId } }],
              filter: [{ range: { start_time: { gte: this.timeStart, lte: this.timeEnd } } }],
            },
          },
          _source: { excludes: ['image'] },
          track_total_hits: true,
        })
        .then((res) => {
          if (!res || !res.hits.total.value) return;
          let taskList = [];
          for (let i = 0, len = res.hits.hits.length; i < len; i++) {
            const { _id, _source } = res.hits.hits[i];
            const dataItem = {
              ..._source,
              id: _id,
              progress: _source.task_progress || 0,
              result: { total: _source.total, done: 0, normal: 0, alarm: 0, error: 0, defect: 0 },
            };
            this.$api
              .postHistoryApi('historyitems', '_search', {
                size: 0,
                query: { bool: { must: [{ match: { task_id: _source.task_id } }] } },
                _source: { excludes: ['image'] },
                track_total_hits: true,
              })
              .then((res1) => {
                if (!res1) return;
                dataItem.result.done = res1.hits.total.value;
                dataItem.progress = _source.total
                  ? Math.round((dataItem.result.done / _source.total) * 100)
                  : 0;
              });
            this.$api
              .postHistoryApi('api', 'task_count', { task_id: _source.task_id })
              .then((res2) => {
                if (!res2) return;
                dataItem.result = { ...dataItem.result, ...res2 };
              });
            taskList.push(dataItem);
          }
          this.taskList = taskList;
        });
    },
    getTaskAlarmData(taskId) {
      this.$api
        .postHistoryApi('alarmitems', '_search', {
          size: 0,
          query: {
            bool: {
              must: [{ match: { task_id: taskId } }],
              filter: [{ range: { record_time: { gte: this.timeStart, lte: this.timeEnd } } }],
            },
          },
          aggs: { alarm_count: { terms: { field: 'alarm_level' } } },
          track_total_hits: true,
        })
        .then((res) => {
          if (!res) return;
          const buckets = res.aggregations.alarm_count.buckets;
          buckets.forEach((item) => {
            this.taskAlarm[item.key].value = item.doc_count;
          });
        });
    },
  },
};
</script>

<style lang="less" scoped>
.map {
  position: relative;
  width: 100%;
  height: 60vh;
  background-color: #eee;

  &-search {
    z-index: 100;
    position: absolute;
    top: 10px;
    left: 10px;
    width: 300px;
  }
  &-action {
    z-index: 100;
    position: absolute;
    right: 10px;
    bottom: 10px;

    li + li {
      margin-top: 5px;
    }
    .anticon {
      padding: 5px;
      font-size: 16px;
      cursor: pointer;
      background-color: #fff;
    }
  }
  &-popover {
    &__item {
      display: flex;
      align-items: center;
      width: 100%;

      + .map-popover__item {
        margin-top: 1vh;
      }
    }
  }
}

.table {
  /deep/ .ant-table {
    width: 100%;

    th {
      height: 4vh;
      padding: 0 10px;
      font-weight: bold;
      background-color: @theme-color6;
    }
    td {
      height: 4vh;
      padding: 0 10px;
    }
    &-title {
      display: flex;
      align-items: center;
      // justify-content: space-between;
      width: 100%;
      height: 7vh;
      padding: 10px;
      background-color: #fff;

      .task {
        &-station {
          width: 200px;
          margin-right: 20px;
        }
        &-list {
          width: 200px;
          height: 5vh;
          margin-right: 50px;

          > .ant-btn {
            height: 100%;
            vertical-align: middle;
          }
        }
        &-info {
          display: flex;
          align-items: center;

          &__btn {
            margin-left: 10px;

            > .anticon {
              font-size: 32px;
            }
          }
          &__main {
            width: 300px;
          }
          &__name {
            width: 100%;
            .text-ellipsis();

            > span {
              flex: auto;
              margin-left: 5px;
            }
          }
          &__progress {
            width: 100%;
          }
        }
        &-alarm {
          display: flex;
          align-items: center;
          margin-left: auto;

          &__item {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 4vh;
            padding: 0 10px;

            .anticon {
              padding: 5px;
              font-size: 20px;
              border-radius: 50%;
              border: 1px solid currentColor;
            }
            &.level-1 {
              color: #50529e;
            }
            &.level-2 {
              color: #f7c709;
            }
            &.level-3 {
              color: #f76809;
            }
            &.level-4 {
              color: #f70909;
            }
          }
          &__info {
            display: inline-flex;
            align-items: center;
            flex-direction: column;
            margin-left: 10px;
          }
          &__label {
            font-size: 12px;
          }
          &__value {
            font-size: 16px;
            font-weight: bold;
          }
        }
      }
    }
    &-content {
      height: 22vh;
    }
    &-placeholder {
      height: 18vh;
      border: none;
    }
  }
}

.monitor {
  .robot,
  .camera {
    width: 100%;
    height: 25%;
  }
}
</style>
