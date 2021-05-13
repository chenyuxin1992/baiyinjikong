<template>
  <a-row class="sg-row" :gutter="10">
    <a-col class="sg-col" :span="4">
      <sg-tree @check="onTreeCheck" />
    </a-col>
    <a-col class="sg-col" :span="20">
      <div class="sg-query">
        <span class="sg-query-item">
          <span>变电站:</span>
          <b class="sg-query-item__team">{{ stationName }}</b>
        </span>
        <span class="sg-query-item">
          <span>日期范围:</span>
          <a-range-picker v-model="timeRange" separator="至"></a-range-picker>
        </span>
        <a-button @click="handleQueryData">查询</a-button>
      </div>

      <a-row class="sg-row wrapper" :gutter="10">
        <a-col class="sg-col" :span="16">
          <div class="sg-view md">
            <div class="sg-view-title">巡视任务状态站点统计</div>
            <div class="sg-view-content">
              <sg-chart type="bar" :options="taskStateStation" @sendkeys="getTaskstationtotal" />
            </div>
          </div>
          <div class="sg-view md">
            <div class="sg-view-title">巡视任务类型站点统计</div>
            <div class="sg-view-content">
              <sg-chart type="bar" :options="taskTypeStation" @sendkeys="gettaskstationypetotal" />
            </div>
          </div>
        </a-col>
        <a-col class="sg-col" :span="8">
          <div class="sg-view md">
            <div class="sg-view-title">巡视任务状态统计</div>
            <div class="sg-view-content">
              <sg-chart type="pie" :options="taskStateStatis" @sendkeys="getKeys" />
            </div>
          </div>
          <div class="sg-view md">
            <div class="sg-view-title">巡视任务类型统计</div>
            <div class="sg-view-content">
              <sg-chart type="bar" :options="taskTypeStatis" @sendkeys="tasktypetotal" />
            </div>
          </div>
        </a-col>
      </a-row>
    </a-col>
  </a-row>
</template>

<script>
import SgChart from '@/components/Chart';
import SgTree from '@/components/Tree/Antd';
import { TASK_PATROL_TYPE, TASK_STATUS } from '@/enum';

export default {
  name: 'PatrolTask',
  components: {
    SgTree,
    SgChart,
  },
  data() {
    const colors = ['#11ee11', '#eec211', '#11c2ee', '#ee3d11', '#c211ee'];
    return {
      stationId: '',
      stationName: '请选择站点',
      timeRange: [this.$moment().startOf('y'), this.$moment()],
      taskTypeStatis: {
        grid: { top: '10%' },
        xAxis: {
          axisLine: { show: false },
          axisLabel: { show: true, color: (value, index) => colors[index] },
        },
        yAxis: { show: false },
        legend: { show: false },
        itemStyle: { color: (params) => colors[params.dataIndex] },
        dataset: {
          source: Object.values(TASK_PATROL_TYPE).map((item) => ({
            name: item,
            value: this.$random(10),
          })),
        },
        series: [
          {
            type: 'bar',
            name: '巡视任务类型统计',
            barMaxWidth: 40,
            label: {
              show: true,
              position: 'top',
            },
            encode: { x: 'name', y: 'value' },
          },
        ],
      },
      taskStateStatis: {
        legend: { top: 'middle', left: '80%', align: 'left', orient: 'vertical' },
        dataset: {
          source: Object.values(TASK_STATUS).map((item) => ({
            name: item,
            value: this.$random(10),
          })),
        },
        series: [
          {
            type: 'pie',
            name: '巡视任务状态统计',
            center: ['40%', '50%'],
            radius: [0, '70%'],
            label: { show: true, formatter: '{@name}-{@value}' },
          },
        ],
      },
      taskTypeStation: {
        dataset: {
          source: Array.from({ length: 5 }, (_, index) => {
            const dataObj = Object.keys(TASK_PATROL_TYPE).reduce(
              (acc, key) => ((acc[key] = this.$random(10)), acc),
              {}
            );
            return { name: `变电站${index + 1}`, ...dataObj };
          }),
        },
        series: Object.entries(TASK_PATROL_TYPE).map(([key, val]) => ({
          type: 'bar',
          name: val,
          barMaxWidth: 20,
          datasetIndex: 0,
          encode: { x: 'name', y: key },
        })),
      },
      taskStateStation: {
        dataset: {
          source: Array.from({ length: 5 }, (_, index) => {
            const dataObj = Object.keys(TASK_STATUS).reduce(
              (acc, key) => ((acc[key] = this.$random(10)), acc),
              {}
            );

            return { name: `变电站${index + 1}`, ...dataObj };
          }),
        },
        series: Object.entries(TASK_STATUS).map(([key, val]) => ({
          type: 'bar',
          name: val,
          barMaxWidth: 20,
          datasetIndex: 0,
          encode: { x: 'name', y: key },
        })),
      },
    };
  },
  created() {
    this.getStatisData();
  },
  methods: {
    getTaskstationtotal(val) {
      this.$router.push({
        path: '/patrol/task-manage',
        query: { substation_id: val.data.substation_id, state: val.seriesIndex + 1 },
      });
    },
    // 巡视任务站点类型统计
    gettaskstationypetotal(val) {
      this.$router.push({
        path: '/patrol/task-manage',
        query: { substation_id: val.data.substation_id, type: val.seriesIndex + 1 },
      });
    },
    // 巡视任务类型统计
    tasktypetotal(val) {
      this.$router.push({
        path: '/patrol/task-manage',
        query: {
          type: val.data.key,
        },
      });
    },
    getKeys(val) {
      this.$router.push({
        path: '/patrol/task-manage',
        query: {
          state: val.data.key,
        },
      });
    },
    handleQueryData() {
      this.getStatisData();
    },
    onTreeCheck(_, { node, event, checked }) {
      const { dataRef } = node;
      console.log(node, event);
      let params = [];
      if (checked) {
        this.stationName = dataRef.name;
        this.stationId = dataRef.id;
        params.push({ match: { substation_id: this.stationId } });
      } else {
        this.stationName = '请选择站点';
        this.stationId = '';
      }
      this.getTaskStatisData(params);
    },
    getStatisData() {
      this.getTaskStatisData();
      this.getTaskStationData();
    },
    getTaskStatisData() {
      const [timeStart, timeEnd] = this.timeRange.map((date) =>
        this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
      );
      this.$api
        .postHistoryApi('historytask', '_search', {
          size: 0,
          query: {
            bool: {
              filter: [{ range: { start_time: { gte: timeStart, lte: timeEnd } } }],
            },
          },
          aggs: {
            type_count: { terms: { field: 'type' } },
            status_count: { terms: { field: 'status' } },
          },
        })
        .then((res) => {
          if (!res) return;
          const { type_count, status_count } = res.aggregations;
          const taskTypeMap = Object.keys(TASK_PATROL_TYPE).reduce(
            (acc, key) => ((acc[key] = 0), acc),
            {}
          );
          if (type_count.buckets.length > 0) {
            type_count.buckets.forEach((item) => {
              if (item.key > 0) taskTypeMap[item.key] = item.doc_count;
            });
          }
          const taskStateMap = Object.keys(TASK_STATUS).reduce(
            (acc, key) => ((acc[key] = 0), acc),
            {}
          );
          if (status_count.buckets.length > 0) {
            console.log(status_count.buckets, '天外');
            status_count.buckets.forEach((item) => {
              if (item.key > 0) taskStateMap[item.key] = item.doc_count;
            });
          }
          this.taskTypeStatis.dataset.source = Object.entries(taskTypeMap).map(([key, val]) => ({
            name: TASK_PATROL_TYPE[key],
            value: val,
            key: key,
          }));
          this.taskStateStatis.dataset.source = Object.entries(taskStateMap).map(([key, val]) => ({
            name: TASK_STATUS[key],
            value: val,
            key: key,
          }));
        });
    },
    getTaskStationData() {
      const [timeStart, timeEnd] = this.timeRange.map((date) =>
        this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
      );
      this.$api.getBaseApi('substation').then(async (res) => {
        if (!res || !res.results) return;
        const taskStations = res.results.reduce(
          (acc, item) => ((acc[item.id] = item.name), acc),
          {}
        );
        //console.log(taskStations)
        this.$api
          .postHistoryApi('historytask', '_search', {
            size: 0,
            query: {
              bool: {
                filter: [{ range: { start_time: { gte: timeStart, lte: timeEnd } } }],
                must: this.stationId ? [{ match: { substation_id: this.stationId } }] : [],
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
                let taskTypeItem = Object.assign(
                  { name: taskStations[key] || `变电站名称${i + 1}` },
                  taskTypeMap,
                  { substation_id: key }
                );
                let taskStateItem = Object.assign(
                  { name: taskStations[key] || `变电站名称${i + 1}` },
                  taskStateMap,
                  { substation_id: key }
                );

                type_count.buckets.forEach((item) => (taskTypeItem[item.key] = item.doc_count));

                status_count.buckets.forEach((item) => (taskStateItem[item.key] = item.doc_count));

                taskTypeData.push(taskTypeItem);

                taskStateData.push(taskStateItem);
              }
            }
            // 巡视任务状态站点统计超过10个截取前十个，小于10个显示所有
            if (taskStateData.length <= 10 && taskStateData != '') {
              this.taskStateStation.dataset.source = taskStateData;
            } else {
              let before10taskStation = taskStateData.slice(0, 10);
              this.taskStateStation.dataset.source = before10taskStation;
            }
            if (taskTypeData.length <= 10 && taskTypeData != '') {
              this.taskTypeStation.dataset.source = taskTypeData;
            } else {
              let before10taskTypeData = taskTypeData.slice(0, 10);
              this.taskTypeStation.dataset.source = before10taskTypeData;
            }
          });
      });
    },
  },
};
</script>
