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
            <div class="sg-view-title">机器人工况统计</div>
            <div class="sg-view-content">
              <sg-chart type="bar" :options="robotCondition" @sendkeys="getrobotCondition" />
            </div>
          </div>
          <div class="sg-view md">
            <div class="sg-view-title">机器人维护统计</div>
            <div class="sg-view-content">
              <sg-chart type="bar" :options="robotMaintain" @sendkeys="getrobotprotecttotal" />
            </div>
          </div>
        </a-col>
        <a-col class="sg-col" :span="8">
          <div class="sg-view md">
            <div class="sg-view-title">机器人类型统计</div>
            <div class="sg-view-content">
              <sg-chart type="pie" :options="robotType" @sendkeys="getrobottypestatistic2" />
            </div>
          </div>
          <div class="sg-view md">
            <div class="sg-view-title">机器人消缺统计</div>
            <div class="sg-view-content">
              <sg-chart type="pie" :options="robotAbsent" @sendkeys="robotfadetotal" />
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
import { DETECTOR_STATUS, ROBOTDETECTOR_STATUS, ROBOT_TYPE } from '@/enum';

export default {
  name: 'RobotApply',
  components: {
    SgTree,
    SgChart,
  },
  data() {
    return {
      stationId: '',
      stationName: '请选择站点',
      timeRange: [this.$moment().startOf('y'), this.$moment()],
      robotType: {
        legend: { top: 'middle', left: '80%', align: 'left', orient: 'vertical' },
        dataset: {
          source: [
            { name: '室内机器人', value: 16 },
            { name: '室外机器人', value: 21 },
          ],
        },
        series: [
          {
            type: 'pie',
            name: '机器人类型统计',
            center: ['40%', '50%'],
            radius: [0, '70%'],
          },
        ],
      },
      robotAbsent: {
        legend: { top: 'middle', left: '80%', align: 'left', orient: 'vertical' },
        dataset: {
          source: [
            { name: '已消缺', value: 15 },
            { name: '未消缺', value: 11 },
          ],
        },
        series: [
          {
            type: 'pie',
            name: '机器人消缺统计',
            center: ['40%', '50%'],
            radius: [0, '70%'],
          },
        ],
      },
      robotMaintain: {
        dataset: {
          source: Array.from({ length: 5 }, (_, index) => {
            return [`变电站${index + 1}`, this.$random(5)];
          }),
        },
        series: ['维护记录'].map((item, index) => ({
          type: 'bar',
          name: item,
          barMaxWidth: 30,
          label: { show: true, position: 'top' },
          encode: { x: 0, y: index + 1 },
        })),
      },
      robotCondition: {
        dataset: {
          source: Array.from({ length: 5 }, (_, index) => {
            const dataObj = Object.keys(ROBOTDETECTOR_STATUS).reduce(
              (acc, key) => ((acc[key] = this.$random(5)), acc),
              {}
            );
            return { name: `变电站${index + 1}`, ...dataObj };
          }),
        },
        series: Object.entries(ROBOTDETECTOR_STATUS).map(([key, val]) => ({
          type: 'bar',
          name: val,
          stack: '机器人工况',
          barMaxWidth: 30,
          label: {
            show: true,
            formatter: (params) => {
              const { data, encode, dimensionNames } = params;
              return data[dimensionNames[encode.y[0]]] || '';
            },
          },
          encode: { x: 'name', y: key },
        })),
      },
    };
  },
  created() {
    this.getStatisData();
  },
  methods: {
    // 机器人工况统计
    getrobotCondition(val) {
      this.$router.push({
        path: '/patrol/robot-manage',
        query: {
          substation_id: val.data.substation_id,
          status: val.seriesIndex + 1,
        },
      });
    },
    // 机器人维护统计
    getrobotprotecttotal(val) {
      this.$router.push({
        path: '/device/maintain-record',
        query: {
          substation_id: val.data[2],
        },
      });
    },
    //机器人消缺统计
    robotfadetotal(val) {
      this.$router.push({
        path: '/device/maintain-record',
        query: { maintDefect: val.data.key },
      });
    },
    getrobottypestatistic2(val) {
      this.$router.push({
        path: '/patrol/robot-manage',
        query: { type: val.data.key },
      });
    },
    handleQueryData() {
      this.getStatisData();
    },
    onTreeCheck(_, { node, checked }) {
      const { dataRef } = node;
      if (checked) {
        this.stationName = dataRef.name;
        this.stationId = dataRef.id;
      } else {
        this.stationName = '请选择站点';
        this.stationId = '';
      }
      // this.getStatisData();
    },
    getStatisData() {
      this.getRobotTypeData();
      this.getRobotDefectData();
      this.getRobotMaintainData();
      this.getRobotConditionData();
    },
    getRobotTypeData() {
      this.$api
        .getBaseApi('detector', { substation: this.stationId, dec_type__in: '1,2,3' })
        .then((res) => {
          if (!res || !res.results) return;
          let robotTypeMap = Object.entries(ROBOT_TYPE).reduce(
            (acc, [key, val]) => ((acc[key] = { name: val, value: 0, key: key }), acc),
            {}
          );
          res.results.forEach((item) => {
            const { dec_type } = item;
            if (robotTypeMap[dec_type]) robotTypeMap[dec_type].value += 1;
          });
          this.robotType.dataset.source = Object.values(robotTypeMap);
        });
    },
    getRobotDefectData() {
      this.$api.getBaseApi('detectormaintenancerecord').then((res) => {
        if (!res || !res.results) return;
        const robotDefectMap = {
          0: { name: '未消缺', value: 0, key: 0 },
          1: { name: '已消缺', value: 0, key: 1 },
        };
        res.results.forEach((item) => {
          const { elimination_status } = item;
          if (robotDefectMap[elimination_status]) robotDefectMap[elimination_status].value += 1;
        });
        this.robotAbsent.dataset.source = Object.values(robotDefectMap).reverse();
      });
    },
    getRobotMaintainData() {
      const timeRange = this.timeRange
        .map((date) => this.$moment(date).format('YYYY-MM-DD HH:mm:ss'))
        .join(',');
      const getRobotMaintainItem = (station, dataItem) => {
        return new Promise((resolve, reject) => {
          this.$api
            .getBaseApi('detectormaintenancerecord_count', {
              detectormaintenanceplan__substation: station.id,
              datetime__range: timeRange,
            })
            .then((res) => {
              if (!res) return resolve();
              dataItem[1] = res.count;
              resolve();
            })
            .catch((err) => reject(err));
        });
      };
      this.$api.getBaseApi('substation').then(async (res) => {
        if (!res || !res.results) return;
        const { count, results } = res;
        let robotData = results.map((item, key) => [item.name, 0, item.id]);
        for (let i = 0; i < count; i++) {
          const station = results[i];
          let robotItem = robotData[i];
          await getRobotMaintainItem(station, robotItem);
        }
        this.robotMaintain.dataset.source = robotData;
      });
    },
    getRobotConditionData() {
      const getRobotConditionItem = (station, dataItem) => {
        return new Promise((resolve, reject) => {
          this.$api
            .getBaseApi('detector', { substation: station.id, dec_type__in: '1,2,3' })
            .then((res) => {
              if (!res) return resolve();
              if (res.count > 0) {
                res.results.forEach((item) => {
                  const { status } = item;
                  if (!isNaN(dataItem[status])) dataItem[status]++;
                });
              }
              resolve();
            })
            .catch((err) => reject(err));
        });
      };
      this.$api.getBaseApi('substation').then(async (res) => {
        if (!res || !res.results) return;
        const { count, results } = res;
        const dataItem = Object.keys(ROBOTDETECTOR_STATUS).reduce(
          (acc, key) => ((acc[key] = 0), acc),
          {}
        );
        let robotData = results.map((item) => ({
          name: item.name,
          ...dataItem,
          substation_id: item.id,
        }));
        for (let i = 0; i < count; i++) {
          const station = results[i];
          const robotItem = robotData[i];
          await getRobotConditionItem(station, robotItem);
        }
        this.robotCondition.dataset.source = robotData;
      });
    },
  },
};
</script>
