import antdCN from 'ant-design-vue/es/locale-provider/zh_CN';
import momentCN from 'moment/locale/zh-cn';

const components = {
  antLocale: antdCN,
  momentName: 'zh-cn',
  momentLocale: momentCN,
};

const locale = {};

export default {
  ...components,
  ...locale,
};
