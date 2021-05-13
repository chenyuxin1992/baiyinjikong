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
            <div class="sg-view-title">告警等级统计</div>
            <div class="sg-view-content">
              <sg-chart type="bar" :options="alarmLevel" @sendkeys="alarmlevelSt" />
            </div>
          </div>
          <div class="sg-view md">
            <div class="sg-view-title">告警设备统计</div>
            <div class="sg-view-content">
              <sg-chart type="bar" :options="alarmDevice" @sendkeys="alarmDev" />
            </div>
          </div>
        </a-col>
        <a-col class="sg-col" :span="8">
          <div class="sg-view md">
            <div class="sg-view-title">告警状态统计</div>
            <div class="sg-view-content">
              <sg-chart type="pie" :options="alarmState" @sendkeys="warningState" />
            </div>
          </div>
          <div class="sg-view md">
            <div class="sg-view-title">告警类型统计</div>
            <div class="sg-view-content">
              <sg-chart type="pie" :options="alarmType" @sendkeys="getAlarmType" />
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
import { ALARM_TYPE, ALARM_LEVEL, ALARM_STATUS, DEVICE_TYPE } from '@/enum';

export default {
  name: 'AlarmStatis',
  components: {
    SgTree,
    SgChart,
  },
  computed: {
    alarmLevels() {
      return Object.entries(ALARM_LEVEL).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
  },
  data() {
    return {
      stationId: '',
      stationName: '请选择站点',
      timeRange: [this.$moment().startOf('y'), this.$moment()],
      alarmType: {
        legend: { top: 'middle', left: '75%', orient: 'vertical', itemGap: 10 },
        dataset: {
          source: [
            { name: '超温告警', value: 16 },
            { name: '外观异常', value: 10 },
          ],
        },
        series: [
          {
            type: 'pie',
            name: '告警类型统计',
            center: ['40%', '50%'],
            radius: [0, '60%'],
          },
        ],
      },
      alarmState: {
        legend: { top: 'middle', left: '75%', orient: 'vertical' },
        dataset: {
          source: [
            { name: '已确认', value: 20 },
            { name: '未确认', value: 15 },
            { name: '转缺陷', value: 5 },
          ],
        },
        series: [
          {
            type: 'pie',
            name: '告警消缺统计',
            center: ['40%', '50%'],
            radius: [0, '60%'],
          },
        ],
      },
      alarmLevel: {
        color: ['#F7C709', '#F76809', '#F70909'],
        dataset: {
          source: Array.from({ length: 5 }, (_, index) => {
            const level1 = this.$random(20);
            const level2 = this.$random(10);
            const level3 = this.$random(5);
            return [`变电站${index + 1}`, level1, level2, level3];
          }),
        },
        series: Object.entries(ALARM_LEVEL).map(([key, val]) => ({
          type: 'bar',
          name: val,
          stack: '告警等级统计',
          barMaxWidth: 30,
          label: {
            show: true,
            formatter: (params) => {
              const { data, encode } = params;
              return data[encode.y[0]] || '';
            },
          },
          encode: { x: 'name', y: key },
        })),
      },
      alarmDevice: {
        color: '#F7C709',
        legend: { show: false },
        dataset: {
          source: Array.from({ length: 10 }, (_, index) => {
            return [`告警设备${index + 1}`, this.$random(100)];
          }),
        },
        series: [
          {
            type: 'bar',
            name: '告警设备统计',
            barMaxWidth: 30,
            label: { show: true, position: 'top' },
            encode: { x: 0, y: 1 },
          },
        ],
      },
    };
  },
  created() {
    this.getStatisData();
  },
  methods: {
    // 告警等级统计
    alarmlevelSt(val) {
      this.$router.push({
        path: '/statistics/alarm-query',
        query: {
          stationId: val.data.stationId,
          alarm_level: val.seriesIndex + 1,
        },
      });
    },
    // 告警设备统计
    alarmDev(val) {
      this.$router.push({
        path: '/statistics/alarm-query',
        query: {
          device_type: val.data.key,
        },
      });
    },
    // 告警类型统计
    getAlarmType(val) {
      this.$router.push({
        path: '/statistics/alarm-query',
        query: {
          alarm_type: val.dataIndex + 1,
        },
      });
    },

    warningState(val) {
      const chartdata = val;
      this.$router.push({
        path: '/statistics/alarm-query',
        query: { status: chartdata.data.key },
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
      const [timeStart, timeEnd] = this.timeRange.map((date) =>
        this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
      );
      this.getAlarmTypeData(timeStart, timeEnd);
      this.getAlarmLevelData(timeStart, timeEnd);
      this.getAlarmStateData(timeStart, timeEnd);
      this.getAlarmDeviceData(timeStart, timeEnd);
    },
    getAlarmTypeData(timeStart, timeEnd) {
      this.$api
        .postHistoryApi('alarmitems', '_search', {
          size: 0,
          query: {
            bool: {
              filter: [{ range: { record_time: { gte: timeStart, lte: timeEnd } } }],
              // must_not: { match: { alarm_type: '' } },
            },
          },
          aggs: { alarm_count: { terms: { field: 'alarm_type' } } },
          _source: { excludes: ['image'] },
          track_total_hits: true,
        })
        .then((res) => {
          if (!res) return;
          const alarmTypeMap = Object.entries(ALARM_TYPE).reduce(
            (acc, [key, val]) => ((acc[key] = { name: val, value: 0 }), acc),
            {}
          );
          const buckets = res.aggregations.alarm_count.buckets;
          buckets.forEach((item) => (alarmTypeMap[item.key].value = item.doc_count));
          this.alarmType.dataset.source = Object.values(alarmTypeMap);
        });
    },
    getAlarmLevelData(timeStart, timeEnd) {
      const getAlarmLevelItem = (station, dataItem) => {
        return new Promise((resolve, reject) => {
          this.$api
            .postHistoryApi('alarmitems', '_search', {
              size: 0,
              query: {
                bool: {
                  must: [{ match: { substation_id: station.id } }],
                  filter: [{ range: { record_time: { gte: timeStart, lte: timeEnd } } }],
                },
              },
              aggs: { alarm_count: { terms: { field: 'alarm_level' } } },
              _source: { excludes: ['image'] },
              track_total_hits: true,
            })
            .then((res) => {
              if (!res) return resolve();
              const buckets = res.aggregations.alarm_count.buckets;
              buckets.forEach((item) => (dataItem[item.key] = item.doc_count));
              resolve();
            })
            .catch((err) => reject(err));
        });
      };
      this.$api.getBaseApi('substation').then(async (res) => {
        if (!res || !res.results) return;
        let alarmLevelSource = [];
        const alarmLevelMap = Object.keys(ALARM_LEVEL).reduce(
          (acc, key) => ((acc[key] = 0), acc),
          {}
        );
        const { count, results } = res;
        for (let i = 0; i < count; i++) {
          const station = results[i];
          const alarmLevelItem = { ...alarmLevelMap, name: station.name, stationId: station.id };
          await getAlarmLevelItem(station, alarmLevelItem);
          alarmLevelSource.push(alarmLevelItem);
        }
        //告警等级统计超过10个截取前十个，小于10个显示所有
        if (alarmLevelSource.length <= 10 && alarmLevelSource != '') {
          this.alarmLevel.dataset.source = alarmLevelSource;
        } else {
          let before10alarmLevelSource = alarmLevelSource.slice(0, 10);
          this.alarmLevel.dataset.source = before10alarmLevelSource;
        }
      });
    },
    getAlarmStateData(timeStart, timeEnd) {
      this.$api
        .postHistoryApi('alarmitems', '_search', {
          size: 0,
          query: {
            bool: {
              filter: [
                { range: { record_time: { gte: timeStart, lte: timeEnd } } },
                { range: { status: { gte: 2, lte: 4 } } },
              ],
            },
          },
          aggs: { status_count: { terms: { field: 'status' } } },
          _source: { excludes: ['image'] },
          track_total_hits: true,
        })
        .then((res) => {
          if (!res) return;
          const alarmStatusMap = Object.entries(ALARM_STATUS).reduce(
            (acc, [key, val]) => ((acc[key] = { name: val, value: 0, key: key }), acc),
            {}
          );
          res.aggregations.status_count.buckets.forEach((item) => {
            if (alarmStatusMap[item.key]) {
              alarmStatusMap[item.key].value = item.doc_count;
            }
          });
          this.alarmState.dataset.source = Object.values(alarmStatusMap);
        });
    },
    getAlarmDeviceData(timeStart, timeEnd) {
      const alarmDeviceMap = Object.entries(DEVICE_TYPE).reduce(
        (acc, [key, val]) => ((acc[key] = [val, 0]), acc),
        {}
      );
      this.$api
        .postHistoryApi('alarmitems', '_search', {
          size: 0,
          query: {
            bool: {
              filter: [{ range: { record_time: { gte: timeStart, lte: timeEnd } } }],
            },
          },
          aggs: { alarm_count: { terms: { field: 'device_type' } } },
          _source: { excludes: ['image'] },
          track_total_hits: true,
        })
        .then((res) => {
          if (!res) return;
          const buckets = res.aggregations.alarm_count.buckets;
          // console.log(buckets,"bjuu")
          let source = [];
          // buckets.forEach(
          //   (item) => alarmDeviceMap[item.key] && (alarmDeviceMap[item.key][1] = item.doc_count)
          // );
          // this.alarmDevice.dataset.source = Object.values(alarmDeviceMap).slice(0, 10);
          buckets.forEach((item) => {
            source.push({
              name: alarmDeviceMap[item.key][0],
              value: item.doc_count,
              key: item.key,
            });
          });

          // 告警设备统计超过10个截取前十个，小于10个显示所有
          if (source.length <= 10 && source != '') {
            this.alarmDevice.dataset.source = source;
          } else {
            let before10alarmDeviceSource = source.slice(0, 10);
            this.alarmDevice.dataset.source = before10alarmDeviceSource;
          }
        });
    },
  },
};
</script>
