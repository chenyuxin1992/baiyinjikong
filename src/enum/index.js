export const ControlCMD = {
  TASK_CONTROL: 41, // 任务控制指令
  REMOTE_CONTROL: 51, // 远程控制指令
  MODEL_SYNC: 61, // 模型同步指令
  CONFIG_ISSUE: 81, //配置下发指令
  TASK_ISSUE: 101, // 任务下发指令
  TDINFO_SYNC: 122, // 三维信息同步指令
};

export const PtzCMD = {
  CLOSE_IRIS_STOP: 0x0101, //光圈关停止
  CLOSE_IRIS_START: 0x0102, //光圈关
  OPEN_IRIS_START: 0x0103, //光圈开
  OPEN_IRIS_STOP: 0x0104, //光圈开停止
  FOCUS_NEAR_STOP: 0x0201, //近聚焦停止
  FOCUS_NEAR_START: 0x0202, //近聚焦开始
  FOCUS_FAR_STOP: 0x0203, //远聚焦停止
  FOCUS_FAR_START: 0x0204, //远聚焦开始
  ZOOM_IN_STOP: 0x0301, //缩小停止
  ZOOM_IN_START: 0x0302, //缩小开始
  ZOOM_OUT_STOP: 0x0303, //放大停止
  ZOOM_OUT_START: 0x0304, //放大开始
  ZOOM_3D: 0x0901, //3D控制（海康设备）
  TILT_UP_STOP: 0x0401, //向上停止
  TILT_UP_START: 0x0402, //向上开始
  TILT_DOWN_STOP: 0x0403, //向下停止
  TILT_DOWN_START: 0x0404, //向下开始
  PAN_AUTO_STOP: 0x0e01, //自动扫描停止
  PAN_AUTO_START: 0x0e02, //自动扫描开始
  PAN_RIGHT_STOP: 0x0501, //右转停止
  PAN_RIGHT_START: 0x0502, //右转开始
  PAN_LEFT_STOP: 0x0503, //左转停止
  PAN_LEFT_START: 0x0504, //左转开始
  GET_PRESET: 0x0602, //预置位调用
  SET_PRESET: 0x0601, //预置位保存
  UP_LEFT_STOP: 0x0701, //左上方向运动停止
  UP_LEFT_START: 0x0702, //左上方向运动开始
  UP_RIGHT_STOP: 0x0801, //右上方向运动停止
  UP_RIGHT_START: 0x0802, //右上方向运动开始
  DOWN_LEFT_STOP: 0x0703, //左下方向运动停止
  DOWN_LEFT_START: 0x0704, //左下方向运动开始
  DOWN_RIGHT_STOP: 0x0803, //右下方向运动停止
  DOWN_RIGHT_START: 0x0804, //右下方向运动开始
  BRUSH_STOP: 0x0a02, //雨刷关
  BRUSH_START: 0x0a01, //雨刷开
  LAMP_STOP: 0x0b02, //灯光关
  LAMP_START: 0x0b01, //灯光开
};
export const RobotCMD = {
  SELF: 1, // 机器人本体
  BODY: 2, // 机器人车体
  PTZ: 3, // 机器人云台
  ASSIST: 4, // 机器人辅助
  VISIBLE_LIGHT: 21, // 机器人可见光
  INFRARED_RAY: 22, // 机器人红外
};
export const RobotSelf = {
  REMOTE_RESET: 1, // 远方复位
  SELF_CHECK: 2, // 系统自检
  RETURN_BACK: 3, // 一键返航
  MANUAL_CHARGE: 4, // 手动充电
  SWITCH_MODE: 5, // 切换控制模式
  GAIN_CONTROL: 6, // 获得控制权
  RELEASE_CONTROL: 7, // 释放控制权
};
export const RobotBody = {
  FORWARD: 1, // 前进
  BACKWARD: 2, // 后退
  TURN_LEFT: 3, // 左转
  TURN_RIGHT: 4, // 右转
  TURN_AROUND: 5, // 转弯
  STOP: 6, // 停止
};
export const RobotPTZ = {
  PITCH_UP: 1, // 上仰
  PITCH_DOWN: 2, // 下俯
  TURN_LEFT: 3, // 左转
  TURN_RIGHT: 4, // 右转
  GO_UP: 5, // 上升
  GO_DOWN: 6, // 下降
  PRESET: 7, // 预置位
  STOP: 8, // 停止
  RESET: 9, // 复位
};
export const RobotAssist = {
  POWER: 1, // 电源
  WIPER: 2, // 雨刷
  ULTRASOUND: 3, // 超声
  SPOTLIGHT: 4, // 射灯
};
export const RobotLight = {
  LENS_NEAR: 1, // 镜头拉近
  LENS_FAR: 2, // 镜头拉远
  LENS_STOP: 3, // 镜头停止
  FOCAL_INCREASE: 4, // 焦距增加
  FOCAL_REDUCE: 5, // 焦距减少
  AUTO_FOCUS: 6, // 自动聚焦
  SNAPSHOT: 7, // 抓图
  REBOOT: 8, // 重启
  START_RECORD: 9, // 开始录像
  STOP_RECORD: 10, // 停止录像
  SET_RATIO: 11, // 倍率值设置
  SET_FOCUS: 12, // 聚焦值设置
};
export const RobotIR = {
  TBD1: 1,
  TBD2: 2,
  TBD3: 3,
  TBD4: 4,
  SET_FOCAL: 5, // 设定焦距
  AUTO_FOCUS: 6, // 自动聚焦
  SNAPSHOT: 7, // 抓图
  REBOOT: 8, // 重启
};

export const DisplayMode = {
  FULLSCREEN: 0,
  Single: 1,
  FOUR: 4,
  NINE: 9,
  SIXTEEN: 16,
};

export const Direction = {
  EAST: 'e-resize',
  WEST: 'w-resize',
  NORTH: 'n-resize',
  SOUTH: 's-resize',
  NORTH_EAST: 'ne-resize',
  NORTH_WEAT: 'nw-resize',
  SOUTH_EAST: 'se-resize',
  SOUTH_WEST: 'sw-resize',
};

export const Week = {
  1: '星期一',
  2: '星期二',
  3: '星期三',
  4: '星期四',
  5: '星期五',
  6: '星期六',
  7: '星期日',
};

export const Month = {
  1: '1月',
  2: '2月',
  3: '3月',
  4: '4月',
  5: '5月',
  6: '6月',
  7: '7月',
  8: '8月',
  9: '9月',
  10: '10月',
  11: '11月',
  12: '12月',
};

export const ACTION_LEVEL = {
  1: '一般',
  2: '重要',
  3: '危急',
};

export const ACTION_ROBOT = {
  1: {
    name: '机器人本体',
    commands: {
      1: '远方复位',
      2: '系统自检',
      3: '一键返航',
      4: '手动充电',
      5: '切换控制模式',
      6: '获得控制权',
      7: '释放控制权',
    },
  },
  2: {
    name: '机器人车体',
    commands: {
      1: '前进',
      2: '后退',
      3: '左转',
      4: '右转',
      5: '转弯',
      6: '停止',
    },
  },
  3: {
    name: '机器人云台',
    commands: {
      1: '上仰',
      2: '下俯',
      3: '左转',
      4: '右转',
      5: '上升',
      6: '下降',
      7: '预置位',
      8: '停止',
      9: '复位',
    },
  },
  4: {
    name: '机器人辅助',
    commands: {
      1: '电源',
      2: '雨刷',
      3: '超声',
      4: '射灯',
    },
  },
  21: {
    name: '机器人可见光',
    commands: {
      1: '镜头拉近',
      2: '镜头拉远',
      3: '镜头停止',
      4: '焦距增加',
      5: '焦距减少',
      6: '自动聚焦',
      7: '抓图',
      8: '重启',
      9: '开始录像',
      10: '停止录像',
      11: '倍率值设置',
      12: '聚焦值设置',
    },
  },
  22: {
    name: '机器人红外',
    commands: {
      5: '设定焦距',
      6: '自动聚焦',
      7: '抓图',
      8: '重启',
    },
  },
};

// export const ACTION_COMMAND = {
//   41: {
//     name: '任务控制指令',
//     commands: { 1: '任务启动', 2: '任务暂停', 3: '任务继续', 4: '任务停止' },
//   },
//   51: {
//     name: '远程控制指令',
//     commands: ACTION_ROBOT,
//   },
//   61: {
//     name: '模型同步指令',
//     commands: {
//       1: '巡视主机模型',
//       2: '机器人模型',
//       3: '摄像机模型',
//       4: '点位模型',
//       5: '地图文件',
//       6: '联动配置',
//       7: '任务文件',
//       8: '检修区域配置',
//     },
//   },
//   81: {
//     name: '配置下发指令',
//     commands: { 4: '检修区域配置', 5: '远程联动配置' },
//   },
//   101: {
//     name: '任务下发指令',
//     commands: { 1: '任务配置' },
//   },
//   122: {
//     name: '三维信息同步指令',
//     commands: { 1: '三维空间坐标请求', 2: '点位编号请求' },
//   },
// };

export const ACTION_COMMAND = {
  1: {
    name: '系统事件',
  },
  2: {
    name: '流媒体事件',
  },
  3: {
    name: '巡视主机事件',
  },
};

export const ALARM_LEVEL = {
  1: '预警',
  2: '一般',
  3: '严重',
  4: '危急',
};

export const ALARM_STATUS = {
  1: '正常',
  2: '告警',
  3: '已确认',
  4: '转缺陷',
  5: '误报',
};

export const ALARM_TYPE = {
  1: '超温报警',
  2: '温升报警',
  3: '三相温差报警',
  4: '三相对比报警',
  5: '声音异常',
  6: '外观异常',
  7: '仪表越限报警',
  8: '仪表超量程报警',
  9: '仪表三相对比',
  10: '变位报警',
};

export const APPEARANCE_TYPE = {
  0: '无',
  1: '电子围栏',
  2: '红外对射',
  3: '泡沫喷淋',
  4: '消防水泵',
  5: '消防栓',
  6: '消防室',
  7: '设备室',
  8: '照明灯',
  9: '摄像头',
  10: '水位线',
  11: '排水泵',
  12: '沉降监测点',
};

export const CAMERA_TYPE = {
  10: '枪机',
  11: '球机',
  12: '云台',
};

export const DATA_SOURCE = {
  0: '机器人+摄像头',
  1: '摄像头',
  2: '机器人',
};

export const DEFECT_LEVEL = {
  2101: '一般',
  2103: '严重',
  2104: '危急',
};

export const DETECTOR_BATTERY = {
  0: '正常',
  1: '低',
};

export const DETECTOR_CONTROL = {
  0: '空闲',
  1: '获得',
};

export const DETECTOR_EXCEPTION = {
  0: '正常',
  1: '异常',
};

export const DETECTOR_FAULT = {
  0: '正常',
  1: '报警',
};

export const DETECTOR_MODE = {
  1: '任务模式',
  2: '紧急定位模式',
  3: '后台遥控模式',
  4: '手持遥控模式',
};

export const DETECTOR_PROTOCOL = {
  0: '巡视机器人A接口',
  1: '巡视主机与主站接口',
  2: '流媒体服务接口协议',
  3: '视频B接口协议',
};

// export const DETECTOR_TYPE = {
//   0: '可见光',
//   1: '室外机器人',
//   2: '红外',
//   3: '巡视主机',
//   4: '室内机器人',
//   5: '挂轨机器人',
//   6: '硬盘录像机',
//   7: '智能分析单元',
// };

export const DETECTOR_TYPE = {
  1: '室外机器人',
  2: '室内机器人',
  3: '挂轨机器人',
  10: '高清视频',
  11: '硬盘录像机',
  12: '智能分析单元',
  20: '巡视主机',
};

export const DETECTOR_STATUS = {
  0: '离线',
  1: '在线',
  2: '巡视',
  3: '充电',
  4: '检修',
  5: '异常',
};

export const ROBOTDETECTOR_STATUS = {
  1: '空闲',
  2: '巡视',
  3: '充电',
  4: '检修',
  5: '异常',
};

export const DETECTOR_STOPPING = {
  0: '正常',
  1: '停障',
};

export const DETECTOR_TRANSPORT = {
  0: '空闲',
  1: '值班',
};

export const DEVICE_LEVEL = {
  // 0: '区域',
  1: '间隔(点位树勾选第1级)',
  2: '设备(点位树勾选第2级)',
  4: '部件(点位树勾选第3级)',
  3: '点位(点位树勾选第4级)',
};

export const DEVICE_STATUS = {
  0: '离线',
  1: '正常',
  2: '异常',
};

export const DEVICE_TYPE = {
  0: '无',
  1: '油浸式变压器(电抗器)',
  2: '断路器',
  3: '组合电器',
  4: '隔离开关',
  5: '开关柜',
  6: '电流互感器',
  7: '电压互感器',
  8: '避雷器',
  9: '并联电容器组',
  10: '干式电抗器 ',
  11: '串联补偿装置',
  12: '母线及绝缘子',
  13: '穿墙套管',
  14: '消弧线圈',
  15: '高频阻波器',
  16: '耦合电容器',
  17: '高压熔断器',
  18: '中性点隔直(限直)装置',
  19: '接地装置',
  20: '端子箱及检修电源箱',
  21: '站用变压器',
  22: '站用交流电源系统',
  23: '站用直流电源系统',
  24: '设备构架',
  25: '辅助设施',
  26: '土建设施',
  27: '独立避雷针',
  28: '避雷器动作次数表',
};

export const ELIMINATION_STATUS = {
  0: '未消缺',
  1: '已消缺',
};

export const EXECUTE_TYPE = {
  0: '由视频执行巡视',
  1: '由机器人执行巡视',
  2: '由视频与机器人执行巡视',
  3: '由巡视主机执行巡视',
};

export const FAULT_LEVEL = {
  1: '一般',
  2: '严重',
  3: '危急',
};

export const FAULT_TYPE = {
  1: '电池电量低',
  2: '通信状态异常',
  3: '超声停障',
  4: '驱动异常',
  5: '其他',
};

export const FILE_TYPE = {
  0: '无',
  1: '红外图谱',
  2: '可见光照片',
  3: '音频',
  4: '视频',
  5: '识别图片',
};

export const HEATING_TYPE = {
  0: '无',
  1: '电流致热型',
  2: '电压致热型',
  3: '综合致热型',
};

export const LINKAGE_SOURCE = {
  0: '主辅监控系统告警信号触发',
  1: '巡视主机告警信号触发',
};

export const LINKAGE_TYPE = {
  1: '声音',
  2: '视频',
  3: '抓图',
};

export const MAINTENANCE_STATUS = {
  0: '未开始',
  1: '检修中',
  2: '已结束',
};

export const METER_TYPE = {
  0: '无',
  1: '油位表',
  2: '避雷器动作次数表',
  3: '泄漏电流表',
  4: 'SF6压力表',
  5: '液压表 ',
  6: '开关动作次数表',
  7: '油温表',
  8: '档位表',
  9: '气压表',
};

export const OVERHAUL_STATUS = {
  0: '未开始',
  1: '检修中',
  2: '已结束',
};

export const PATROLHOST_STATUS = {
  0: '离线',
  1: '在线',
};

export const PATROLHOST_TYPE = {
  1: 'temperature',
  2: 'humidity',
  3: 'wind_speed',
  4: 'rainfall',
  5: 'wind_direction',
  6: 'pressure',
};

export const PHASE_TYPE = {
  0: '三相',
  1: 'A相',
  2: 'B相',
  3: 'C相',
};

export const RECOGNITION_TYPE = {
  0: '无',
  1: '表计读取',
  2: '位置状态识别',
  3: '设备外观查看',
  4: '红外测温',
  5: '声音检测 ',
  6: '闪烁检测',
};

export const ROBOT_TRANSPORT_STATUS = {
  0: '未执行',
  1: '已执行',
  2: '正在执行',
};

export const ROBOT_TYPE = {
  1: '室外机器人',
  2: '室内机器人',
  3: '挂轨机器人',
};

export const STREAM_TYPE = {
  0: '视频丢失告警录像',
  1: '移动侦测告警录像',
  2: '视频遮挡告警录像',
  8: '设备高温录像',
  9: '设备低温录像',
  10: '风扇故障告警',
  11: '磁盘故障告警',
  16: '状态事件告警',
  20: '设备定时录像',
  21: '用户请求录像',
};

export const TASK_CHECK_STATE = {
  0: '待审核',
  1: '已审核',
  2: '未通过',
};

export const TASK_INTERVAL_TYPE = {
  1: '小时',
  2: '天',
};

export const TASK_ORDERED = {
  0: '无序',
  1: '有序',
};

export const TASK_PRIORITY = {
  1: '低',
  2: '较低',
  3: '普通',
  4: '较高',
  5: '高',
};

export const TASK_RESULT = {
  1: '正常',
  2: '告警',
  3: '缺陷',
  '-1': '调预置位失败',
  '-2': '截图失败',
  '-3': '缺陷识别接口连接失败',
  '-4': '缺陷识别接口调用失败',
  '-5': '表计识别接口连接失败',
  '-6': '表计识别接口调用失败',
};

export const TASK_PATROL_TYPE = {
  // 0: '全面巡视',
  1: '自定义巡视',
  2: '例行巡视',
  3: '全面巡视',
  4: '特殊巡视',
  5: '熄灯巡视',
};

export const TASK_PLAN_ENABLE = {
  0: '启用',
  1: '停用',
};

export const TASK_PLAN_TYPE = {
  0: '定期执行',
  1: '周期执行',
  2: '间隔执行',
};

export const TASK_SELECT_TYPE = {
  0: '可见光+红外',
  1: '可见光',
  2: '红外',
};

export const TASK_STATUS = {
  1: '已完成',
  2: '执行中',
  3: '暂停',
  4: '终止',
  5: '待执行',
  6: '超期',
};

export const TASK_TIMING_TYPE = {
  0: '立即执行',
  1: '定时执行',
  2: '每日执行',
  3: '每周执行',
  4: '每月执行',
  5: '指定间隔天数',
};

export const TASK_VALID = {
  0: '识别失败',
  1: '识别正常',
  2: '识别异常',
};

export const VIDEO_TYPE = {
  1: '可见光',
  2: '红外',
  3: '可见光与红外',
};

export const VOICE_TYPE = {
  1: '声音一',
  2: '声音二',
  3: '声音三',
};
export const LINK_TYPE = {
  0: '主辅监控系统告警信号触发',
  1: '巡视主机告警信号触发',
};

export const SNAP_SHOT = {
  0: '已抓拍',
  1: '未抓拍',
};

// 视频弹窗
export const VIDEO_TYPE2 = {
  0: '打开视频弹窗',
  1: '关闭视频弹窗',
};

// 声光报警
export const SOUND_WARN = {
  0: '已报警',
  1: '未报警',
};
