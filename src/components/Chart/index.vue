<template>
  <v-chart
    ref="chart"
    class="sg-chart"
    theme="sg-echarts"
    :options="initOption"
    autoresize
  ></v-chart>
</template>

<script>
import VChart from '@/plugins/echarts';
import { typeOf } from '@/utils';
import { ROBOTDETECTOR_STATUS } from '@/enum';
export default {
  name: 'SgChart',
  components: {
    VChart,
  },
  computed: {
    initOption() {
      let chartOption = null;
      switch (this.type) {
        case 'bar':
          chartOption = this.barOption;
          break;
        case 'pie':
          chartOption = this.pieOption;
          break;
        case 'line':
          chartOption = this.lineOption;
          break;
        case 'funnel':
          chartOption = this.funnelOption;
          break;
        default:
          break;
      }
      Object.keys(this.options).forEach((key) => {
        if (
          chartOption[key] &&
          typeOf(chartOption[key]) === 'Object' &&
          typeOf(this.options[key]) === 'Object'
        ) {
          chartOption[key] = {
            ...chartOption[key],
            ...this.options[key],
          };
        } else {
          chartOption[key] = this.options[key];
        }
      });
      if (this.type === 'bar') {
        chartOption.legend.data = this.options.series;
      }
      return chartOption;
    },
  },
  props: {
    statusArray: {
      type: Array,
      default() {
        return [];
      },
    },
    type: {
      type: String,
      default: 'bar',
    },

    options: {
      type: Object,
      default() {
        return {};
      },
    },
    title: {
      type: String,
      default() {
        return '';
      },
    },
  },

  // watch: {
  //   options: {
  //     deep: true,
  //     immediate: true,
  //     handler(options) {
  //       console.log(options);
  //       let chartOption = null;
  //       switch (this.type) {
  //         case 'bar':
  //           chartOption = this.barOption;
  //           break;
  //         case 'pie':
  //           chartOption = this.pieOption;
  //           break;
  //         case 'funnel':
  //           chartOption = this.funnelOption;
  //           break;
  //         default:
  //           break;
  //       }
  //       Object.keys(options).forEach((key) => {
  //         if (
  //           chartOption[key] &&
  //           typeOf(chartOption[key]) === 'Object' &&
  //           typeOf(options[key]) === 'Object'
  //         ) {
  //           chartOption[key] = {
  //             ...chartOption[key],
  //             ...options[key],
  //           };
  //         } else {
  //           chartOption[key] = options[key];
  //         }
  //       });
  //       this.chartOption = chartOption;

  //     },
  //   },
  // },
  mounted() {
    let _this = this;
    _this.$refs.chart.chart.on('click', function (val) {
      console.log(val);
      _this.$emit('sendkeys', val);
    });
  },
  data() {
    return {
      status: [],
      chartOption: null,
      barOption: {
        grid: {
          top: '15%',
          left: 0,
          right: 0,
          bottom: 0,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          axisLine: { show: true },
          axisTick: { show: false },
          axisLabel: { interval: 0 },
          splitLine: { show: false },
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: true },
          splitLine: { show: true },
        },
        legend: {
          show: true,
          top: 'top',
          left: 'center',
          itemGap: 20,
          itemWidth: 10,
          itemHeight: 10,
          icon: 'circle',
        },
        tooltip: {
          show: true,
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        series: [],
      },
      pieOption: {
        legend: {
          show: true,
          top: 'top',
          left: 'center',
          itemGap: 20,
          itemWidth: 10,
          itemHeight: 10,
          icon: 'circle',
        },
        tooltip: { show: true, trigger: 'item' },
        series: [],
      },
      lineOption: {
        grid: {
          top: '15%',
          left: 0,
          right: 0,
          bottom: 0,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          axisLine: { show: true },
          axisTick: { show: false },
          axisLabel: { interval: 0 },
          splitLine: { show: false },
        },
        yAxis: {
          type: 'value',
          axisLine: { show: true },
          axisTick: { show: false },
          axisLabel: { show: true },
          splitLine: { show: true },
        },
        legend: {
          show: true,
          top: 'top',
          left: 'center',
          itemGap: 20,
          itemWidth: 10,
          itemHeight: 10,
          icon: 'circle',
        },
        tooltip: {
          show: true,
          trigger: 'axis',
        },
        series: [],
      },
      funnelOption: {
        legend: {
          show: true,
          top: 'top',
          left: 'center',
          itemGap: 20,
          itemWidth: 10,
          itemHeight: 10,
          icon: 'circle',
        },
        tooltip: { show: true, trigger: 'item' },
        series: [],
      },
    };
  },

  methods: {},
};
</script>

<style lang="less" scoped>
.sg-chart {
  &.echarts {
    width: 100%;
    height: 100%;
  }
}
</style>
