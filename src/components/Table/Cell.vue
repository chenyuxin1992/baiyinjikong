<template>
  <div class="edit-cell">
    <template v-if="editable">
      <a-input
        class="edit-cell__input"
        v-model="editVal"
        size="small"
        :type="type"
        :max-length="10"
        allow-clear
        @pressEnter="handleCheck"
      />
      <a-icon type="check" @click="handleCheck" />
    </template>
    <template v-else>
      <span v-if="value" class="edit-cell__value">{{ editVal }}</span>
      <span v-else class="edit-cell__placeholder">{{ placeholder }}</span>
      <a-icon type="edit" @click="handleEdit" />
    </template>
  </div>
</template>

<script>
export default {
  props: {
    value: [String, Number],
    type: {
      type: String,
      default: 'text',
    },
    placeholder: {
      type: String,
      default: '请设置修正值',
    },
  },
  data() {
    return {
      editable: false,
      editVal: this.value,
    };
  },
  methods: {
    handleCheck() {
      if (!this.editVal) return this.$message.warn('输入值不能为空！');
      if (this.editVal === this.value) {
        this.editable = false;
        return;
      }
      this.$emit('change', this.editVal);
      // if (/^(\d+,)*\d+$/g.test(this.editVal)) {
      //   this.editable = false;
      // } else {
      //   this.$message.warn('输入值格式错误！');
      // }
    },
    handleEdit() {
      this.editable = true;
    },
  },
};
</script>

<style lang="less" scoped>
.edit-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &__input,
  &__value,
  &__placeholder {
    flex: auto;
  }
  &__placeholder {
    color: @theme-color2;
  }
  .anticon {
    margin-left: 5px;
    font-size: 16px;

    &:hover {
      color: @theme-color1;
    }
  }
}
</style>
