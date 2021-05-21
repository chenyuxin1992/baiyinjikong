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
            <div class="sg-view-title">缺陷汇总统计</div>
            <div class="sg-view-content">
              <sg-chart type="bar" :options="defectStatis" @sendkeys="defectAll" />
            </div>
          </div>
          <div class="sg-view md">
            <div class="sg-view-title">告警转缺陷统计</div>
            <div class="sg-view-content">
              <sg-chart type="bar" :options="defectAlarm" @sendkeys="changeType" />
            </div>
          </div>
        </a-col>
        <a-col class="sg-col" :span="8">
          <div class="sg-view md">
            <div class="sg-view-title">缺陷等级统计</div>
            <div class="sg-view-content">
              <sg-chart type="funnel" :options="defectLevel" @sendkeys="getLevel" />
            </div>
          </div>
          <div class="sg-view md">
            <div class="sg-view-title">缺陷设备统计</div>
            <div class="sg-view-content">
              <sg-chart type="pie" :options="defectDevice" @sendkeys="getKeys" />
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
import { ALARM_LEVEL, DEVICE_TYPE } from '@/enum';

export default {
  name: 'DefectInfo',
  components: {
    SgTree,
    SgChart,
  },
  data() {
    return {
      stationId: '',
      stationName: '请选择站点',
      timeRange: [this.$moment().startOf('y'), this.$moment()],
      defectAlarm: {
        color: ['#F7C709', '#F76809'],
        dataset: {
          source: [],
          //  Array.from({ length: 5 }, (_, index) => {
          //   const alarm1 = this.$random(10);
          //   const alarm2 = this.$random(5);
          //   return [`变电站${index + 1}`, alarm1, alarm2];
          // }),
        },
        series: ['告警转缺陷', '告警误报率'].map((item, index) => ({
          type: 'bar',
          name: item,
          barMaxWidth: 30,
          label: { show: true, position: 'top' },
          encode: { x: 0, y: index + 1 },
        })),
      },
      defectLevel: {
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
      defectDevice: {
        legend: { top: 'middle', left: '75%', align: 'left', orient: 'vertical', itemGap: 10 },
        dataset: {
          source: [
            // { name: '断路器', value: 20 },
            // { name: '隔离开关', value: 15 },
            // { name: '油浸变压器', value: 5 },
          ],
        },
        series: [
          {
            type: 'pie',
            name: '缺陷设备统计',
            center: ['40%', '50%'],
            radius: [0, '60%'],
          },
        ],
      },
      defectStatis: {
        color: ['#F7C709', '#F76809', '#F70909'],
        dataset: {
          source: [],
          //  Array.from({ length: 5 }, (_, index) => {
          //   const level1 = this.$random(20);
          //   const level2 = this.$random(10);
          //   const level3 = this.$random(5);
          //   return [`变电站${index + 1}`, level1, level2, level3];
          // }),
        },
        series: Object.entries(ALARM_LEVEL).map(([key, val]) => ({
          type: 'bar',
          name: val,
          stack: '缺陷汇总统计',
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
    };
  },
  created() {
    this.getStatisData();
  },
  methods: {
    // 缺陷汇总统计
    defectAll(val) {
      this.$router.push({
        path: '/statistics/defect-query',
        query: {
          stationName: val.data.stationId,
          alarm_level: val.seriesIndex + 1,
        },
      });
    },

    // 告警转缺陷统计
    changeType(val) {
      this.$router.push({
        path: '/statistics/defect-query',
        query: {
          stationName: val.data.stationId,
          status: val.seriesIndex + 4,
        },
      });
    },
    getLevel(val) {
      this.$router.push({
        path: '/statistics/defect-query',
        query: { alarm_level: val.data.key },
      });
    },
    getKeys(val) {
      // console.log(val,"val")
      this.$router.push({
        path: '/statistics/defect-query',
        query: {
          device_type: val.data.key,
        },
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
      // this.getDefectAlarmData(timeStart, timeEnd);
      this.getDefectLevelData(timeStart, timeEnd);
      this.getDefectDeviceData(timeStart, timeEnd);
      this.getDefectStatisData(timeStart, timeEnd);
    },
    getDefectAlarmData(timeStart, timeEnd) {
      this.$api.getBaseApi('substation').then((res) => {
        if (!res || !res.results) return;
        this.defectAlarm.dataset.source = res.results.map((item) => [
          item.name,
          this.$random(10),
          this.$random(5),
        ]);
        console.log(this.defectAlarm.dataset.source, '飞火流星');
      });
    },
    getDefectLevelData(timeStart, timeEnd) {
      this.$api
        .postHistoryApi('alarmitems', '_search', {
          size: 0,
          query: {
            bool: {
              must: [{ match: { status: 4 } }],
              filter: [{ range: { record_time: { gte: timeStart, lte: timeEnd } } }],
            },
          },
          aggs: { level_count: { terms: { field: 'alarm_level' } } },
          _source: { excludes: ['image'] },
        })
        .then((res) => {
          if (!res) return;
          const defectLevelMap = Object.entries(ALARM_LEVEL).reduce(
            (acc, [key, val]) => ((acc[key] = { name: val, value: 0 }), acc),
            {}
          );
          const buckets = res.aggregations.level_count.buckets;
          let source = [];
          // buckets.forEach((item) => {
          // if (defectLevelMap[item.key]) {
          //   defectLevelMap[item.key].value = item.doc_count;

          // }
          buckets.forEach((item) => {
            source.push({
              name: ALARM_LEVEL[item.key],
              value: item.doc_count,
              key: item.key,
            });
          });

          // });
          // this.defectLevel.dataset.source = Object.values(defectLevelMap);
          this.defectLevel.dataset.source = source;
        });
    },
    getDefectDeviceData(timeStart, timeEnd) {
      this.$api
        .postHistoryApi('alarmitems', '_search', {
          size: 0,
          query: {
            bool: {
              filter: { range: { record_time: { gte: timeStart, lte: timeEnd } } },
              must: { match: { status: 4 } },
            },
          },
          aggs: { defectType_count: { terms: { field: 'device_type' } } },
          _source: { excludes: ['image'] },
        })
        .then((res) => {
          if (!res) return;
          let defectDeviceSource = [];
          const buckets = res.aggregations.defectType_count.buckets;
          buckets.forEach((item) => {
            if (DEVICE_TYPE[item.key]) {
              defectDeviceSource.push({
                name: DEVICE_TYPE[item.key],
                value: item.doc_count,
                key: item.key,
              });
            }
          });
          this.defectDevice.dataset.source = defectDeviceSource;
        });
    },
    getDefectStatisData(timeStart, timeEnd) {
      const getDefectStatisItem = (station, dataItem) => {
        return new Promise((resolve, reject) => {
          this.$api
            .postHistoryApi('alarmitems', '_search', {
              size: 0,
              query: {
                bool: {
                  must: [{ match: { substation_id: station.id } }, { match: { status: 4 } }],
                  filter: [{ range: { record_time: { gte: timeStart, lte: timeEnd } } }],
                },
              },
              aggs: { level_count: { terms: { field: 'alarm_level' } } },
              _source: { excludes: ['image'] },
            })
            .then((res) => {
              if (!res) resolve();
              const buckets = res.aggregations.level_count.buckets;
              buckets.forEach((item) => {
                dataItem[item.key] = item.doc_count;
              });
              resolve();
            })
            .catch((err) => reject(err));
        });
      };
      const getDefectCountData = (station, dataItem) => {
        return new Promise((resolve, reject) => {
          this.$api
            .postHistoryApi('alarmitems', '_search', {
              size: 0,
              query: {
                bool: {
                  must: [{ match: { substation_id: station.id } }, { match: { status: 4 } }],
                  filter: [{ range: { record_time: { gte: timeStart, lte: timeEnd } } }],
                },
              },
              aggs: { status_count: { terms: { field: 'status' } } },
              _source: { excludes: ['image'] },
            })
            .then((res) => {
              if (!res) resolve();
              const buckets = res.aggregations.status_count.buckets;
              buckets.forEach((item) => {
                switch (item.key) {
                  case 4:
                    dataItem.defect = item.doc_count;
                    break;
                  case 5:
                    dataItem.mistake = item.doc_count;
                    break;
                  default:
                    break;
                }
              });
              resolve();
            })
            .catch((err) => reject(err));
        });
      };
      this.$api.getBaseApi('substation').then(async (res) => {
        if (!res || !res.results) return;
        let defectStatisSource = [];
        let defectCountSource = [];
        const defectStatisMap = Object.keys(ALARM_LEVEL).reduce(
          (acc, key) => ((acc[key] = 0), acc),
          {}
        );
        const { count, results } = res;
        for (let i = 0; i < count; i++) {
          const station = results[i];
          const defectStatisItem = {
            name: station.name,
            ...defectStatisMap,
            stationId: station.id,
          };
          const defectCountItem = {
            name: station.name,
            defect: 0,
            mistake: 0,
            stationId: station.id,
          };
          await getDefectStatisItem(station, defectStatisItem);
          await getDefectCountData(station, defectCountItem, timeStart, timeEnd);
          if (
            defectStatisItem[1] != 0 ||
            defectStatisItem[2] != 0 ||
            defectStatisItem[3] != 0 ||
            defectStatisItem[4] != 0
          ) {
            defectStatisSource.push(defectStatisItem);
          }
          defectCountSource.push(defectCountItem);
        }
        // 缺陷汇总统计超过10个截取前十个，小于10个显示所有
        if (defectStatisSource.length <= 10 && defectStatisSource != '') {
          this.defectStatis.dataset.source = defectStatisSource;
        } else {
          let before10defectStatisSource = defectStatisSource.slice(0, 10);
          this.defectStatis.dataset.source = before10defectStatisSource;
        }
        if (defectCountSource.length <= 10 && defectCountSource != '') {
          this.defectAlarm.dataset.source = defectCountSource;
        } else {
          let before10defectCountSource = defectCountSource.slice(0, 10);
          this.defectAlarm.dataset.source = before10defectCountSource;
        }
      });
    },
  },
};
</script>
