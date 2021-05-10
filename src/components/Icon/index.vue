<template>
  <icon-font class="sg-icon" :type="`icon-${name}`" @click="$emit('click', $event)" />
</template>

<script>
import { Icon } from 'ant-design-vue';

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: require('@/assets/svg/iconfont.js'),
  extraCommonProps: {},
});
export default {
  name: 'SgIcon',
  components: {
    IconFont,
  },
  props: {
    name: {
      required: true,
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="less" scoped>
.sg-icon {
  color: #333;
  font-size: 20px;
  cursor: pointer;
}
</style>
