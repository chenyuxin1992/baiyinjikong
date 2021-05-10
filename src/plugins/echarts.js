import VueEcharts from 'vue-echarts';
import theme from './echarts.json';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/funnel';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';

VueEcharts.registerTheme('sg-echarts', theme);
export default VueEcharts;
