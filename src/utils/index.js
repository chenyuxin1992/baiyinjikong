import _ from 'lodash';
import moment from 'moment';
import crypto from 'crypto-js';
import { SM4 } from 'gm-crypto';

const AES_IV = 'Skesj(eE%32sLOap';
const AES_KEY = 'JeF8U9wHFOMfs2Y8';

export function aesEncrypt(data) {
  const iv = crypto.enc.Utf8.parse(AES_IV);
  const key = crypto.enc.Utf8.parse(AES_KEY);
  data = crypto.enc.Utf8.parse(data);
  const encryptData = crypto.AES.encrypt(data, key, {
    iv,
    mode: crypto.mode.CBC,
    padding: crypto.pad.Pkcs7,
  });
  return encryptData.ciphertext.toString();
}

export function aesDecrypt(data) {
  const iv = crypto.enc.Utf8.parse(AES_IV);
  const key = crypto.enc.Utf8.parse(AES_KEY);
  data = crypto.enc.Base64.stringify(crypto.enc.Hex.parse(data));
  const decryptData = crypto.AES.decrypt(data, key, {
    iv,
    mode: crypto.mode.CBC,
    padding: crypto.pad.Pkcs7,
  });
  return decryptData.toString(crypto.enc.Utf8);
}

export function sm4Encrypt(data) {
  const sm4Key = strToHex('JeF8U9wHFOMfs2Y8');
  const encryptData = SM4.encrypt(data, sm4Key, {
    mode: SM4.constants.ECB,
    inputEncoding: 'utf8',
    outputEncoding: 'hex',
  });
  return encryptData;
}

export function sm4Decrypt(data) {
  const sm4Key = strToHex('JeF8U9wHFOMfs2Y8');
  const decryptData = SM4.decrypt(data, sm4Key, {
    mode: SM4.constants.ECB,
    inputEncoding: 'hex',
    outputEncoding: 'utf8',
  });
  return decryptData;
}

export function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)].map((num) => num.toString(16)).join('');
}

export function checkTimeout(timeout, callback) {
  let prevTime = new Date().getTime();
  let currentTime = new Date().getTime();
  const onMouseover = _.throttle(
    () => {
      // console.log(e);
      prevTime = new Date().getTime();
    },
    5000,
    { trailing: false }
  );
  const interval = setInterval(() => {
    currentTime = new Date().getTime();
    if (currentTime - prevTime >= timeout) {
      callback && callback();
      clearInterval(interval);
      document.removeEventListener('mouseover', onMouseover);
    }
  }, 1000);
  document.addEventListener('mouseover', onMouseover);
}

export function countdown(text) {
  let duration = 60;
  let countdown = setInterval(() => {
    if (duration > 0) {
      text = `${duration--}秒`;
    } else {
      text = '获取验证码';
      clearInterval(countdown);
    }
  }, 1000);
}

export function dateFormat(date, format = 'YYYY-MM-DD HH:mm:ss') {
  return moment(date).format(format);
}

export function downloadFile(url, name) {
  const link = document.createElement('a');
  link.href = encodeURI(url);
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadFileWithBlob(url, name) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
  xhr.onload = () => {
    if (xhr.status === 200) {
      if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(url, name);
      } else {
        const objUrl = URL.createObjectURL(xhr.response);
        downloadFile(objUrl, name);
        URL.revokeObjectURL(objUrl);
      }
    }
  };
}

export function downloadFileWithData(url, name) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
  xhr.onload = () => {
    if (xhr.status === 200) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(xhr.response);
      fileReader.onload = (e) => {
        downloadFile(e.target.result, name);
      };
    }
  };
}

export function extractDate(datetime) {
  const res = datetime.match(/^\d{4}-\d{2}-\d{2}/);
  return res ? res[0] : moment(datetime).format('YYYY-MM-DD');
}

export function extractTime(datetime) {
  const res = datetime.match(/\d{2}:\d{2}:\d{2}/);
  return res ? res[0] : moment(datetime).format('HH:mm:ss');
}

export function fixChromePassive() {
  if (typeof EventTarget !== 'undefined') {
    const addEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, fn, capture) {
      if (typeof capture !== 'boolean') {
        capture = capture || {};
        capture.passive = false;
      }
      addEventListener(type, fn, capture);
    };
  }
}

export function getLocalIP(callback) {
  // RTCPeerConnection是WebRTC用于构建点对点之间稳定、高效的流传输的组件。兼容火狐、谷歌等
  let myPeerConnection =
    window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  // 创建点对点连接的RTCPeerConnection的实例
  // webRTC使用了ICE协议框架，包括STUN 和 TURN两个协议。我这里连接的是STUN协议服务器。STUN Server的作用是接受客户端的请求，并且把客户端的公网IP、Port封装到ICECandidate中。
  let pc = new myPeerConnection({ iceServers: [{ url: 'stun:stun.l.google.com:19302' }] });
  let noop = function () {};
  let localIPs = {}; // 记录有没有被调用到callback这个listener上
  let ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g;
  function ipIterate(ip) {
    if (!localIPs[ip]) callback(ip);
    localIPs[ip] = true;
  }
  pc.createDataChannel(''); // 创建数据信道
  pc.createOffer().then(function (sdp) {
    sdp.sdp.split('\n').forEach(function (line) {
      if (line.indexOf('candidate') < 0) return;
      line.match(ipRegex).forEach(ipIterate);
    });
    pc.setLocalDescription(sdp, noop, noop);
  });
  pc.onicecandidate = function (ice) {
    if (
      !ice ||
      !ice.candidate ||
      !ice.candidate.candidate ||
      !ice.candidate.candidate.match(ipRegex)
    )
      return;
    ice.candidate.candidate.match(ipRegex).forEach(ipIterate);
  };
}

export function randomInteger(num) {
  return Math.round(Math.random() * num);
}

export function reverseStr(str) {
  return str.split('').reverse().join('');
}

export function hexToStr(hex) {
  let arr = [];
  for (let i = 0, len = hex.length; i < len; i += 2) {
    arr.push(String.fromCharCode(parseInt(hex.substr(i, 2), 16)));
  }
  return arr.join('');
}

export function strToHex(str) {
  return [...str].map((char) => char.charCodeAt().toString(16)).join('');
}

export function strToUint16(str) {
  const arr = new Uint16Array(new ArrayBuffer(str.length * 2));
  for (let i = 0, len = str.length; i < len; i++) {
    arr[i] = str.charCodeAt(i).toString(16);
  }
  return arr;
}

export function sprintf(str, ...args) {
  for (let i = 0; i < args.length; i++) {
    str = str.replace(/%d/, args[i]);
  }
  return str;
}

export function typeOf(target) {
  return Object.prototype.toString.call(target).slice(8, -1);
}

export function underline(str) {
  return str.replace(/\B([A-Z])/g, '_$1').toLowerCase();
}
