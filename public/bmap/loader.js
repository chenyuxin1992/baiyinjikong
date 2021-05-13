window.BMap_loadScriptTime = new Date().getTime();
window.BMapCFG = {
  home: './bmap/', // 地图基础路径
  imgext: '.png', // 地图瓦片文件后缀
  customstyle: '', // 地图自定义样式文件路径 bmap/customstyle/mapstyle
  tiles_dir: `https://${location.hostname}:8443/html/tiles/`, // 地图瓦片文件路径 bmap/tiles/
  //tiles_dir: `https://129.28.103.85:8443/tiles/`,
  tiles_v_dir: '', // 矢量瓦片图文件路径 bmap/tiles_v/
  tiles_road_dir: '', // 地图路网文件路径 bmap/tiles_road/
  tiles_satellite_dir: '', // 卫星地图文件路径 bmap/tiles_satellite/
};
// (function () {
//   // window.BMap = window.BMap || {};
//   // window.BMap.apiLoad = function () {
//   //   delete window.BMap.apiLoad;
//   // };
//   const script = document.createElement('script')
//   script.type = 'text/javascript'
//   script.src = './bmap/bmap.min.js'
//   document.head.appendChild(script)
//   // document.write(`<script type="text/javascript" src='./bmap/bmap.min.js'></script>`);
// })();
