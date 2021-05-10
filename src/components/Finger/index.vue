<template>
  <div v-show="visible">
    <a-card class="finger-box" title="请验证指纹" style="width: 300px">
      <a slot="extra">{{ message }}</a>
      <img alt="" :src="imgsrc" width="100%" height="100%" />
    </a-card>
  </div>
</template>

<script>
import stompInit from '@/utils/stomp';

export default {
  name: 'Finger',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      imgsrc: require('../../assets/images/img_finger.jpg'),
      message: '',
      timer: null,
      stompSub: null,
      stompClient: null,
    };
  },
  created() {
    this.initStompClient();
  },
  mounted() {
    this.$bus.$on('stomp', (msg) => {
      if (msg.action == 'fingerprint_station_result') {
        if (msg.result == 0) {
          this.$bus.$emit('FingerResult', msg.id);
          clearTimeout(this.timer);
        }
      }
    });
  },
  beforeDestroy() {
    this.$bus.$off('stomp');
    this.stompSub && this.stompSub.unsubscribe();
    this.stompClient && this.stompClient.disconnect();
  },
  methods: {
    readFinger() {
      this.$api
        .postFingerApi({
          action: 2001,
        })
        .catch((res) => {
          console.log(res);
        });
      this.timer = setTimeout(() => {
        this.message = '';
        this.$message.error('认证失败');
        this.$bus.$emit('FingerResult', -1);
      }, 5000);
    },
    initStompClient() {
      stompInit().then((client) => {
        this.stompClient = client;
        this.stompSub = client.subscribe('/exchange/nik_base/patrol', (msg) => {
          if (!msg) return;
          const body = typeof msg.body === 'string' ? JSON.parse(msg.body) : msg.body;
          this.$bus.$emit('stomp', body);
        });
      });
    },
  },
};
</script>

<style lang="less" scoped>
.finger-box {
  position: absolute;
  top: 30%;
  left: 40%;
}
</style>
