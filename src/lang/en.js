import antdEN from 'ant-design-vue/es/locale-provider/en_US';
import momentEN from 'moment/locale/eu';

const components = {
  antLocale: antdEN,
  momentName: 'eu',
  momentLocale: momentEN,
};

const locale = {};

export default {
  ...components,
  ...locale,
};
