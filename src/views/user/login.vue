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
            @keyup.shift.70.native="handleKeyUp"
          >
            <a-icon slot="prefix" type="user" />
          </a-input>
        </a-form-model-item>
        <a-form-model-item prop="captcha">
          <a-input
            class="captcha"
            v-model="loginForm.captcha"
            size="large"
            placeholder="请输入验证码"
            :max-length="10"
            allow-clear
          >
            <a-icon slot="prefix" type="safety-certificate" />
            <img slot="suffix" :src="captchaImage" alt="验证码" @click="refreshCaptcha" />
          </a-input>
        </a-form-model-item>
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
        <a-form-model-item>
          <a-button
            type="primary"
            size="large"
            :block="true"
            :loading="logining"
            @click="handleLogin"
            >登 录
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
  </div>
</template>

<script>
import { checkTimeout } from '@/utils';

export default {
  name: 'UserLogin',
  data() {
    return {
      captchaImage: '',
      logining: false,
      loginForm: {
        username: '',
        password: '',
        // username: 'test1',
        // password: 'qwer!234',
        captcha: '',
        captchaId: '',
        FingerPrintID: '1',
        withFinger: false,
      },
      loginRules: {
        username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
      },
    };
  },
  created() {
    this.refreshCaptcha();
  },
  methods: {
    handleLogin() {
      this.logining = true;
      this.$refs.form.validate((valid) => {
        if (valid) {
          //this.$message.success('请验证指纹！');
          this.$store
            .dispatch('userLogin', this.loginForm)
            .then((res) => {
              // 系统超时自动退出
              checkTimeout(30 * 60 * 1000, () => {
                this.$store.dispatch('userLogout');
              });
              switch (res) {
                case '111': // 系统管理
                  this.$router.replace('/system');
                  break;
                case '222': // 审计管理
                  this.$router.replace('/audit');
                  break;
                case '333': // 运维人员
                  this.$router.replace('/overview');
                  break;
                default:
                  break;
              }
            })
            .catch(() => {
              this.refreshCaptcha();
              this.logining = false;
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
        this.captchaImage = picPath;
      });
    },
    handleKeyUp() {
      this.loginForm.withFinger = !this.loginForm.withFinger;
      console.log(this.loginForm.withFinger);
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
      // width: 300px;

      /deep/ .ant-input {
        padding-left: 40px;

        &-prefix {
          color: @theme-color1;
          font-size: 18px;
        }
      }
      .captcha {
        /deep/ .ant-input-suffix {
          right: 0;

          > img {
            display: block;
            width: 120px;
            height: 40px;
            margin-left: 10px;
            object-fit: cover;
            cursor: pointer;
          }
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
