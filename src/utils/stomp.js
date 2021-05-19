import stomp from 'stompjs';

let retry = 0; // 重连次数

const init = () => {
  return new Promise((resolve, reject) => {
    const client = stomp.client(`wss://${location.hostname}:8443/ws`);
    client.heartbeat.outgoing = 10000;
    client.heartbeat.incoming = 0;
    client.debug = null;
    const connect = () =>
      client.connect(
        'admin',
        'aicrobo',
        () => {
          console.log('Stomp连接建立成功！');
          resolve(client);
        },
        (err) => {
          console.error(err);
          reject(err);
          // 断开重连10之后在进行连接
          // setTimeout(() => {
          //   console.log('我是大傻逼');
          //   resolve(client);
          // }, 1000);
          // 重连5次之后没有连接成功之后就断开
          if (retry === 5) {
            reject(err);
          } else {
            retry++;
            connect();
          }
        },
        '/'
      );
    connect();
  });
};

export default init;
