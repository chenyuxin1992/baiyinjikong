<template>
  <a-row class="sg-row" :gutter="10">
    <a-col class="sg-col" :span="12">
      <div class="info">
        <div class="info-detail">
          <ul class="info-basic">
            <li>变电站：{{ taskData.substation_name }}</li>
            <li>任务名称：{{ taskData.plantask_name }}</li>
            <li>巡视类型：{{ taskData.taskType }}</li>
            <li>开始时间：{{ taskData.start_time }}</li>
            <li>结束时间：{{ taskData.end_time }}</li>
            <!-- <li>巡视耗时：{{ taskData.duration }}</li> -->
          </ul>
          <ul class="info-statis">
            <li>
              <span>总测点</span><span>{{ taskData.result.total }}</span>
            </li>
            <li>
              <span>已巡视</span><span>{{ taskData.result.done }}</span>
            </li>
            <li class="normal">
              <span>正常</span><span>{{ taskData.result.normal }}</span>
            </li>
            <li class="alarm">
              <span>告警</span><span>{{ taskData.result.alarm }}</span>
            </li>
            <li class="fail">
              <span>失败</span><span>{{ taskData.result.error }}</span>
            </li>
            <li class="defect">
              <span>缺陷</span><span>{{ taskData.result.defect }}</span>
            </li>
          </ul>
        </div>
        <a-progress class="info-progress" type="circle" :percent="taskData.progress">
          <template v-slot:format="percent">
            <span>{{ percent }}%</span>
            <span>当前进度</span>
          </template>
        </a-progress>
      </div>

      <div class="table">
        <div class="table-header">
          <a-input
            v-model="deviceName"
            size="small"
            placeholder="请输入设备名称"
            :max-length="20"
            allow-clear
          />
          <a-button size="small" @click="handleQueryData('device')">查询</a-button>
          <!-- <a-button size="small" @click="handleExportData('device')">导出</a-button> -->
          <!-- <span class="switch">
            <a-switch
              v-model="checkExcept"
              size="small"
              @change="onSwitchChange('defect', $event)"
            />
            <span>只看异常</span>
          </span> -->
        </div>
        <a-table
          row-key="id"
          table-layout="auto"
          :loading="deviceLoad"
          :columns="deviceColumns"
          :data-source="deviceData"
          :pagination="devicePage"
          :scroll="{ x: false }"
          :bordered="true"
          @change="onDeviceTableChange"
        >
          <template v-slot:operation="data, row">
            <div class="operation">
              <a-button size="small" @click="handleTaskRecord(row, 'point')">巡检点位</a-button>
            </div>
          </template>
        </a-table>
      </div>

      <div class="table">
        <div class="table-header">
          <a-input
            v-model="pointName"
            size="small"
            placeholder="请输入点位名称"
            :max-length="20"
            allow-clear
          />
          <a-button size="small" @click="handleQueryData('point')">查询</a-button>
          <span class="switch">
            <a-switch v-model="checkAlarm" size="small" @change="onSwitchChange('alarm', $event)" />
            <span>只看异常</span>
          </span>
        </div>
        <a-table
          row-key="id"
          table-layout="auto"
          :loading="pointLoad"
          :columns="pointColumns"
          :data-source="pointData"
          :row-selection="pointSelection"
          :pagination="pointPage"
          :scroll="{ x: true }"
          :bordered="true"
          @change="onPointTableChange"
        >
          <!-- :row-selection="{ selectedRowKeys: tableSelected, onChange: onTableSelectChange }" -->
          <template v-slot:checkvalue="val, row">
            <sg-cell
              v-if="row.valid !== 1 && row.check_state === 0"
              :value="val"
              @change="onTableCellEdit(row, $event)"
            />
            <span v-else>{{ val }}</span>
          </template>
          <template v-slot:operation="val, row">
            <div class="operation">
              <a-popconfirm
                v-show="row.check_state === 0"
                title="是否确认该任务巡视记录?"
                @confirm="handleTaskRecord(row, 'confirm')"
              >
                <a-button size="small">确认</a-button>
              </a-popconfirm>
              <a-popconfirm
                v-show="row.check_state === 0 && row.valid === 1"
                title="确定将该记录转为异常?"
                cancelText="识别失败"
                okText="识别异常"
                @cancel="handleTaskRecord(row, 'fail')"
                @confirm="handleTaskRecord(row, 'except')"
              >
                <a-button size="small">转异常</a-button>
              </a-popconfirm>
              <a-popconfirm
                v-if="row.whitelist === 0"
                title="确定将该记录加入白名单?"
                @confirm="handleTaskRecord(row, 'add')"
              >
                <a-button size="small">加入白名单</a-button>
              </a-popconfirm>
              <a-popconfirm
                v-else
                title="确定将该记录移出白名单?"
                @confirm="handleTaskRecord(row, 'remove')"
              >
                <a-button size="small">移出白名单</a-button>
              </a-popconfirm>
            </div>
          </template>
        </a-table>
      </div>
    </a-col>
    <a-col class="sg-col" :span="12">
      <div class="detector">
        <a-tabs
          class="sg-tabs detector-tabs"
          type="card"
          size="small"
          @change="onDetectorTabsChange"
        >
          <a-tab-pane class="detector-monitor" key="monitor" tab="巡视设备">
            <swiper
              v-if="detectorList.length > 0"
              class="monitor-swiper"
              ref="monitorSwiper"
              :options="monitorOptions"
            >
              <swiper-slide
                class="monitor-item"
                v-for="(item, index) in detectorList"
                :key="item.id"
              >
                <!-- <sg-player :ref="`player-${index}`" :url="item.url" /> -->
                <sg-robot
                  v-if="item.type === 'robot'"
                  :ref="`player-${index}`"
                  v-bind="{
                    detector: item.detector,
                    lightUrl: item.lightUrl,
                    infraredUrl: item.infraredUrl,
                    autoplay: false,
                  }"
                />
                <sg-camera
                  v-else
                  :ref="`player-${index}`"
                  v-bind="{
                    url: item.url,
                    did: item.did,
                    cno: item.cno,
                    //preset: item.preset,
                    detector: item.detector,
                    gesture: false,
                    autoplay: false,
                  }"
                />
              </swiper-slide>
              <div
                v-show="detectorList.length > 1"
                class="swiper-pagination swiper-monitor"
                slot="pagination"
              ></div>
              <span
                v-show="detectorList.length > 1"
                class="swiper-button-prev swiper-monitor"
                slot="button-prev"
              ></span>
              <span
                v-show="detectorList.length > 1"
                class="swiper-button-next swiper-monitor"
                slot="button-next"
              ></span>
            </swiper>
            <a-empty v-else class="sg-empty" description="暂无监控数据" />
          </a-tab-pane>
          <a-tab-pane class="detector-map" key="map" tab="巡视地图">
            <div class="maint-map">
              <a-popover
                v-model="mapPopup"
                placement="leftTop"
                trigger="click"
                :get-popup-container="(node) => node.parentNode"
              >
                <a-button class="detector-map__popup" type="primary" size="small">
                  {{ mapPopup ? '收起' : '环境' }}
                </a-button>
                <template #content>
                  <ul class="detector-map__info">
                    <!-- <li>巡视任务名称：{{ mapRobot.task_name || '-' }}</li>
                    <li>巡视设备名称：{{ mapRobot.detector_name || '-' }}</li>
                    <li>巡视点位名称：{{ mapRobot.patrolpoint_name || '-' }}</li>
                    <li>最新巡视结果：{{ mapRobot.value_unit || '-' }}</li> -->
                    <li>环境温度：{{ mapHost.temperature || '-' }}</li>
                    <li>环境湿度：{{ mapHost.humidity || '-' }}</li>
                    <li>风速：{{ mapHost.wind_speed || '-' }}</li>
                    <li>雨量：{{ mapHost.rainfall || '-' }}</li>
                    <li>风向：{{ mapHost.wind_direction || '-' }}</li>
                    <li>气压：{{ mapHost.pressure || '-' }}</li>
                  </ul>
                </template>
              </a-popover>
            </div>
            <sg-pmap
              v-if="mapUrl"
              :map-url="mapUrl"
              :points="mapPoints"
              :robots="mapRobots"
              @robot-click="onPatrolRobotClick($event)"
            ></sg-pmap>
            <a-empty v-else class="sg-empty" description="暂无巡视地图" />
          </a-tab-pane>
        </a-tabs>
        <div class="detector-list__wrap">
          <h3 class="detector-list__header">巡视设备列表</h3>
          <ul class="detector-list" v-if="detectorList.length > 0">
            <li
              v-for="(item, index) in detectorList"
              :key="index"
              :class="[item.status ? 'online' : 'offline', { active: detectorIndex === index }]"
              @click="handleSelectDetector(index)"
            >
              <sg-icon name="robot" />
              <span>{{ item.name }}</span>
            </li>
          </ul>
          <a-empty v-else class="sg-empty" description="暂无设备数据" />
        </div>
      </div>
      <div class="history">
        <a-tabs class="sg-tabs history-tabs" type="card" @change="onHistoryTabsChange">
          <template #tabBarExtraContent>
            <a-button type="primary" size="small" @click="handleExportData('picture')"
              >导出巡视图片
            </a-button>
            <a-dropdown-button
              v-model="alarmMenu"
              type="primary"
              size="small"
              @click="handleExportData('report')"
            >
              <span>导出巡视报告</span>
              <a-icon slot="icon" type="down" />
              <a-menu slot="overlay" v-model="alarmKeys" selectable multiple>
                <a-menu-item v-for="item in alarmOptions" :key="item.key">
                  {{ item.title }}
                </a-menu-item>
              </a-menu>
            </a-dropdown-button>
          </template>

          <a-tab-pane class="history-snapshot" key="snapshot" tab="历史截图">
            <swiper
              v-if="snapshotList.length > 0"
              class="snapshot-swiper"
              ref="snapshotSwiper"
              :options="snapshotOptions"
            >
              <swiper-slide
                class="snapshot-item"
                v-for="(item, index) in snapshotList"
                :key="index"
              >
                <!-- <img :src="item.image" alt="巡视任务截图" /> -->
                <el-image :src="item.image" alt="#" @click="handleShowViewer(index)" />
                <span>点位名称：{{ item.patrolpoint_name }}</span>
                <span>记录时间：{{ item.record_time }}</span>
                <span>识别结果：{{ item.value_disp }}</span>
                <span>巡视结论：{{ item.conclusion }}</span>
              </swiper-slide>
              <span
                v-show="snapshotList.length > snapshotOptions.slidesPerView"
                class="swiper-button-prev swiper-snapshot"
                slot="button-prev"
              ></span>
              <span
                v-show="snapshotList.length > snapshotOptions.slidesPerView"
                class="swiper-button-next swiper-snapshot"
                slot="button-next"
              ></span>
            </swiper>
            <a-empty v-else class="sg-empty" description="暂无截图数据" />
          </a-tab-pane>
          <a-tab-pane class="history-curve" key="curve" tab="历史曲线">
            <sg-chart v-if="historyChart" type="line" :options="historyCurve" />
            <a-empty v-else class="sg-empty" description="暂无历史数据" />
          </a-tab-pane>
          <a-tab-pane class="history-alarm" key="alarm" tab="告警信息">
            <a-table
              row-key="id"
              table-layout="auto"
              :loading="alarmLoad"
              :columns="alarmColumns"
              :data-source="alarmData"
              :pagination="alarmPage"
              :scroll="{ x: false }"
              :bordered="true"
              @change="onAlarmTableChange"
            >
              <template v-slot:operation="data, row">
                <div class="operation">
                  <a-popconfirm
                    v-show="row.status !== 3"
                    title="是否确认该告警信息?"
                    @confirm="handleTaskRecord(row, 'alarm')"
                  >
                    <a-button size="small">确认</a-button>
                  </a-popconfirm>
                </div>
              </template>
            </a-table>
          </a-tab-pane>
          <!-- <a-tab-pane class="history-voice" key="voice" tab="声纹分析">
            <a-result
              v-if="pointItem && pointItem.file_type === 3"
              class="voice-result"
              :title="pointItem.conclusion"
              :status="
                pointItem.valid === 1 ? 'success' : pointItem.valid === 0 ? 'error' : 'warning'
              "
            >
              <template #extra>
                <a-button
                  type="primary"
                  icon="play-circle"
                  :loading="!!pointHowl"
                  @click="handlePlayVoice"
                  >播放音频文件</a-button
                >
              </template>
              <ul class="voice-result__list">
                <li>记录时间：{{ pointItem.record_time }}</li>
                <li>识别结果：{{ pointItem.value }}</li>
                <li>识别信息：{{ pointItem.value_disp }}</li>
              </ul>
            </a-result>
            <a-empty v-else class="sg-empty" description="暂无声纹数据" />
          </a-tab-pane> -->
          <!-- <a-tab-pane class="history-video" key="video" tab="视频回放">
            <sg-eplayer
              v-if="pointItem && pointItem.file_type === 4"
              class="video-player"
              v-bind="{
                title: pointItem.patrolpoint_name,
                url: `https://${location.hostname}:8443/html/shares/${pointItem.file_path}`,
              }"
            />
            <a-empty v-else class="sg-empty" description="暂无视频数据" />
          </a-tab-pane> -->
        </a-tabs>
      </div>
    </a-col>

    <image-viewer
      v-show="imageViewer"
      :url-list="imageList"
      :initial-index="imageIndex"
      :on-close="onImageViewerClose"
    />
  </a-row>
</template>

<script>
import _ from 'lodash';
import { Howl } from 'howler';
import { mapState } from 'vuex';
import FileSaver from 'file-saver';
import SgChart from '@/components/Chart';
import SgPmap from '@/components/Map/2DMap';
import SgCell from '@/components/Table/Cell';
import SgRobot from '@/components/Monitor/Robot';
import SgCamera from '@/components/Monitor/Camera';
// import SgEplayer from '@/components/Monitor/EasyPlayer';
import ImageViewer from '@/components/ImageViewer';
import {
  ALARM_STATUS,
  ALARM_LEVEL,
  ALARM_TYPE,
  DATA_SOURCE,
  PATROLHOST_TYPE,
  ROBOT_TYPE,
  TASK_STATUS,
  TASK_VALID,
  DEVICE_TYPE,
} from '@/enum';

export default {
  name: 'TaskDetail',
  components: {
    SgPmap,
    SgCell,
    SgChart,
    SgRobot,
    SgCamera,
    // SgEplayer,
    ImageViewer,
  },
  computed: {
    ...mapState({
      taskData: (state) => state.taskData,
      taskId: (state) => state.taskData.task_id,
      taskStatus: (state) => state.taskData.status,
      plantaskId: (state) => state.taskData.plantask_id,
      substationId: (state) => state.taskData.substation_id,
    }),
    dataSources() {
      return Object.entries(DATA_SOURCE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    deviceTypes() {
      return Object.entries(DEVICE_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    alarmLevels() {
      return Object.entries(ALARM_LEVEL).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    alarmOptions() {
      return [
        { key: 'alarm_list', title: '告警点位' },
        { key: 'error_list', title: '异常点位' },
        { key: 'normal_list', title: '正常点位' },
        { key: 'alarm_picture', title: '告警图片' },
        { key: 'error_picture', title: '异常图片' },
      ];
    },
    alarmColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '告警设备', dataIndex: 'detector_name', align: 'center', width: 150 },
        { title: '告警点位', dataIndex: 'patrolpoint_name', align: 'center', width: 150 },
        { title: '告警时间', dataIndex: 'record_time', align: 'center', width: 150 },
        { title: '告警类型', dataIndex: 'alarmType', align: 'center', width: 150 },
        {
          title: '告警级别',
          dataIndex: 'alarmLevel',
          align: 'center',
          width: 100,
          filterMultiple: false,
          filters: this.alarmLevels,
        },
        { title: '告警状态', dataIndex: 'alarmState', align: 'center', width: 100 },
        // { title: '识别结果', dataIndex: 'value_disp', align: 'center', width: 100 },
        { title: '操作', align: 'center', scopedSlots: { customRender: 'operation' } },
      ];
    },
    deviceColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '间隔', dataIndex: 'bay_name', align: 'center', width: 150  ,ellipsis: true},
        { title: '设备', dataIndex: 'device_name', align: 'center', width: 150 ,ellipsis: true },
        { title: '设备类型', dataIndex: 'type', align: 'center', width: 120 },
        { title: '结论', dataIndex: 'conclusion', align: 'center', width: 120 },
        { title: '操作', align: 'center', width: 120, scopedSlots: { customRender: 'operation' } },
      ];
    },
    pointColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '部件', dataIndex: 'component_name', align: 'center', width: 100 ,ellipsis: true},
        { title: '巡视内容', dataIndex: 'patrolpoint_name', align: 'center', width: 110 ,ellipsis: true},
        { title: '巡视结论', dataIndex: 'conclusion', align: 'center', width: 110 },
        { title: '识别结果', dataIndex: 'value_disp', align: 'center', width: 100 },
        { title: '原始值', dataIndex: 'value', align: 'center', width: 90 },
        { title: '正常值', dataIndex: 'normal_value', align: 'center', width: 90 },
        {
          title: '修正值',
          dataIndex: 'check_value',
          align: 'center',
          width: 120,
          scopedSlots: { customRender: 'checkvalue' },
        },
        { title: '审核状态', dataIndex: 'checkState', align: 'center', width: 100 },
        {
          title: '点位来源',
          dataIndex: 'dataSource',
          align: 'center',
          width: 120,
          filterMultiple: false,
          filters: this.dataSources,
        },
        {
          title: '操作',
          //fixed: 'right',
          align: 'center',
          width: 200,
          scopedSlots: { customRender: 'operation' },
        },
      ];
    },
    pointSelection() {
      const clearSelection = () => {
        this.pointSelected = [];
        this.pointItem = null;
        this.snapshotPage.current = 1;
        this.getPatrolSnapshotData();
      };
      return {
        fixed: true,
        type: 'radio',
        columnWidth: 20,
        columnTitle: (
          <AButton type="link" onClick={clearSelection}>
            清空
          </AButton>
        ),
        selectedRowKeys: this.pointSelected,
        hideDefaultSelections: true,
        onChange: (keys, rows) => {
          console.log(keys, rows);
          this.pointSelected = keys;
        },
        onSelect: (row, selected) => {
          console.log(row, selected);
          this.pointItem = row;
          this.snapshotPage.current = 1;
          this.getPatrolSnapshotData();
        },
      };
    },
    imageList() {
      return this.snapshotList.map((item) => item.image);
    },
  },
  data() {
    const $vm = this;
    return {
      mapUrl: '',
      mapHost: {},
      mapRobot: {},
      mapPoints: [],
      mapRobots: [],
      mapPopup: true,
      taskProgress: null,
      imageIndex: 0,
      imageViewer: false,
      checkExcept: false,
      checkAlarm: false,
      deviceLoad: false,
      deviceId: null,
      deviceName: '',
      deviceData: [],
      devicePage: { total: 0, current: 1, pageSize: 5, size: 'small' },
      pointLoad: false,
      pointName: '',
      pointSource: undefined,
      pointSelected: [],
      pointHowl: null,
      pointItem: null,
      pointData: [],
      pointPage: { total: 0, current: 1, pageSize: 5, size: 'small' },
      detectorIndex: 0,
      detectorList: Array.from({ length: 1 }, (_, index) => ({
        id: ++index,
        name: `摄像机${index}`,
        status: Math.random() > 0.5,
        url: '',
      })),
      monitorOptions: {
        grabCursor: true,
        observer: true,
        observeParents: true,
        pagination: { el: '.swiper-pagination.swiper-monitor' },
        navigation: {
          nextEl: '.swiper-button-next.swiper-monitor',
          prevEl: '.swiper-button-prev.swiper-monitor',
        },
      },
      snapshotList: [],
      snapshotPage: { current: 1, pageSize: 20 },
      snapshotOptions: {
        grabCursor: true,
        slidesPerView: 3,
        slidesPerGroup: 1,
        observer: true,
        observeParents: true,
        navigation: {
          nextEl: '.swiper-button-next.swiper-snapshot',
          prevEl: '.swiper-button-prev.swiper-snapshot',
        },
        on: {
          reachEnd: () => {
            $vm.snapshotPage.current++;
            $vm.getPatrolSnapshotData();
          },
        },
      },
      historyChart: false,
      historyCurve: {
        grid: {
          top: '15%',
          left: '5%',
          right: '5%',
          bottom: '5%',
        },
        legend: {
          top: '5%',
        },
        dataset: { source: [] },
        series: {
          type: 'line',
          name: '巡视点位历史曲线',
          symbol: 'circle',
          symbolSize: 10,
          encode: { x: 'record_time', y: 'value' },
        },
      },
      alarmKeys: [],
      alarmHowl: null,
      alarmMenu: false,
      alarmLoad: false,
      alarmLevel: undefined,
      alarmData: [],
      alarmPage: { total: 0, current: 1, pageSize: 5, size: 'small' },
      deviceList: [], 
    };
  },
  created() {
    this.onWebsocketPush();

    this.getDeviceTableData();
    this.getPointTableData();
    this.getPatrolDetectorData();
    this.getPatrolSnapshotData();
  },
  mounted() {
    // this.$notification.warn({
    //   key: '123',
    //   duration: 0,
    //   class: `sg-notification  level-1`,
    //   message: `告警类型-告警时间`,
    //   icon: <AIcon class="sg-animation-flash" type="alert" />,
    //   closeIcon: (
    //     <AButton type="link" size="small">
    //       确认
    //     </AButton>
    //   ),
    //   description: (
    //     <ul>
    //       <li>识别结果：识别结果</li>
    //       <li>告警点位：告警点位</li>
    //       <li>告警内容：告警内容</li>
    //     </ul>
    //   ),
    // });
  },
  beforeDestroy() {
    this.$bus.$off('stomp');
    if (this.taskProgress) {
      clearInterval(this.taskProgress);
      this.taskProgress = null;
    }
  },
  methods: {
    handleQueryData(key) {
      if (key === 'device') {
        this.devicePage.current = 1;
        this.getDeviceTableData();
      } else {
        this.pointPage.current = 1;
        this.getPointTableData();
      }
    },
    handleExportData(action) {
      if (action === 'picture') {
        this.$api.postHistoryApi('api', 'export_picture', { task_id: this.taskId }).then((res) => {
          if (!res) return;
          FileSaver.saveAs(
            `https://${location.hostname}:8443/html/shares/tar/${res}`,
            this.taskData.plantask_name + this.taskData.start_time + '.tar'
          );
        });
      } else {
        console.log('this.taskStatus', this.taskStatus);
        if (this.taskStatus !== 1 && this.taskStatus !== 4) {
          return this.$message.warn('任务正在执行中，请在结束后重试！');
        }
        this.$api
          .postHistoryApi('alarmitems', '_search', {
            query: { bool: { must: [{ match: { task_id: this.taskId } }] } },
            track_total_hits: true,
          })
          .then((res) => {
            //if (!res || !res.hits.total.value) return;
            let allowExport = true;
            for (let i = 0; i < res.hits.hits.length; i++) {
              const { _source } = res.hits.hits[i];
              if (_source.status !== 3) {
                allowExport = false;
                break;
              }
            }
            if (allowExport) {
              this.$api
                .postHistoryApi('api', 'export_doc', {
                  task_id: this.taskId,
                  include: this.alarmKeys,
                })
                .then((res) => {
                  if (!res) return;
                  FileSaver.saveAs(
                    `https://${location.hostname}:8443/html/shares/report/${res}`,
                    res
                  );
                });
            } else {
              return this.$message.warn('任务告警尚未确认，请在确认后重试！');
            }
          });
      }
    },
    handleTaskRecord(row, action) {
      switch (action) {
        case 'point':
          this.deviceId = row.device_id;
          // 动态刷新巡视点位信息
          this.pointPage.current = 1;
          this.getPointTableData(this.deviceId);
          // 动态刷新巡视截图信息
          // this.snapshotPage.current = 1;
          // this.getPatrolSnapshotData();
          break;
        case 'confirm':
          this.$api
            .postHistoryApi('historyitems', `_update/${row.id}`, { doc: { check_state: 1 } })
            .then(() => {
              row.check_state = 1;
              row.checkState = '已审核';
            });
          break;
        case 'fail':
          this.$api
            .postHistoryApi('historyitems', `_update/${row.id}`, { doc: { valid: 0 } })
            .then(() => {
              row.valid = 0;
              row.conclusion = TASK_VALID[row.valid];
            });
          break;
        case 'except':
          this.$api
            .postHistoryApi('historyitems', `_update/${row.id}`, { doc: { valid: 2 } })
            .then(() => {
              row.valid = 2;
              row.conclusion = TASK_VALID[row.valid];
            });
          break;
        case 'add':
          this.$api
            .postHistoryApi('historyitems', `_update/${row.id}`, { doc: { whitelist: 1 } })
            .then(() => {
              row.whitelist = 1;
            });
          break;
        case 'remove':
          this.$api
            .postHistoryApi('historyitems', `_update/${row.id}`, { doc: { whitelist: 0 } })
            .then(() => {
              row.whitelist = 0;
            });
          break;
        case 'alarm':
          this.$api
            .postHistoryApi('alarmitems', `_update/${row.id}`, { doc: { status: 3 } })
            .then(() => {
              row.status = 3;
              row.alarmState = ALARM_STATUS[3];
            });
          break;
        default:
          break;
      }
    },
    handlePlayVoice() {
      if (!this.pointItem) return;
      if (!this.pointHowl) {
        const { file_path } = this.pointItem;
        this.pointHowl = new Howl({
          src: `https://${location.hostname}:8443/html/shares/${file_path}`,
          loop: false,
          html5: true,
          preload: true,
          autoplay: true,
          onend: () => {
            this.pointHowl.unload();
            this.pointHowl = null;
          },
          onplayerror: () => {
            this.pointHowl.unload();
            this.pointHowl = null;
          },
        });
      }
    },
    handleShowViewer(index) {
      console.log('picture', index);
      this.imageIndex = index;
      this.imageViewer = true;
    },
    handleSelectDetector(index) {
      const prevPlayer = this.$refs[`player-${this.detectorIndex}`][0];
      prevPlayer && prevPlayer.pauseVideo();
      const nextPlayer = this.$refs[`player-${index}`][0];
      nextPlayer && nextPlayer.playVideo();
      this.detectorIndex = index;
      const monitorSwiper = this.$refs.monitorSwiper && this.$refs.monitorSwiper.$swiper;
      monitorSwiper && monitorSwiper.slideTo(index);
    },
    onWebsocketPush() {
      this.$bus.$on('stomp', (msg) => {
        const { action, item } = msg;
        if (
          action === 'micrometeorology_station_status' &&
          this.mapHost.id === item.patrolhost_id
        ) {
          const { type, value_unit } = item;
          const key = PATROLHOST_TYPE[type];
          this.mapHost[key] = value_unit;
        }
        if (action === 'task_station_status' && this.taskId === item.task_patrolled_id) {
          const { task_state, task_progress } = item;
          // result.done = +item.value;
          this.$store.commit('UPDATE_TASKDATA', {
            status: task_state,
            progress: Math.round(task_progress * 100) / 100,
          });
        }
        if (action === 'task_station_result' && this.taskId === item.task_patrolled_id) {
          const { detector_id } = item;
          if(this.deviceList.indexOf(detector_id) == -1) {
            this.getDeviceTableData();
          }
          if (this.deviceId === detector_id) {
            this.getPointTableData(this.deviceId);
          } 
          else if(!this.deviceId) {
            this.getPointTableData();
          }
        }
        if (action === 'task_station_alarm' && this.taskId === item.task_patrolled_id) {
          const { time, content, value_unit, alarm_type, alarm_level, patrolpoint_name } = item;
          const alarmKey = _.uniqueId('alarm_');
          this.$notification.warn({
            key: alarmKey,
            duration: 0,
            class: `sg-notification level-${alarm_level}`,
            message: ALARM_TYPE[alarm_type] || '暂无告警类型',
            icon: <AIcon class="sg-animation-flash" type="alert" />,
            closeIcon: (
              <AButton type="link" size="small">
                确认
              </AButton>
            ),
            description: (
              <ul>
                <li>告警时间：{time}</li>
                <li>告警点位：{patrolpoint_name}</li>
                <li>告警内容：{content}</li>
              </ul>
            ),
          });
          if (!this.alarmHowl) {
            this.alarmHowl = new Howl({
              src: [require('@/assets/audio/alarm.wav')],
              loop: true,
              html5: false,
              preload: true,
              autoplay: true,
              onend: () => {
                this.alarmHowl.unload();
                this.alarmHowl = null;
              },
              onplay: () => {
                setTimeout(() => {
                  this.alarmHowl.unload();
                  this.alarmHowl = null;
                }, 30000);
              },
              onplayerror: () => {
                this.alarmHowl.unload();
                this.alarmHowl = null;
              },
            });
          }
        }
      });
    },
    onSwitchChange(key) {
      if (key === 'defect') {
        this.devicePage.current = 1;
        this.getDeviceTableData();
      } else {
        this.pointPage.current = 1;
        this.getPointTableData();
      }
    },
    onDeviceTableChange(pagination) {
      this.devicePage.current = pagination.current;
      this.getDeviceTableData();
    },
    onPointTableChange(pagination, filters) {
      this.pointPage.current = pagination.current;
      if (filters['dataSource'] && filters['dataSource'].length > 0) {
        this.pointSource = filters['dataSource'][0];
      } else {
        this.pointSource = undefined;
      }
      this.getPointTableData();
    },
    onAlarmTableChange(pagination, filters) {
      this.alarmPage.current = pagination.current;
      if (filters['alarmLevel'] && filters['alarmLevel'].length > 0) {
        this.alarmLevel = filters['alarmLevel'][0];
      } else {
        this.alarmLevel = undefined;
      }
      this.getAlarmTableData();
    },
    onTableCellEdit(row, val) {
      console.log(val);
      this.$api
        .postHistoryApi('historyitems', `_update/${row.id}`, { doc: { check_value: val } })
        .then(() => {
          row.check_value = val;
          // row.checkValue = val.toString();
        });
    },
    onPatrolRobotClick(robotData) {
      this.mapRobot = robotData;
      this.mapPopup = true;
    },
    onDetectorTabsChange(key) {
      if (key === 'map' && !this.mapUrl) {
        this.getStationDetectorData();
      }
    },
    onHistoryTabsChange(key) {
      if (key !== 'voice' && this.pointHowl) {
        this.pointHowl.unload();
        this.pointHowl = null;
      }
      if (key === 'alarm') {
        this.alarmPage.current = 1;
        this.getAlarmTableData();
      }
    },
    onImageViewerClose() {
      this.imageViewer = false;
    },
    updateTaskProgress() {
      this.taskProgress = setInterval(() => {
        this.$api
          .postHistoryApi('historyitems', '_search', {
            query: { bool: { must: [{ match: { task_id: this.taskId } }] } },
            _source: { excludes: ['image'] },
            track_total_hits: true,
          })
          .then((res) => {
            if (!res) return;
            const { result } = this.taskData;
            result.done = res.hits.total.value;
            const progress = Math.round((result.done / result.total) * 100);
            this.$store.commit('UPDATE_TASKDATA', { result, progress });
            if (progress === 100) {
              clearInterval(this.taskProgress);
              this.taskProgress = null;
            }
          });
      }, 5000);
    },
    getDeviceTableData111() {
      this.deviceLoad = true;
      let params = [{ match: { task_id: this.taskId } }];
      this.checkExcept && params.push({ match: { status: 2 } }, { match: { status: 4 } });
      this.deviceName && params.push({ match: { device_name: this.deviceName } });
      this.$api
        .postHistoryApi('historyitems', '_search', {
          from: this.devicePage.pageSize * (this.devicePage.current - 1),
          size: this.devicePage.pageSize,
          query: { bool: { must: params } },
          _source: { excludes: ['image'] },
          track_total_hits: true,
        })
        .then((res) => {
          if (!res || !res.hits.total.value) return;
          this.deviceData = res.hits.hits.map((item, index) => {
            const source = item._source;
            const tableIndex = this.devicePage.pageSize * (this.devicePage.current - 1) + index + 1;
            return {
              ...source,
              id: item._id,
              index: tableIndex,
              taskState: TASK_STATUS[source.status] || '-',
              conclusion: source.valid === 1 ? '识别正常' : '识别异常',
            };
          });
          this.devicePage.total = res.hits.total.value;
        })
        .finally(() => {
          this.deviceLoad = false;
        });
    },
    getDeviceTableData() {
      //this.deviceLoad = true;
      let params = [{ match: { task_id: this.taskId } }];
      //this.checkExcept && params.push({ match: { status: 2 } }, { match: { status: 4 } });
      this.deviceName && params.push({ match: { device_name: this.deviceName } });
      this.$api
        .postHistoryApi('historyitems', '_search', {
          // from: this.devicePage.pageSize * (this.devicePage.current - 1),
          // size: this.devicePage.pageSize,
          query: { bool: { must: params } },
          collapse: {field: 'device_id'},
          // _source: { excludes: ['image'] },
          //track_total_hits: true,
        })
        .then((res) => {
          //if (!res || !res.hits.total.value) return;
          this.deviceList = [];
          this.deviceData = res.hits.hits.map((item, index) => {
            const source = item._source;
            const tableIndex = this.devicePage.pageSize * (this.devicePage.current - 1) + index + 1;
            this.deviceList.push(source.device_id);
            return {
              ...source,
              id: item._id,
              index: tableIndex,
              taskState: TASK_STATUS[source.status] || '-',
              conclusion: source.valid === 1 ? '正常' : '异常',
              type: DEVICE_TYPE[source.device_type] || '-',
            };
          });
          this.devicePage.total = this.deviceList.length;
        })
        .finally(() => {
          //this.deviceLoad = false;
        });
    },        
    getPointTableData(deviceId) {
      //this.pointLoad = true;
      let mustnotParams = [];
      this.checkAlarm && mustnotParams.push({ match: { valid: 1 } });
      let mustParams = [{ match: { task_id: this.taskId } }];
      deviceId && mustParams.push({ match: { device_id: deviceId } });
      this.pointSource && mustParams.push({ match: { source: this.pointSource } });
      this.pointName && mustParams.push({ match: { patrolpoint_name: this.pointName } });
      this.$api
        .postHistoryApi('historyitems', '_search', {
          from: this.pointPage.pageSize * (this.pointPage.current - 1),
          size: this.pointPage.pageSize,
          sort: [{ record_time: { order: 'desc' } }],
          query: { bool: { must: mustParams, must_not: mustnotParams } },
          _source: { excludes: ['image'] },
          track_total_hits: true,
        })
        .then((res) => {
          if (!res || !res.hits.total.value) return;
          this.pointData = res.hits.hits.map((item, index) => {
            const source = item._source;
            const tableIndex = this.pointPage.pageSize * (this.pointPage.current - 1) + index + 1;
            return {
              ...source,
              id: item._id,
              index: tableIndex,
              dataSource: DATA_SOURCE[source.source] || '-',
              checkState: source.check_state ? '已审核' : '未审核',
              conclusion: source.valid === 1 ? '识别正常' : '识别异常',
            };
          });
          this.pointPage.total = res.hits.total.value;
        })
        .finally(() => {
          //this.pointLoad = false;
        });
    },
    getAlarmTableData() {
      this.alarmLoad = true;
      let mustParams = [{ match: { task_id: this.taskId } }];
      this.alarmLevel && mustParams.push({ match: { alarm_level: this.alarmLevel } });
      this.$api
        .postHistoryApi('alarmitems', '_search', {
          from: this.alarmPage.pageSize * (this.alarmPage.current - 1),
          size: this.alarmPage.pageSize,
          sort: [{ record_time: { order: 'desc' } }],
          query: { bool: { must: mustParams, must_not: [] } },
          track_total_hits: true,
        })
        .then((res) => {
          //if (!res || !res.hits.total.value) return;
          this.alarmData = res.hits.hits.map((item, index) => {
            const source = item._source;
            const tableIndex = this.alarmPage.pageSize * (this.alarmPage.current - 1) + index + 1;
            return {
              ...source,
              id: item._id,
              index: tableIndex,
              alarmType: ALARM_TYPE[source.alarm_type] || '-',
              alarmLevel: ALARM_LEVEL[source.alarm_level] || '-',
              alarmState: ALARM_STATUS[source.status] || '-',
            };
          });
          this.alarmPage.total = res.hits.total.value;
        })
        .finally(() => {
          this.alarmLoad = false;
        });
    },
    getPatrolSnapshotData() {
      let params = [];
      if (this.pointItem) {
        params = [{ match: { patrolpoint_id: this.pointItem.patrolpoint_id } }];
      } else {
        params = [{ match: { task_id: this.taskId } }];
      }
      this.$api
        .postHistoryApi('historyitems', '_search', {
          from: this.snapshotPage.pageSize * (this.snapshotPage.current - 1),
          size: this.snapshotPage.pageSize,
          sort: [{ record_time: { order: 'desc' } }],
          query: { bool: { must: params } },
          track_total_hits: true,
        })
        .then((res) => {
          if (!res || !res.hits.total.value) return;
          const list = res.hits.hits.map((item) => {
            const source = item._source;
            return {
              ...source,
              conclusion: TASK_VALID[source.valid] || '-',
              image: source.file_path
                ? `https://${location.hostname}:8443/html/shares/${source.file_path}`
                : require('@/assets/images/img_placeholder.png'),
            };
          });
          if (this.snapshotPage.current === 1) {
            this.snapshotList = list;
            if (this.pointItem) {
              this.historyCurve.dataset.source = list;
              this.historyChart = true;
            }
          } else {
            this.snapshotList = [...this.snapshotList, ...list];
          }
        })
        .catch(() => {
          const list = Array(5).fill({
            task_name: '日常巡视',
            value_disp: '正常',
            image: require('@/assets/images/logo.png'),
            record_time: this.$current(),
          });
          this.snapshotList = [...this.snapshotList, ...list];
        });
    },
    getPatrolDetectorData() {
      this.$api.getBaseApi('plantask', { id: this.plantaskId }).then((res) => {
        if (!res || !res.count) return;
        const { device_level, device_list } = res.results[0];
        let data;
        switch (device_level) {
          case 1:
            data = { patrolpoint__device__area__parent_id__in: device_list };
            break;
          case 2:
            data = { patrolpoint__device__area_id__in: device_list };
            break;
          case 3:
            data = { patrolpoint_id__in: device_list };
            break;
          case 4:
            data = { patrolpoint__device_id__in: device_list };
            break;
          default:
            break;
        }
        this.$api.getBaseApi('preset_depth', data).then((res) => {
          console.log(res);
          if (!res || !res.count) return;
          const detectors = res.results.map((item) => {
            const {
              id,
              name,
              status,
              dec_type,
              out_code,
              video_address1,
              video_address2,
            } = item.detector;
            if (ROBOT_TYPE[dec_type]) {
              return {
                id,
                name,
                status,
                type: 'robot',
                detector: item.detector,
                lightUrl: video_address1,
                infraredUrl: video_address2,
              };
            } else {
              const [did, cno] = out_code.split('_');
              const url = `wss://${location.hostname}:8443/media/${did}/${cno}.flv`;
              return {
                id,
                did,
                cno,
                url,
                name,
                status,
                type: 'camera',
                detector: item.detector,
                //preset: _.omitBy(item, _.isObject),
              };
            }
          });
          this.detectorList = _.uniqBy(detectors, 'id');
          this.$nextTick(() => {
            if (this.detectorList.length > 0) {
              const player = this.$refs[`player-0`][0];
              player && player.playVideo();
            }
          });
        }).catch(() => {

        this.$api.getBaseApi('detector', { substation: this.substationId }).then((res) => {
          console.log('detector',res.results);
          if (!res || !res.count) return;
          const detectors = res.results.map((item) => {
            const {
              id,
              name,
              status,
              dec_type,
              out_code,
              video_address1,
              video_address2,
            } = item;
            console.log('idetector',res.results);
            if (ROBOT_TYPE[dec_type]) {
              return {
                id,
                name,
                status,
                type: 'robot',
                detector: item.detector,
                lightUrl: video_address1,
                infraredUrl: video_address2,
              };
            } else {
              const [did, cno] = out_code.split('_');
              const url = `wss://${location.hostname}:8443/media/${did}/${cno}.flv`;
              return {
                id,
                did,
                cno,
                url,
                name,
                status,
                type: 'camera',
                detector: item.detector,
                //preset: _.omitBy(item, _.isObject),
              };
            }
          });
          this.detectorList = _.uniqBy(detectors, 'id');
          console.log('detectorList', this.detectorList);
          this.$nextTick(() => {
            if (this.detectorList.length > 0) {
              const player = this.$refs[`player-0`][0];
              player && player.playVideo();
            }
          });
        });        

          
        });
      });
    },
    getStationDetectorData() {
      this.$api.getBaseApi('plantask_depth', { id: this.plantaskId }).then((res) => {
        // if (!res || !res.count) return;
        const { substation, patrolhost } = res.results[0];
        this.mapHost = patrolhost;
        if (substation.map_path) {
          this.mapUrl = `https://${location.hostname}:8443/html/shares/${substation.map_path}`;
        }
      });
      this.$api.getBaseApi('detector', { substation: this.substationId, dec_type__in: '1,2,3' }).then( (res) => {
        if (res && res.count > 0) {
          this.mapRobots = res.results;
        }
      })
      // Promise.all([
      //   this.$api.getBaseApi('patrolpoint', { substation: this.substationId }),
      //   this.$api.getBaseApi('detector', { substation: this.substationId, dec_type__in: '1,2,3' }),
      // ]).then(([res1, res2]) => {
      //   console.log([res1, res2], '黑猫警长');
      //   if (res1 && res1.count) {
      //     this.mapPoints = res1.results;
      //   }
      //   if (res2 && res2.count) {
      //     this.mapRobots = res2.results;
      //   }
      // });
    },
  },
};
</script>

<style lang="less" scoped>
.back {
  z-index: 100;
  position: absolute;
  top: -30px;
  right: 0;
}
.info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 20vh;
  padding: 0 30px;
  background-color: #fff;

  &-detail {
    width: 80%;
  }
  &-basic {
    width: 100%;

    li {
      display: inline-block;
      width: 33.33%;
      height: 4vh;
      line-height: 4vh;
    }
  }
  &-statis {
    display: flex;
    align-items: center;
    width: 100%;
    height: 8vh;
    border-top: @border-default;

    li {
      flex: 1;
      display: inline-flex;
      align-items: center;
      flex-direction: column;

      span + span {
        margin-top: 10px;
      }
      &.normal {
        color: #0cf115;
      }
      &.alarm {
        color: #f40909;
      }
      &.fail {
        color: #f44009;
      }
      &.defect {
        color: #f47b09;
      }
    }
  }
  &-progress {
    /deep/ .ant-progress-text {
      display: flex;
      align-items: center;
      flex-direction: column;

      span + span {
        margin-top: 5px;
      }
    }
  }
}
.table {
  width: 100%;

  &-header {
    display: flex;
    align-items: center;
    width: 100%;
    height: 4vh;
    padding: 0 10px;

    .ant-btn {
      margin-left: 10px;
      color: #fff;
      border-color: @theme-color3;
      background-color: @theme-color3;
    }
    .ant-select {
      width: 100px;
      margin-right: 10px;
    }
    .ant-checkbox-wrapper {
      margin-left: auto;
    }
    .ant-input-affix-wrapper {
      width: 200px;
    }
    .switch {
      display: inline-flex;
      align-items: center;
      margin-left: auto;
      white-space: nowrap;

      .ant-switch {
        margin-right: 5px;
      }
    }
  }
  /deep/ .ant-table {
    width: 100%;

    th {
      height: 5vh;
      padding: 0 10px;
      font-weight: bold;
      background-color: @theme-color6;
    }
    td {
      height: 4vh;
      padding: 0 10px;
    }
    &-wrapper {
      width: 100%;
      height: 30vh;
      background-color: #fff;
    }
    &-content {
      width: 100%;
      height: 26vh;
      overflow: hidden;
    }
    &-pagination {
      display: flex;
      align-items: center;
      height: 4vh;
      margin: 0 10px;
    }
    &-placeholder {
      border: none;
    }
    .operation {
      display: flex;
      align-items: center;
      justify-content: center;

      button + button {
        margin-left: 5px;
      }
    }
  }
}
.detector {
  display: flex;
  align-items: center;
  width: 100%;
  height: 50vh;

  .sg-empty {
    height: 47vh;
  }
  .ant-tabs-tabpane-active {
    height: 47vh;
  }
  &-tabs {
    width: 80%;
  }
  &-list {
    width: 100%;
    height: 47vh;
    overflow-y: auto;

    &__wrap {
      position: relative;
      width: 20%;
      height: 100%;
      border: 1px solid #eee;
      background-color: #fff;
    }
    &__header {
      height: 3vh;
      line-height: 3vh;
      text-align: center;
      border-bottom: 1px solid #eee;
    }
    li {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 3vh;
      line-height: 3vh;
      padding: 0 10px;
      cursor: pointer;

      &:hover,
      &.active {
        background-color: #ccc;
      }
      &.online {
        color: @link-color;
        .anticon {
          color: @link-color;
        }
      }
      &.offline {
        color: @disabled-color;
        pointer-events: none;
        cursor: not-allowed;
        .anticon {
          color: @disabled-color;
        }
      }
      > span {
        margin-left: 10px;
        max-width: 80%;
        .text-ellipsis();
      }
    }
  }
  &-monitor {
    .monitor-swiper {
      width: 100%;
      height: 100%;

      /deep/ .swiper-pagination {
        width: auto;
        left: 50%;
        transform: translateX(-50%);
      }
    }
  }
  &-map {
    position: relative;
    &__popup {
      z-index: 100;
      position: absolute;
      top: 5px;
      right: 5px;
    }
    &__info {
      width: 10vw;
      // list-style: square inside;

      li {
        width: 100%;
        .text-ellipsis();

        + li {
          margin-top: 1vh;
        }
      }
    }
  }
}

.history {
  width: 100%;
  height: 38vh;

  .sg-empty {
    height: 35vh;
  }
  .ant-tabs-tabpane-active {
    height: 35vh;
  }
  &-alarm {
    /deep/ .ant-table {
      width: 100%;

      th {
        height: 5vh;
        padding: 0 10px;
        font-weight: bold;
      }
      td {
        height: 5vh;
        padding: 0 10px;
      }
      &-wrapper {
        width: 100%;
        height: 35vh;
        background-color: #fff;
      }
      &-content {
        width: 100%;
        height: 31vh;
      }
      &-placeholder {
        border: none;
      }
      &-pagination {
        display: flex;
        align-items: center;
        height: 4vh;
        margin: 0 10px;
      }
      .operation {
        display: flex;
        align-items: center;
        justify-content: center;

        button + button {
          margin-left: 5px;
        }
      }
    }
  }
  &-voice {
    .voice-result {
      width: 100%;
      height: 35vh;

      /deep/ .ant-result {
        &-icon {
          margin-bottom: 0vh;
        }
        &-extra {
          margin-top: 1vh;
        }
        &-content {
          display: flex;
          justify-content: center;
          margin-top: 0vh;
        }
      }
    }
  }
  &-video {
    .video-player {
      width: 100%;
      height: 35vh;
    }
  }
  &-snapshot {
    .snapshot {
      &-swiper {
        width: 100%;
        height: 35vh;
        background-color: #fff;
      }
      &-chart {
        width: 100%;
        height: 35vh;
      }
      &-item {
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        padding: 10px;

        .el-image {
          width: 100%;
          height: 200px;
          margin-bottom: 10px;
          transform: none;

          &:hover {
            box-shadow: 0 0 10px #ccc;
            > img {
              object-fit: cover;
            }
          }
        }
      }
    }
  }
}
</style>
