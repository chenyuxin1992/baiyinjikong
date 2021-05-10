// 离线地图城市坐标
var CityCoords = [
  ['北京', 116.427265, 39.918698],
  ['上海', 121.472724, 31.239761],
  ['武汉', 114.28398, 30.601327],
  ['成都', 104.070606, 30.59138],
  ['广州', 113.270404, 23.159763],
  ['重庆', 106.595635, 29.619598],
];

// 城市坐标映射
let coordMap = new Object();
for (var i = 0; i < CityCoords.length; i++) {
  coordMap[CityCoords[i][0]] = [CityCoords[i][1], CityCoords[i][2]];
}
// 获取城市坐标
export function getCityCoord(a) {
  if (a in coordMap) {
    const pt = new BMap.Point(coordMap[a][0], coordMap[a][1]);
    return pt;
  }
  return false;
}
// 设置中心城市
export function setCurrentCity(map, a) {
  const pt = getCityCoord(a);
  if (pt) {
    map.setCenter(pt);
    return pt;
  }
  return false;
}
