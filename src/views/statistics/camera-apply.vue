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
          <a-row class="sg-row" :gutter="10">
            <a-col class="sg-col" :span="12">
              <div class="sg-view md">
                <div class="sg-view-title">摄像机类型统计</div>
                <camera-statis class="sg-view-content" :stationId="stationId" />
              </div>
            </a-col>
            <a-col class="sg-col" :span="12">
              <div class="sg-view md">
                <div class="sg-view-title">摄像机状态统计</div>
                <div class="sg-view-content">
                  <sg-chart type="pie" :options="cameraStatis" @sendkeys="camerastatetotal" />
                </div>
              </div>
            </a-col>
          </a-row>
          <div class="sg-view md">
            <div class="sg-view-title">摄像机部署统计</div>
            <div class="sg-view-content">
              <sg-chart
                type="bar"
                :options="cameraDeploy"
                :stationId="stationId"
                @sendkeys="cameralayouttotal"
              />
            </div>
          </div>
        </a-col>
        <a-col class="sg-col" :span="8">
          <div class="sg-view">
            <div class="sg-view-title">摄像机在线时长统计</div>
            <div class="sg-view-content">
              <sg-chart type="bar" :options="cameraOnline" />
            </div>
          </div>
        </a-col>
      </a-row>
    </a-col>
  </a-row>
</template>

<script>
import { CAMERA_TYPE } from '@/enum';
import SgChart from '@/components/Chart';
import SgTree from '@/components/Tree/Antd';
import CameraStatis from '@/components/Statistics/CameraStatis';

export default {
  name: 'CameraApply',
  components: {
    SgTree,
    SgChart,
    CameraStatis,
  },
  data() {
    return {
      stationId: '',
      stationName: '请选择站点',
      timeRange: [this.$moment().startOf('y'), this.$moment()],
      cameraStatis: {
        legend: {
          top: 'middle',
          left: '80%',
          align: 'left',
          orient: 'vertical',
        },
        dataset: {
          source: [
            // { name: '在线设备', value: 5006 },
            // { name: '离线设备', value: 4 },
          ],
        },
        series: [
          {
            type: 'pie',
            name: '摄像机状态统计',
            center: ['40%', '50%'],
            radius: [0, '70%'],
            label: { show: true, formatter: '{@name}-{@value}' },
          },
        ],
      },
      cameraDeploy: {
        dataset: {
          source: [],
          // Array.from({ length: 5 }, (_, index) => {
          //   const dataObj = Object.keys(CAMERA_TYPE).reduce(
          //     (acc, key) => ((acc[key] = this.$random(5)), acc),
          //     {}
          //   );
          //   return { name: `变电站${index + 1}`, ...dataObj };
          // }),
        },
        series: Object.entries(CAMERA_TYPE).map(([key, val]) => ({
          type: 'bar',
          name: val,
          stack: '摄像机部署',
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
      cameraOnline: {
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
        // {
        //   type: 'category',
        //   positon: 'right',
        //   inverse: true,
        //   axisLine: { show: false },
        //   axisTick: { show: false },
        //   axisLabel: { show: true, formatter: '离线 {value} 次' },
        //   splitLine: { show: false },
        // },
        legend: {
          show: false,
        },
        dataset: {
          source: [],
          // Array.from({ length: 10 }, (_, index) => {
          //   const online = this.$random(500);
          //   const offline = 500 - online;
          //   return [`摄像机${index + 1}`, online, offline];
          // }),
        },
        series: [
          {
            type: 'bar',
            name: '设备在线时长',
            barMaxWidth: 20,
            showBackground: true,
            label: { show: true },
            encode: { x: 1, y: 0 },
          },
          {
            type: 'bar',
            name: '设备离线时长',
            barMaxWidth: 20,
            showBackground: true,
            label: { show: true },
            encode: { x: 2, y: 0 },
          },
        ],
      },
    };
  },

  created() {
    this.getStatisData();
  },
  methods: {
    // 摄像机状态统计
    camerastatetotal(val) {
      this.$router.push({
        path: '/monitor/integrate',
      });
    },
    // 摄像机部署统计
    cameralayouttotal(val) {
      this.$router.push({
        path: '/monitor/integrate',
      });
    },
    handleQueryData() {
      this.getStatisData();
    },
    onTreeCheck(_, { node, checked }) {
      const { dataRef } = node;
      console.log({ dataRef });
      if (checked) {
        this.stationName = dataRef.name;
        console.log(this.stationName, 'qwer');
        this.stationId = dataRef.id;
      } else {
        this.stationName = '请选择站点';
        this.stationId = '';
      }
      this.getCameraStatisData();
      this.getCameraDeployData();
    },
    getStatisData() {
      const [timeStart, timeEnd] = this.timeRange.map((date) =>
        this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
      );
      this.getCameraStatisData();
      this.getCameraDeployData();
      this.getCameraOnlineData();
    },
    getCameraStatisData() {
      this.$api
        .getBaseApi('detector', { substation: this.stationId, dec_type: 10, page_size: 6000 })
        .then((res) => {
          if (!res || !res.results) return;
          let cameraStatis = {
            0: { name: '离线设备', value: 0 },
            1: { name: '在线设备', value: 0 },
          };
          for (const item of res.results) {
            const { status } = item;
            if (cameraStatis[status]) {
              cameraStatis[status].value += 1;
            }
          }
          this.cameraStatis.dataset.source = Object.values(cameraStatis);
        });
    },
    getCameraDeployData() {
      const getCameraDeployItem = (station, dataItem) => {
        return new Promise((resolve, reject) => {
          this.$api
            .getBaseApi('detector', { substation: station.id, dec_type: 10, page_size: 6000 })
            .then((res) => {
              // console.log(res,'去健身房健身')
              if (!res) return resolve();
              if (res.count > 0) {
                res.results.forEach((item) => {
                  const { camera_type } = item;
                  if (!isNaN(dataItem[camera_type])) dataItem[camera_type]++;
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
        const dataItem = Object.keys(CAMERA_TYPE).reduce((acc, key) => ((acc[key] = 0), acc), {});
        let cameraData = results.map((item) => ({ name: item.name, ...dataItem }));
        for (let i = 0; i < count; i++) {
          const station = results[i];
          // console.log(station,'阿斯顿')
          const dataItem = cameraData[i];
          await getCameraDeployItem(station, dataItem);
        }
        if (this.stationId != '') {
          for (let i = 0; i < cameraData.length; i++) {
            if (this.stationName == cameraData[i].name) {
              let newCameradata = [];
              newCameradata.push(cameraData[i]);
              this.cameraDeploy.dataset.source = newCameradata;
            }
          }
        } else {
          //摄像机部署统计超过10个截取前十个，小于10个显示所有
          if (cameraData.length <= 10 && cameraData != '') {
            this.cameraDeploy.dataset.source = cameraData;
          } else {
            let before10cameraData = cameraData.slice(0, 10);
            this.cameraDeploy.dataset.source = before10cameraData;
          }
        }
      });
    },
    getCameraOnlineData() {
      this.$api.getBaseApi('detector', { dec_type: 10, name__icontains: 'CAMERA' }).then((res) => {
        if (!res || !res.results) return;
        this.cameraOnline.dataset.source = res.results.map((item) => {
          const online = item.online_time;
          const offline = item.offline_time;
          return [item.name, online, offline];
        });
      });
    },
  },
};
</script>
