<template>
  <div id="overview">
    <a-radio-group
      v-model="timeRadio"
      class="time-radio"
      size="small"
      button-style="solid"
      @change="onTimeRadioChange"
    >
      <a-radio-button v-for="item in timeOptions" :key="item.value" :value="item.value">
        {{ item.label }}
      </a-radio-button>
    </a-radio-group>
    <a-row class="sg-row" :gutter="10">
      <a-col class="sg-col" :span="6">
        <div class="sg-view sm">
          <div class="sg-view-title">
            国网白银供电公司银城集控站
            <!-- <button
              style="cursor: pointer; position: absolute; left: 20rem"
              @click="newPage()"
              v-bind:title="data2"
            >
              ↺
            </button>
            <button
              style="cursor: pointer; position: absolute; left: 21rem"
              @click="showMessage()"
              v-bind:title="data1"
            >
              ✉
            </button> -->
          </div>
          <div class="sg-view-content">
            <ul class="station">
              <li class="station-item">
                <sg-icon name="substation" style="background-color: #f4ecec" />
                <span>变电站</span>
                <span class="station-item__count">{{ basicStatis.station.count }}</span>
                <a-popover
                  title="变电站列表"
                  trigger="click"
                  placement="rightTop"
                  overlay-class-name="sg-popover station"
                  @visibleChange="onPopoverToggle($event, 'station')"
                >
                  <a-icon class="station-item__more" type="more" />
                  <template #content>
                    <a-table
                      size="small"
                      row-key="id"
                      :scroll="{ x: 500, y: 500 }"
                      :loading="basicStatis.station.loading"
                      :columns="basicStatis.station.columns"
                      :data-source="basicStatis.station.data"
                      :pagination="false"
                      bordered
                    ></a-table>
                  </template>
                </a-popover>
              </li>
              <li class="station-item">
                <sg-icon name="robot" style="background-color: #bce0ee" />
                <span>机器人</span>
                <span class="station-item__count">{{ basicStatis.robot.count }}</span>
                <a-popover
                  title="机器人列表"
                  trigger="click"
                  placement="rightTop"
                  overlay-class-name="sg-popover station"
                  @visibleChange="onPopoverToggle($event, 'robot')"
                >
                  <a-icon class="station-item__more" type="more" />
                  <template #content>
                    <a-table
                      size="small"
                      row-key="id"
                      :scroll="{ x: 500, y: 500 }"
                      :loading="basicStatis.robot.loading"
                      :columns="basicStatis.robot.columns"
                      :data-source="basicStatis.robot.data"
                      :pagination="false"
                      bordered
                    ></a-table>
                  </template>
                </a-popover>
              </li>
              <li class="station-item">
                <sg-icon name="camera" style="background-color: #f0f0c6" />
                <span>摄像机</span>
                <span class="station-item__count">{{ basicStatis.camera.count }}</span>
                <a-popover
                  title="摄像机列表"
                  trigger="click"
                  placement="rightTop"
                  overlay-class-name="sg-popover station"
                  @visibleChange="onPopoverToggle($event, 'camera')"
                >
                  <a-icon class="station-item__more" type="more" />
                  <template #content>
                    <a-table
                      size="small"
                      row-key="id"
                      :scroll="{ x: 500, y: 500 }"
                      :loading="basicStatis.camera.loading"
                      :columns="basicStatis.camera.columns"
                      :data-source="basicStatis.camera.data"
                      :pagination="false"
                      bordered
                    ></a-table>
                  </template>
                </a-popover>
              </li>
            </ul>
          </div>
        </div>
        <div class="sg-view sm">
          <div class="sg-view-title">机器人工况</div>
          <div class="sg-view-content">
            <sg-chart
              type="pie"
              @sendkeys="getkeys"
              :options="robotStatis"
              :title="title"
              :statusArray="statusArray"
            />
          </div>
        </div>
        <div class="sg-view sm">
          <div class="sg-view-title">视频设备统计</div>
          <camera-statis class="sg-view-content" />
        </div>
      </a-col>
      <a-col class="sg-col" :span="12">
        <div class="sg-view xl">
          <div class="sg-view-title">站点导航</div>
          <div class="sg-view-content">
            <sg-bmap />
          </div>
        </div>
        <div class="sg-view sm">
          <div class="sg-view-title">
            <span>巡视任务统计</span>
            <a-radio-group
              default-value="type"
              size="small"
              button-style="solid"
              v-model="radiovalue"
              @change="onTaskRadioChange"
            >
              <a-radio-button value="type">巡视类型</a-radio-button>
              <a-radio-button value="state">任务状态</a-radio-button>
            </a-radio-group>
          </div>
          <div class="sg-view-content">
            <sg-chart type="bar" :options="taskStatis" @sendkeys="getTasktotal" />
          </div>
        </div>
      </a-col>
      <a-col class="sg-col" :span="6">
        <div class="sg-view sm">
          <div class="sg-view-title">巡视告警统计</div>
          <div class="sg-view-content">
            <sg-chart type="pie" :options="alarmStatis" @sendkeys="getWarning" />
          </div>
        </div>
        <div class="sg-view sm">
          <div class="sg-view-title">缺陷等级统计</div>
          <div class="sg-view-content">
            <sg-chart type="funnel" :options="defectStatis" @sendkeys="getLevel" />
          </div>
        </div>
        <div class="sg-view sm">
          <div class="sg-view-title">
            <span>视频设备状态</span>
          </div>
          <div class="sg-view-content">
            <sg-chart type="pie" :options="cameraStatis" @sendkeys="camerastatus" />
          </div>
        </div>
      </a-col>
      <a-modal v-model="messageModal" title="系统运行信息" dialogClass="sg-modal" centered>
        <a-form-model class="sg-form" :label-col="{ span: 6 }" :wrapper-col="{ span: 17 }">
          <div>系统告警：{{ sysAlarm }}</div>
          <a-form-model-item
            v-for="(val, key) in statusData"
            class="col-12"
            :label="key"
            :key="key"
          >
            <a>{{ val }}</a>
          </a-form-model-item>
        </a-form-model>
        <template #footer>
          <a-button type="primary" @click="messageModal = false">确认</a-button>
        </template>
      </a-modal>
    </a-row>
  </div>
</template>

<script>
import SgBmap from '@/components/Map/BMap';
import SgChart from '@/components/Chart';
import CameraStatis from '@/components/Statistics/CameraStatis';
import {
  TASK_PATROL_TYPE,
  TASK_STATUS,
  DETECTOR_STATUS,
  ROBOTDETECTOR_STATUS,
  ALARM_LEVEL,
} from '@/enum';
import router from '@/router';
import element from '@/mixins/element';

export default {
  name: 'Overview',
  components: {
    SgBmap,
    SgChart,
    CameraStatis,
  },
  data() {
    return {
      tasktotal: '',
      camerastate: {}, // 获取视频设备状态
      getlevel: {}, //获取缺陷等级等级
      getwarning: {}, // 获取巡视告警信息
      getcharts: {}, //获取子组件传来的数据
      statusArray: [],
      title: '机器人工况',
      timeRadio: 1,
      radiovalue: 'type',
      messageModal: false,
      statusData: { cpu: '12345', 内存: '16G', 硬盘: '4T' },
      sysAlarm: '暂无告警',
      data1: '系统运行信息',
      data2: '系统进程信息',
      timeStart: this.$moment().startOf('M').format('YYYY-MM-DD HH:mm:ss'),
      timeEnd: this.$current(),
      timeOptions: [
        { label: '本月', value: 1 },
        { label: '本周', value: 2 },
        { label: '当日', value: 3 },
        { label: '上月', value: 4 },
        { label: '上周', value: 5 },
        { label: '昨日', value: 6 },
      ],
      basicStatis: {
        robot: {
          loading: false,
          count: 0,
          data: [],
          columns: [
            { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
            { title: '机器人名称', dataIndex: 'name', align: 'center', width: 200 },
            { title: '生产厂家', dataIndex: 'manufacturer', align: 'center', width: 200 },
          ],
        },
        camera: {
          loading: false,
          count: 0,
          data: [],
          columns: [
            { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
            { title: '摄像机名称', dataIndex: 'name', align: 'center', width: 200 },
            { title: '所属变电站', dataIndex: 'substation.name', align: 'center', width: 200 },
          ],
        },
        station: {
          loading: false,
          count: 0,
          data: [],
          columns: [
            { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
            { title: '变电站名称', dataIndex: 'name', align: 'center', width: 200 },
            // { title: '变电站信息', dataIndex: 'parent', align: 'center', width: 200 },
          ],
        },
      },
      robotStatis: {
        dataset: {
          source: [
            // { name: '离线', value: 1 },
            // { name: '空闲', value: 1 },
            // { name: '巡视', value: 1 },
            // { name: '充电', value: 1 },
            // { name: '检修', value: 1 },
          ],
        },
        series: {
          type: 'pie',
          name: '机器人工况统计',
          center: ['50%', '60%'],
          radius: [0, '60%'],
          label: {
            show: true,
            formatter: '{@name}-{@value}',
          },
        },
      },
      cameraStatis: {
        dataset: {
          source: [
            // { name: '在线设备', value: 5006 },
            // { name: '离线设备', value: 4 },
          ],
        },
        series: {
          type: 'pie',
          name: '视频设备工况',
          center: ['50%', '60%'],
          radius: [0, '60%'],
          label: { show: true, formatter: '{@name}-{@value}' },
        },
      },
      taskStatis: {
        dataset: [
          {
            source: [],
            //  Array.from({ length: 5 }, (_, index) => {
            //   const dataObj = Object.keys(TASK_PATROL_TYPE).reduce(
            //     (acc, key) => ((acc[key] = this.$random(10)), acc),
            //     {}
            //   );
            //   return { name: `变电站${index + 1}`, ...dataObj };
            // }),
          },
          {
            source: [],
            //  Array.from({ length: 5 }, (_, index) => {
            //   const dataObj = Object.keys(TASK_STATUS).reduce(
            //     (acc, key) => ((acc[key] = this.$random(10)), acc),
            //     {}
            //   );
            //   return { name: `变电站${index + 1}`, ...dataObj };
            // }),
          },
        ],
        series: [],
        dataindex: 0,
      },
      alarmStatis: {
        color: ['#F70909', '#F76809', '#F7C709'],
        dataset: {
          source: [
            // { name: '一般', value: 21 },
            // { name: '严重', value: 16 },
            // { name: '危急', value: 4 },
          ],
        },
        series: [
          {
            type: 'pie',
            name: '巡视告警统计',
            center: ['50%', '60%'],
            radius: [0, '60%'],
            label: { show: true, formatter: '{@name}-{@value}' },
            // labelLine: {
            //   show: false,
            //   length: 10,
            //   length2: 0,
            // },
          },
        ],
      },
      defectStatis: {
        color: ['#F7C709', '#F76809', '#F70909'],
        dataset: {
          source: [
            // { name: '一般', value: 44 },
            // { name: '严重', value: 18 },
            // { name: '危急', value: 4 },
          ],
        },
        series: [
          {
            type: 'funnel',
            name: '缺陷等级统计',
            sort: 'ascending',
            top: '20%',
            left: '20%',
            right: '20%',
            bottom: '10%',
            minSize: '50%',
            maxSize: '100%',
            label: { show: true, position: 'inside', formatter: '{@name}-{@value}' },
          },
        ],
      },
      monitorStatis: {
        grid: { top: 0, bottom: 0 },
        xAxis: { type: 'value', show: false },
        yAxis: {
          type: 'category',
          positon: 'left',
          inverse: true,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: true },
          splitLine: { show: false },
        },
        legend: {
          show: false,
        },
        dataset: {
          source: [],
        },
        series: [
          {
            type: 'bar',
            name: '设备在线时长统计',
            barMaxWidth: 20,
            showBackground: true,
            label: { show: true },
            encode: { x: 1, y: 0 },
          },
        ],
      },
      monitorStates: {
        xAxis: {
          type: 'value',
          axisLine: { show: false },
          axisLabel: { show: false },
        },
        yAxis: {
          type: 'category',
          inverse: true,
          axisLine: { show: false },
          splitLine: { show: false },
        },
        dataset: {
          source: [
            ['运维班A', 1, 51],
            ['运维班B', 10, 40],
            ['运维班C', 12, 34],
            ['运维班D', 13, 25],
          ],
        },
        series: [
          {
            type: 'bar',
            name: '在线设备',
            stack: '视频设备状态',
            barMaxWidth: 20,
            label: {
              show: true,
              formatter: (params) => {
                const { data, encode } = params;
                return data[encode.x[0]] || '';
              },
            },
            encode: { x: 1, y: 0 },
          },
          {
            type: 'bar',
            name: '离线设备',
            stack: '视频设备状态',
            barMaxWidth: 20,
            label: {
              show: true,
              formatter: (params) => {
                const { data, encode } = params;
                return data[encode.x[0]] || '';
              },
            },
            encode: { x: 2, y: 0 },
          },
        ],
      },
    };
  },
  created() {
    this.getBasicStatisData();
    this.getRangeStatisData();
    this.getRobotStatisData();
    this.getCameraStatisData();
    this.onWebsocketPush();
  },
  beforeDestroy() {
    this.$bus.$off('stomp');
  },
  methods: {
    //巡视任务统计
    getTasktotal(val) {
      if (this.radiovalue === 'type') {
        this.$router.push({
          path: '/patrol/task-manage',
          query: {
            substation_id: val.data.substation_id,
            type: val.seriesIndex + 1,
          },
        });
      }

      if (this.radiovalue === 'state') {
        this.$router.push({
          path: '/patrol/task-manage',
          query: {
            substation_id: val.data.substation_id,
            state: val.seriesIndex + 1,
          },
        });
      }
    },
    // 机器人工况查询
    getkeys(val) {
      // this.$router.push({
      //   path: 'patrol/robot-manage',
      //   query: { status: val.data.key },
      // });
    },
    // 缺陷等级统计
    getLevel(val) {
      this.getlevel = val;
      this.$router.push({
        path: 'statistics/defect-query',
        query: { alarm_level: this.getlevel.data.key },
      });
    },
    // 巡视告警统计
    getWarning(val) {
      const chartdata = val;
      this.$router.push({
        path: 'statistics/alarm-query',
        query: { alarm_level: chartdata.data.key },
      });
    },

    // 视频设备状态
    camerastatus(val) {
      this.camerastate = val;
      this.$router.push({
        path: 'monitor/integrate',
      });
    },
    onTimeRadioChange(e) {
      switch (e.target.value) {
        case 1:
          this.timeStart = this.$moment().startOf('M').format('YYYY-MM-DD HH:mm:ss');
          this.timeEnd = this.$current();
          break;
        case 2:
          this.timeStart = this.$moment().startOf('w').format('YYYY-MM-DD HH:mm:ss');
          this.timeEnd = this.$current();
          break;
        case 3:
          this.timeStart = this.$moment().startOf('d').format('YYYY-MM-DD HH:mm:ss');
          this.timeEnd = this.$current();
          break;
        case 4:
          this.timeStart = this.$moment()
            .subtract(1, 'M')
            .startOf('M')
            .format('YYYY-MM-DD HH:mm:ss');
          this.timeEnd = this.$moment().subtract(1, 'M').endOf('M').format('YYYY-MM-DD HH:mm:ss');
          break;
        case 5:
          this.timeStart = this.$moment()
            .subtract(1, 'w')
            .startOf('w')
            .format('YYYY-MM-DD HH:mm:ss');
          this.timeEnd = this.$moment().subtract(1, 'w').endOf('w').format('YYYY-MM-DD HH:mm:ss');
          break;
        case 6:
          this.timeStart = this.$moment()
            .subtract(1, 'd')
            .startOf('d')
            .format('YYYY-MM-DD HH:mm:ss');
          this.timeEnd = this.$moment().subtract(1, 'd').endOf('d').format('YYYY-MM-DD HH:mm:ss');
          break;
        default:
          break;
      }
      console.log(this.timeStart, this.timeEnd);
      this.getRangeStatisData();
    },
    onTaskRadioChange(e) {
      if (e.target.value === 'type') {
        this.taskStatis.series = Object.entries(TASK_PATROL_TYPE).map(([key, val]) => ({
          type: 'bar',
          name: val,
          barMaxWidth: 20,
          datasetIndex: 0,
          encode: { x: 'name', y: key },
        }));
      } else {
        this.taskStatis.series = Object.entries(TASK_STATUS).map(([key, val]) => ({
          type: 'bar',
          name: val,
          barMaxWidth: 20,
          datasetIndex: 1,
          encode: { x: 'name', y: key },
        }));
      }
    },
    onWebsocketPush() {
      this.$bus.$on('stomp', (msg) => {
        const { action, content } = msg;
        if (action == 110) {
          this.sysAlarm = content;
        }
      });
    },
    onPopoverToggle(visible, type) {
      if (!visible) return;
      switch (type) {
        case 'robot':
          if (!this.basicStatis.robot.data.length) {
            this.basicStatis.robot.loading = true;
            this.$api
              .getBaseApi('detector', { dec_type__in: '1,2,3' })
              .then((res) => {
                if (!res) return;
                this.basicStatis.robot.data = res.results.map((item, index) => ({
                  ...item,
                  index: ++index,
                }));
              })
              .finally(() => (this.basicStatis.robot.loading = false));
          }
          break;
        case 'camera':
          if (!this.basicStatis.camera.data.length) {
            this.basicStatis.camera.loading = true;
            this.$api
              .getBaseApi('detector_depth', { ordering: '-substation',dec_type: 10, page_size: 6000 })
              .then((res) => {
                if (!res) return;
                this.basicStatis.camera.data = res.results.map((item, index) => ({
                  ...item,
                  index: ++index,
                }));
              })
              .finally(() => (this.basicStatis.camera.loading = false));
          }
          break;
        case 'station':
          if (!this.basicStatis.station.data.length) {
            this.basicStatis.station.loading = true;
            this.$api
              .getBaseApi('substation')
              .then((res) => {
                if (!res) return;
                this.basicStatis.station.data = res.results.map((item, index) => ({
                  ...item,
                  index: ++index,
                }));
              })
              .finally(() => (this.basicStatis.station.loading = false));
          }
          break;
        default:
          break;
      }
    },
    getBasicStatisData() {
      Promise.all([
        this.$api.getBaseApi('substation_count'),
        this.$api.getBaseApi('detector_count', { dec_type: 10 }),
        this.$api.getBaseApi('detector_count', { dec_type__in: '1,2,3' }),
      ]).then(([res1, res2, res3]) => {
        this.basicStatis.station.count = res1.count;
        this.basicStatis.camera.count = res2.count;
        this.basicStatis.robot.count = res3.count;
      });
    },
    getRobotStatisData() {
      this.$api.getBaseApi('detector', { dec_type__in: '1,2,3' }).then((res) => {
        if (!res || !res.results) return;
        let robotStatisMap = Object.entries(ROBOTDETECTOR_STATUS).reduce(
          (acc, [key, val]) => ((acc[key] = { name: val, value: 0, key: key }), acc),
          {}
        );
        this.statusArray = res.results;
        res.results.forEach((item) => {
          const { status } = item;
          if (robotStatisMap[status]) robotStatisMap[status].value += 1;
        });
        this.robotStatis.dataset.source = Object.values(robotStatisMap);
      });
    },
    getCameraStatisData() {
      this.$api.getBaseApi('detector', { dec_type: 10, page_size: 6000 }).then((res) => {
        if (!res || !res.results) return;
        let cameraStatis = {
          0: { name: '离线设备', value: 0 },
          1: { name: '在线设备', value: 0 },
        };
        // let cameraMap = Object.entries(PATROLHOST_STATUS).reduce((aa,[key,val]) => ((aa[key] = { name: val,value:0,key:key}),aa))
        for (const item of res.results) {
          const { status } = item;
          // console.log({status},857857)
          if (cameraStatis[status]) {
            cameraStatis[status].value += 1;
          }
        }
        this.cameraStatis.dataset.source = Object.values(cameraStatis);
      });
    },
    getRangeStatisData() {
      this.getTaskStatisData();
      this.getAlarmStatisData();
      this.getDefectStatisData();
    },
    getTaskStatisItem(dataItem, typeItem, stateItem) {
      return new Promise((resolve, reject) => {
        this.$api
          .postHistoryApi('historytask', '_search', {
            query: {
              bool: {
                must: [{ match: { substation_id: dataItem.id } }],
                filter: [{ range: { start_time: { gt: this.timeStart, lt: this.timeEnd } } }],
              },
            },
            _source: { excludes: ['image'] },
            track_total_hits: true,
          })
          .then((res) => {
            if (!res) return;
            if (res.hits.total.value > 0) {
              res.hits.hits.forEach((item) => {
                const { type, status } = item['_source'];
                if (!isNaN(typeItem[type])) typeItem[type]++;
                if (!isNaN(stateItem[status])) stateItem[status]++;
              });
            }
            typeItem.station = dataItem.name;
            stateItem.station = dataItem.name;
            resolve();
          })
          .catch((err) => reject(err));
      });
    },
    getTaskStatisData() {
      this.$api.getBaseApi('substation').then(async (res) => {
        if (!res || !res.results) return;
        const taskStations = res.results.reduce(
          (acc, item) => ((acc[item.id] = item.name), acc),
          {}
        );
        this.$api
          .postHistoryApi('historytask', '_search', {
            query: {
              bool: {
                filter: [{ range: { start_time: { gt: this.timeStart, lt: this.timeEnd } } }],
              },
            },
            aggs: {
              task_count: {
                terms: { field: 'substation_id' },
                aggs: {
                  type_count: { terms: { field: 'type' } },
                  status_count: { terms: { field: 'status' } },
                },
              },
            },
            //_source: { excludes: ['image'] },
            track_total_hits: true,
            size: 0,
          })
          .then((res) => {
            if (!res) return;
            const buckets = res.aggregations.task_count.buckets;
            let taskTypeData = [],
              taskStateData = [];
            if (buckets.length > 0) {
              const taskTypeMap = Object.keys(TASK_PATROL_TYPE).reduce(
                (acc, key) => ((acc[key] = 0), acc),
                {}
              );
              const taskStateMap = Object.keys(TASK_STATUS).reduce(
                (acc, key) => ((acc[key] = 0), acc),
                {}
              );
              for (let i = 0, len = buckets.length; i < len; i++) {
                const { key, type_count, status_count } = buckets[i];
                let stationKeys = Object.keys(taskStations);
                stationKeys.find((element, index) => {
                  if (element == key) {
                    let taskTypeItem = Object.assign(
                      { name: taskStations[key] || '变电站名称' },
                      taskTypeMap,
                      { substation_id: key }
                    );
                    let taskStateItem = Object.assign(
                      { name: taskStations[key] || '变电站名称' },
                      taskStateMap,
                      { substation_id: key }
                    );

                    type_count.buckets.forEach((item) => (taskTypeItem[item.key] = item.doc_count));
                    status_count.buckets.forEach(
                      (item) => (taskStateItem[item.key] = item.doc_count)
                    );
                    taskTypeData.push(taskTypeItem);
                    taskStateData.push(taskStateItem);
                  }
                });
                // let taskTypeItem = Object.assign(
                //   { name: taskStations[key] || '变电站名称' },
                //   taskTypeMap,
                //   { substation_id: key }
                // );
                // console.log(taskTypeItem,'舒服舒服')
                // let taskStateItem = Object.assign(
                //   { name: taskStations[key] || '变电站名称' },
                //   taskStateMap,
                //   { substation_id: key }
                // );
                // console.log( type_count.buckets,'陆逊')
                // type_count.buckets.forEach((item) => (taskTypeItem[item.key] = item.doc_count));

                // status_count.buckets.forEach((item) => (taskStateItem[item.key] = item.doc_count));
                // taskTypeData.push(taskTypeItem);
                // taskStateData.push(taskStateItem);
              }
            }
            // console.log(taskTypeData, '天马流星拳');
            // console.log(taskStateData, '螺旋丸');
            // 巡视任务统计类型超过10个截取前十个，小于10个显示所有
            if (taskTypeData <= 10 && taskTypeData != '') {
              this.taskStatis.dataset = [{ source: taskTypeData }, { source: taskStateData }];
            } else {
              let before10taskTypeData = taskTypeData.slice(0, 10);
              this.taskStatis.dataset = [
                { source: before10taskTypeData },
                { source: taskStateData },
              ];
            }
            // 巡视任务统计状态超过10个截取前十个，小于10个显示所有
            if (taskStateData <= 10 && taskStateData != '') {
              this.taskStatis.dataset = [{ source: taskTypeData }, { source: taskStateData }];
            } else {
              let before10taskStateData = taskStateData.slice(0, 10);
              this.taskStatis.dataset = [
                { source: taskTypeData },
                { source: before10taskStateData },
              ];
            }
          })
          .finally(() => {
            this.taskStatis.series = Object.entries(TASK_PATROL_TYPE).map(([key, val]) => ({
              type: 'bar',
              name: val,
              barMaxWidth: 20,
              datasetIndex: 0,
              encode: { x: 'name', y: key },
            }));
          });
      });
    },
    getAlarmStatisData() {
      this.$api
        .postHistoryApi('alarmitems', '_search', {
          query: {
            bool: {
              filter: [
                { range: { record_time: { gt: this.timeStart, lt: this.timeEnd } } },
                { range: { status: { gte: 2, lte: 3 } } },
              ],
            },
          },
          aggs: { alarm_count: { terms: { field: 'alarm_level' } } },
          track_total_hits: true,
          size: 0,
        })
        .then((res) => {
          if (!res) return;
          const buckets = res.aggregations.alarm_count.buckets;
          let source = [];
          buckets.forEach((item) => {
            source.push({
              name: ALARM_LEVEL[item.key],
              value: item.doc_count,
              key: item.key,
            });
          });
          this.alarmStatis.dataset.source = source;
        });
    },
    getDefectStatisData() {
      this.$api
        .postHistoryApi('alarmitems', '_search', {
          query: {
            bool: {
              must: [{ match: { status: 4 } }],
              filter: [{ range: { find_time: { gte: this.timeStart, lte: this.timeEnd } } }],
            },
          },
          aggs: { alarm_count: { terms: { field: 'alarm_level' } } },
          track_total_hits: true,
        })
        .then((res) => {
          if (!res) return;
          const buckets = res.aggregations.alarm_count.buckets;
          let source = [];
          buckets.forEach((item) => {
            source.push({
              name: ALARM_LEVEL[item.key],
              value: item.doc_count,
              key: item.key,
            });
          });
          this.defectStatis.dataset.source = source;
        });
    },
    newPage() {
      window.open(`http://${location.hostname}:9000`);
    },
    showMessage() {
      this.sysAlarm = '暂无告警';
      // 无用的接口已注释
      // this.$api
      //   .getStatusApi()
      //   .then((res) => {
      //     console.log(res,'江南')
      //     //if(!res) return;
      //     this.statusData = res;
      //     console.log(this.statusData);
      //   })
      //   .finally();
      this.messageModal = true;
    },
  },
};
</script>

<style lang="less" scoped>
#overview {
  position: relative;
  width: 100%;
  height: 100%;
}

.time-radio {
  z-index: 100;
  position: absolute;
  top: -30px;
  right: 0;
}

.station {
  width: 100%;
  height: 100%;

  &-item {
    display: flex;
    align-items: center;
    width: 100%;
    height: 33.33%;

    + .station-item {
      border-top: @border-default;
    }

    .sg-icon {
      padding: 5px;
      margin-right: 10px;
      color: #aaa;
      font-size: 30px;
      border-radius: 5px;
    }
    &__count {
      margin-left: auto;
      color: #000;
      font-size: 24px;
      font-weight: 600;
    }
    &__more {
      margin-left: 10px;
      font-size: 20px;
      cursor: pointer;
    }
  }
}
</style>
