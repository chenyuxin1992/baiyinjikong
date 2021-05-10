<template>
  <div id="login">
    <div class="login-form">
      <header class="login-form__title">远程智能巡视集中监控系统</header>

      <a-form-model class="login-form__wrap" ref="form" :model="loginForm" :rules="loginRules">
        <a-form-model-item prop="username">
          <a-input
            v-model="loginForm.username"
            size="large"
            placeholder="请输入账号"
            :max-length="20"
            allow-clear
          >
            <a-icon slot="prefix" type="user" />
          </a-input>
        </a-form-model-item>
        <!-- <a-form-model-item prop="vcode">
          <a-input v-model="loginForm.vcode" size="large" placeholder="请输入验证码" :max-length="10" allow-clear>
            <a-icon slot="prefix" type="safety-certificate" />
            <a-button slot="suffix" type="primary">获取验证码</a-button>
          </a-input>
        </a-form-model-item> -->
        <a-form-model-item prop="password">
          <a-input-password
            v-model="loginForm.password"
            size="large"
            placeholder="请输入密码"
            :max-length="20"
          >
            <a-icon slot="prefix" type="lock" />
          </a-input-password>
        </a-form-model-item>
        <a-form-model-item prop="captcha">
          <a-row>
            <a-col class="sg-col" :span="16">
              <a-input
                v-model="loginForm.captcha"
                size="large"
                placeholder="请输入验证码"
                :max-length="20"
              >
                <a-icon slot="prefix" type="lock" />
              </a-input>
            </a-col>
            <a-col class="sg-col" :span="8">
              <img :src="imgsrc" alt="" @click="refreshCaptcha" />
            </a-col>
          </a-row>
        </a-form-model-item>
        <a-form-model-item>
          <a-button
            type="primary"
            size="large"
            :block="true"
            :loading="logining"
            @click="handleLogin"
          >
            登 录
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
    <finger :visible="finger_show"></finger>
  </div>
</template>

<script>
import Finger from '@/components/Finger';
export default {
  name: 'FingerLogin',
  components: {
    Finger,
  },
  data() {
    return {
      logining: false,
      loginForm: {
        username: '',
        password: '',
        captcha: '',
        captchaId: '',
        FingerPrintID: '',
        IP: '',
        MAC: '',
      },
      loginRules: {
        username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
      },
      imgsrc: '',
      finger_show: false,
    };
  },
  created() {
    this.refreshCaptcha();
  },
  mounted() {
    this.$bus.$on('FingerResult', (res) => {
      if (res < 0) {
        this.finger_show = false;
        this.refreshCaptcha();
      } else {
        this.loginForm.FingerPrintID = res;
        this.commitLogin();
      }
    });
  },
  beforeDestroy() {
    this.$bus.$off('FingerResult');
  },
  methods: {
    handleLogin() {
      this.commitLogin();
    },
    commitLogin() {
      this.logining = true;
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$store
            .dispatch('userLogin', this.loginForm)
            .then(() => {
              this.$router.replace('/overview');
            })
            .finally(() => {
              this.logining = false;
            });
        } else {
          this.logining = false;
        }
      });
    },
    refreshCaptcha() {
      this.$api.postUserApi('/base_cas/captcha').then((res) => {
        if (!res) return;
        const { captchaId, picPath } = res;
        this.loginForm.captchaId = captchaId;
        this.imgsrc = picPath;
      });
    },
  },
};
</script>

<style lang="less" scoped>
#login {
  position: relative;
  width: 100%;
  height: 100%;
  background-size: 80% 80%, 100% 100%;
  background-repeat: no-repeat, no-repeat;
  background-position: 30% 30%, center center;
  background-image: url(../../assets/images/img_login.png), url(../../assets/images/bg_login.png);

  .login-form {
    position: absolute;
    top: 50%;
    right: 10vw;
    padding: 50px;
    border-radius: 4px;
    border: 8px solid rgba(255, 255, 255, 0.5);
    background-color: #fff;
    background-clip: padding-box;
    transform: translateY(-50%);

    &__title {
      margin-bottom: 50px;
      font-size: 30px;
      font-weight: bold;
      text-align: center;
    }
    &__wrap {
      width: 300px;

      .ant-input {
        padding-left: 40px;

        &-prefix {
          color: @theme-color1;
          font-size: 18px;
        }
      }
      .ant-form-item:last-child {
        margin-bottom: 0;
        padding-top: 20px;
      }
    }
  }
}
</style>
