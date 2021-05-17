<template>
  <a-row class="sg-row" :gutter="10">
    <a-col class="sg-col" :span="4">
      <div class="sg-tree">
        <a-radio-group
          class="sg-tree-group"
          v-model="treeRadio"
          button-style="solid"
          @change="onTreeChange"
        >
          <a-radio-button value="device">设备</a-radio-button>
          <a-radio-button value="area">防区</a-radio-button>
          <a-radio-button value="patrol">轮巡</a-radio-button>
        </a-radio-group>
        <a-input-search
          v-model="keyword"
          class="sg-tree-search"
          placeholder="请输入关键字搜索"
          :max-length="20"
          enter-button
          @search="onTreeSearch"
        />
        <a-input
          v-show="treeRadio === 'patrol'"
          class="sg-tree-input"
          v-model="detectorInterval"
          type="number"
          suffix="秒"
          :max-length="5"
        >
          <a-button
            type="primary"
            slot="addonBefore"
            :disabled="!detectorPolling"
            @click="handleDetectorPolling('reboot')"
            >轮巡
          </a-button>
          <a-button type="primary" slot="addonAfter" @click="handleDetectorPolling('switch')">
            {{ detectorPolling ? '暂停' : '开始' }}
          </a-button>
        </a-input>
        <div v-show="treeRadio === 'device'">
          <a-radio-group
            class="sg-tree-radio"
            v-model="deviceTree"
            @change="onDeviceTreeChange($event, 'tree')"
          >
            <a-radio :value="1">点位树</a-radio>
            <a-radio :value="2">摄像头树</a-radio>
          </a-radio-group>
          <a-radio-group
            class="sg-tree-radio"
            v-model="deviceState"
            @change="onDeviceTreeChange($event, 'state')"
          >
            <a-radio :value="0">全部</a-radio>
            <a-radio :value="1">在线</a-radio>
            <a-radio :value="2">离线</a-radio>
          </a-radio-group>
          <a-radio-group
            class="sg-tree-radio"
            v-model="deviceFocus"
            @change="onDeviceTreeChange($event, 'focus')"
          >
            <a-radio :value="0">全部</a-radio>
            <a-radio :value="1">已关注</a-radio>
            <a-radio :value="2">未关注</a-radio>
          </a-radio-group>
        </div>
        <a-tree
          :class="`${treeRadio}`"
          :tree-data="treeData"
          :load-data="loadTreeData"
          :loaded-keys="loadedKeys"
          :checked-keys="checkedKeys"
          :expanded-keys="expandedKeys"
          :auto-expand-parent="expandParent"
          :filter-tree-node="filterTreeNode"
          :replace-fields="{ key: 'id', title: 'name' }"
          :check-strictly="false"
          checkable
          show-icon
          @load="onTreeLoad"
          @check="onTreeCheck"
          @select="onTreeSelect"
          @expand="onTreeExpand"
        >
          <sg-icon slot="robot" name="robot" />
          <sg-icon slot="camera" name="camera" />
          <sg-icon slot="preset" name="preset" />
          <sg-icon slot="videorobot" name="videorobot" />
          <template #title="{ dataRef }">
            <span>{{ dataRef.name }}</span>
            <a-icon
              type="star"
              :class="{ focused: dataRef.focused }"
              :theme="dataRef.focused ? 'filled' : 'outlined'"
              @click="handleFocusNode(dataRef)"
            />
          </template>
        </a-tree>
      </div>
    </a-col>
    <a-col class="sg-col" :span="20">
      <section class="wrapper">
        <main class="monitor" :class="`${treeRadio}`">
          <div class="monitor-toolbar">
            <sg-icon name="single" @click="handleDisplayMode(1)" />
            <sg-icon name="four" @click="handleDisplayMode(4)" />
            <sg-icon name="nine" @click="handleDisplayMode(9)" />
            <sg-icon name="sixteen" @click="handleDisplayMode(16)" />

            <!-- <a-icon type="close-square" @click="handleCloseAll" /> -->
            <a-button type="primary" size="small" @click="handleCloseAll">全部关闭</a-button>
          </div>
          <div class="monitor-wrapper">
            <template v-for="(item, index) in monitorList.slice(0, displayMode)">
              <sg-robot
                v-if="item.type === 'robot'"
                :class="[`mode-${displayMode}`, { selected: monitorIndex === index }]"
                :key="item.id"
                v-bind="{
                  detector: item.detector,
                  lightUrl: item.lightUrl,
                  infraredUrl: item.infraredUrl,
                  autoplay: true,
                }"
                @close="onMointorClosed(index)"
                @click="onMointorSelected(index)"
              />
              <sg-camera
                v-else
                :class="[`mode-${displayMode}`, { selected: monitorIndex === index }]"
                :key="item.id"
                v-bind="{
                  url: item.url,
                  did: item.did,
                  cno: item.cno,
                  preset: item.preset,
                  detector: item.detector,
                  record: true,
                  autoplay: true,
                  screenshot: true,
                }"
                @close="onMointorClosed(index)"
                @click="onMointorSelected(index)"
                @recording="onMonitorRecord($event)"
                @screenshot="onMonitorScreenshot($event)"
              />
            </template>
          </div>
        </main>
        <aside v-show="!monitorType" class="aside"></aside>
        <aside v-show="monitorType === 'robot'" class="aside robot-aside">
          <div class="aside-title">机器人本体</div>
          <div class="aside-control">
            <div class="aside-control__item col-3">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.SELF, robotSelf.REMOTE_RESET)"
                >远方复位
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.SELF, robotSelf.SELF_CHECK)"
                >系统自检
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.SELF, robotSelf.RETURN_BACK)"
                >一键返航
              </a-button>
            </div>
            <div class="aside-control__item col-3">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.SELF, robotSelf.MANUAL_CHARGE)"
                >手动充电
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.SELF, robotSelf.GAIN_CONTROL)"
                >获得控制权
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.SELF, robotSelf.RELEASE_CONTROL)"
                >释放控制权
              </a-button>
            </div>
            <div class="aside-control__item col-1">
              <label>切换控制模式：</label>
              <a-select
                v-model="robotModel.robotMode"
                size="small"
                style="width: 180px"
                :options="robotModes"
                @select="onRobotModeSelect"
              ></a-select>
            </div>
          </div>
          <div class="aside-title">机器人车体</div>
          <div class="aside-control">
            <div class="aside-control__item col-1">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.BODY, robotBody.FORWARD, robotModel.forwardSpeed)"
                >前进
              </a-button>
              <a-input-number
                v-model="robotModel.forwardSpeed"
                :max="1.2"
                :min="0.1"
                :step="0.1"
                size="small"
                placeholder="设置前进速度"
              />
              <span>米/秒</span>
            </div>
            <div class="aside-control__item col-1">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.BODY, robotBody.BACKWARD, robotModel.backwardSpeed)"
                >后退
              </a-button>
              <a-input-number
                v-model="robotModel.backwardSpeed"
                :max="1.2"
                :min="0.1"
                :step="0.1"
                size="small"
                placeholder="设置后退速度"
              />
              <span>米/秒</span>
            </div>
            <div class="aside-control__item col-1">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.BODY, robotBody.TURN_LEFT, robotModel.turnLeftSpeed)"
                >左转
              </a-button>
              <a-input-number
                v-model="robotModel.turnLeftSpeed"
                :max="1"
                :min="0.1"
                :step="0.1"
                size="small"
                placeholder="设置左转速度"
              />
              <span>米/秒</span>
            </div>
            <div class="aside-control__item col-1">
              <a-button
                size="small"
                type="primary"
                @click="
                  sendRobotCmd(robotCMD.BODY, robotBody.TURN_RIGHT, robotModel.turnRightSpeed)
                "
                >右转
              </a-button>
              <a-input-number
                v-model="robotModel.turnRightSpeed"
                :max="1"
                :min="0.1"
                :step="0.1"
                size="small"
                placeholder="设置右转速度"
              />
              <span>米/秒</span>
            </div>
            <div class="aside-control__item col-3">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.BODY, robotBody.TURN_AROUND, 1, 1)"
                >左转弯
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.BODY, robotBody.TURN_AROUND, 1, 2)"
                >右转弯
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.BODY, robotBody.STOP)"
                >停止
              </a-button>
            </div>
          </div>
          <div class="aside-title">机器人云台</div>
          <div class="aside-control">
            <div class="aside-control__item col-2">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.PTZ, robotPtz.PITCH_UP)"
                >上仰
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.PTZ, robotPtz.PITCH_DOWN)"
                >下俯
              </a-button>
            </div>
            <div class="aside-control__item col-2">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.PTZ, robotPtz.TURN_LEFT)"
                >左转
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.PTZ, robotPtz.TURN_RIGHT)"
                >右转
              </a-button>
            </div>
            <div class="aside-control__item col-2">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.PTZ, robotPtz.GO_UP)"
                >上升
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.PTZ, robotPtz.GO_DOWN)"
                >下降
              </a-button>
            </div>
            <div class="aside-control__item col-2">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.PTZ, robotPtz.STOP)"
                >停止
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.PTZ, robotPtz.RESET)"
                >复位
              </a-button>
            </div>
            <div class="aside-control__item col-1">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.PTZ, robotPtz.PRESET, robotModel.presetNumber)"
                >预置位
              </a-button>
              <a-input-number
                v-model="robotModel.presetNumber"
                :max="255"
                :min="0"
                size="small"
                placeholder="设置预置位"
              />
              <span>0-255</span>
            </div>
          </div>
          <div class="aside-title">机器人辅助</div>
          <div class="aside-control">
            <div class="aside-control__item">
              <div class="aside-control__col">
                <label>红外电源：</label>
                <a-switch
                  v-model="robotModel.power"
                  checked-children="打开"
                  un-checked-children="关闭"
                  @change="onRobotSwitchChange($event, robotAssist.POWER)"
                />
              </div>
              <div class="aside-control__col">
                <label>雨刷：</label>
                <a-switch
                  v-model="robotModel.wiper"
                  checked-children="打开"
                  un-checked-children="关闭"
                  @change="onRobotSwitchChange($event, robotAssist.WIPER)"
                />
              </div>
            </div>
            <div class="aside-control__item">
              <div class="aside-control__col">
                <label>红外射灯：</label>
                <a-switch
                  v-model="robotModel.spotlight"
                  checked-children="打开"
                  un-checked-children="关闭"
                  @change="onRobotSwitchChange($event, robotAssist.SPOTLIGHT)"
                />
              </div>
              <div class="aside-control__col">
                <label>超声：</label>
                <a-switch
                  v-model="robotModel.ultrasound"
                  checked-children="打开"
                  un-checked-children="关闭"
                  @change="onRobotSwitchChange($event, robotAssist.ULTRASOUND)"
                />
              </div>
            </div>
          </div>
          <div class="aside-title">机器人可见光</div>
          <div class="aside-control">
            <div class="aside-control__item col-3">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.LENS_NEAR)"
                >镜头拉近
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.LENS_FAR)"
                >镜头拉远
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.LENS_STOP)"
                >镜头静止
              </a-button>
            </div>
            <div class="aside-control__item col-3">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.FOCAL_INCREASE)"
                >焦距增加
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.FOCAL_REDUCE)"
                >焦距减少
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.AUTO_FOCUS)"
                >自动聚焦
              </a-button>
            </div>
            <div class="aside-control__item col-2">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.SNAPSHOT)"
                >抓图
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.REBOOT)"
                >重启
              </a-button>
            </div>
            <div class="aside-control__item col-1">
              <a-button
                size="small"
                type="primary"
                @click="
                  sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.SET_RATIO, robotModel.ratioValue)
                "
                >倍率值
              </a-button>
              <a-input-number
                v-model="robotModel.ratioValue"
                :max="30"
                :min="1"
                :step="1"
                size="small"
                placeholder="设置倍率值"
              />
              <span>1-30倍</span>
            </div>
            <div class="aside-control__item col-1">
              <a-button
                size="small"
                type="primary"
                @click="
                  sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.SET_FOCUS, robotModel.focusValue)
                "
                >聚焦值
              </a-button>
              <a-input-number
                v-model="robotModel.focusValue"
                :max="100"
                :min="0"
                :step="1"
                size="small"
                placeholder="设置聚焦值"
              />
              <span>整数</span>
            </div>
            <!-- <div class="aside-control__item col-2">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.START_RECORD)"
                >启动录像
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.VISIBLE_LIGHT, robotLight.STOP_RECORD)"
                >停止录像
              </a-button>
            </div> -->
          </div>
          <div class="aside-title">机器人红外</div>
          <div class="aside-control">
            <div class="aside-control__item col-3">
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.INFRARED_RAY, robotIR.AUTO_FOCUS)"
                >自动聚焦
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.INFRARED_RAY, robotIR.SNAPSHOT)"
                >抓图
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="sendRobotCmd(robotCMD.INFRARED_RAY, robotIR.REBOOT)"
                >重启
              </a-button>
            </div>
            <div class="aside-control__item col-1">
              <a-button
                slot="addonBefore"
                size="small"
                type="primary"
                @click="
                  sendRobotCmd(robotCMD.INFRARED_RAY, robotIR.SET_FOCAL, robotModel.focalLength)
                "
                >设定焦距
              </a-button>
              <a-input-number
                v-model="robotModel.focalLength"
                :max="100"
                :min="0"
                :step="1"
                size="small"
                placeholder="设置焦距值"
              />
              <span>整数</span>
            </div>
          </div>
          <div class="aside-title">设备信息</div>
          <ul class="aside-info">
            <li>设备名称：{{ monitorInfo.name || '-' }}</li>
            <li>设备类型：{{ monitorInfo.manufacturer || '-' }}</li>
            <li>设备状态：{{ monitorInfo.status ? '在线' : '离线' }}</li>
          </ul>
        </aside>
        <aside v-show="monitorType === 'camera'" class="aside camera-aside">
          <div class="aside-title">摄像机控制</div>
          <div class="aside-control">
            <div class="camera-operate">
              <a-icon
                type="caret-up"
                :rotate="-45"
                @mousedown="sendCameraCmd(ptzCMD.UP_LEFT_START)"
                @mouseup="sendCameraCmd(ptzCMD.UP_LEFT_STOP)"
              />
              <a-icon
                type="caret-up"
                @mousedown="sendCameraCmd(ptzCMD.TILT_UP_START)"
                @mouseup="sendCameraCmd(ptzCMD.TILT_UP_STOP)"
              />
              <a-icon
                type="caret-up"
                :rotate="45"
                @mousedown="sendCameraCmd(ptzCMD.UP_RIGHT_START)"
                @mouseup="sendCameraCmd(ptzCMD.UP_RIGHT_STOP)"
              />
              <a-icon
                type="caret-left"
                @mousedown="sendCameraCmd(ptzCMD.PAN_LEFT_START)"
                @mouseup="sendCameraCmd(ptzCMD.PAN_LEFT_STOP)"
              />
              <span class="zoom">
                <a-icon
                  type="plus"
                  @mousedown="sendCameraCmd(ptzCMD.ZOOM_OUT_START)"
                  @mouseup="sendCameraCmd(ptzCMD.ZOOM_OUT_STOP)"
                />
                <a-icon
                  type="minus"
                  @mousedown="sendCameraCmd(ptzCMD.ZOOM_IN_START)"
                  @mouseup="sendCameraCmd(ptzCMD.ZOOM_IN_STOP)"
                />
              </span>
              <a-icon
                type="caret-right"
                @mousedown="sendCameraCmd(ptzCMD.PAN_RIGHT_START)"
                @mouseup="sendCameraCmd(ptzCMD.PAN_RIGHT_STOP)"
              />
              <a-icon
                type="caret-down"
                :rotate="45"
                @mousedown="sendCameraCmd(ptzCMD.DOWN_LEFT_START)"
                @mouseup="sendCameraCmd(ptzCMD.DOWN_LEFT_STOP)"
              />
              <a-icon
                type="caret-down"
                @mousedown="sendCameraCmd(ptzCMD.TILT_DOWN_START)"
                @mouseup="sendCameraCmd(ptzCMD.TILT_DOWN_STOP)"
              />
              <a-icon
                type="caret-down"
                :rotate="-45"
                @mousedown="sendCameraCmd(ptzCMD.DOWN_RIGHT_START)"
                @mouseup="sendCameraCmd(ptzCMD.DOWN_RIGHT_STOP)"
              />
            </div>
            <div class="aside-control__item col-1">
              <label>云台转速：</label>
              <a-slider
                v-model="cameraModel.ptzSpeed"
                class="slider"
                :min="1"
                :max="9"
                :included="false"
              />
            </div>
            <div class="aside-control__item col-3">
              <a-button
                size="small"
                type="primary"
                @mousedown="sendCameraCmd(ptzCMD.FOCUS_NEAR_START)"
                @mouseup="sendCameraCmd(ptzCMD.FOCUS_NEAR_STOP)"
                >近聚焦
              </a-button>
              <a-button
                size="small"
                type="primary"
                @mousedown="sendCameraCmd(ptzCMD.FOCUS_FAR_START)"
                @mouseup="sendCameraCmd(ptzCMD.FOCUS_FAR_STOP)"
                >远聚焦
              </a-button>
              <a-button size="small" type="primary" @click="sendCameraCmd(ptzCMD.LAMP_START)"
                >开灯
              </a-button>
            </div>
            <div class="aside-control__item col-3">
              <a-button
                size="small"
                type="primary"
                @mousedown="sendCameraCmd(ptzCMD.OPEN_IRIS_START)"
                @mouseup="sendCameraCmd(ptzCMD.OPEN_IRIS_STOP)"
                >开光圈
              </a-button>
              <a-button
                size="small"
                type="primary"
                @mousedown="sendCameraCmd(ptzCMD.CLOSE_IRIS_START)"
                @mouseup="sendCameraCmd(ptzCMD.CLOSE_IRIS_STOP)"
                >关光圈
              </a-button>
              <a-button size="small" type="primary" @click="sendCameraCmd(ptzCMD.LAMP_STOP)"
                >关灯
              </a-button>
            </div>
            <div class="aside-control__item col-2">
              <a-button size="small" type="primary" @click="sendCameraCmd(ptzCMD.SET_PRESET, 199)"
                >设置守望位
              </a-button>
              <a-button size="small" type="primary" @click="callWatchPreset(ptzCMD.GET_PRESET, 199)"
                >开启守望位
              </a-button>
            </div>
            <div class="aside-control__item col-1">
              <a-button
                size="small"
                type="primary"
                @click="sendCameraCmd(ptzCMD.SET_PRESET, cameraModel.setPreset)"
                >设置预置位
              </a-button>
              <a-input-number
                v-model="cameraModel.setPreset"
                :max="256"
                :min="1"
                size="small"
                placeholder="设置预置位"
              />
              <span>1-256</span>
            </div>
            <div class="aside-control__item col-1">
              <a-button
                size="small"
                type="primary"
                @click="sendCameraCmd(ptzCMD.GET_PRESET, cameraModel.getPreset)"
                >调用预置位
              </a-button>
              <a-input-number
                v-model="cameraModel.getPreset"
                :max="256"
                :min="1"
                size="small"
                placeholder="调用预置位"
              />
              <span>1-256</span>
            </div>
          </div>
          <div class="aside-title">预置点位</div>
          <ul class="camera-preset">
            <template v-if="cameraModel.presetList.length > 0">
              <!-- <li
                v-for="item in cameraModel.presetList"
                :key="item.id"
                @dblclick="sendCameraCmd(ptzCMD.GET_PRESET, item.preset_no)"
              > -->
              <li
                v-for="item in cameraModel.presetList"
                :key="item.id"
                @click="callPresetpoint(item.ptz_h, item.ptz_v, item.ipc_z)"
              >
                {{ item.name }}
              </li>
            </template>
            <a-empty v-else class="sg-empty" description="暂无点位信息" />
          </ul>
          <div class="aside-title">设备信息</div>
          <ul class="aside-info">
            <li>设备名称：{{ monitorInfo.name || '-' }}</li>
            <li>设备类型：{{ monitorInfo.manufacturer || '-' }}</li>
            <li>设备状态：{{ monitorInfo.status ? '在线' : '离线' }}</li>
          </ul>
        </aside>
      </section>
    </a-col>

    <a-modal
      v-model="monitorModal"
      dialog-class="sg-modal"
      :title="monitorModalTitle"
      :afterClose="afterModalClose"
      :footer="false"
      centered
    >
      <div class="monitor-modal">
        <img
          v-if="monitorAction === 'image'"
          class="monitor-modal__image"
          :src="monitorImage"
          alt=""
        />
        <swiper v-else class="monitor-modal__swiper" ref="swiper" :options="monitorOptions">
          <swiper-slide v-for="(item, index) in monitorVideos" :key="index">
            <sg-dplayer class="swiper-no-swiping" :ref="`dplayer-${index}`" :url="item" />
          </swiper-slide>
          <div v-show="monitorVideos.length > 1" class="swiper-pagination" slot="pagination"></div>
          <span
            v-show="monitorVideos.length > 1"
            class="swiper-button-prev"
            slot="button-prev"
          ></span>
          <span
            v-show="monitorVideos.length > 1"
            class="swiper-button-next"
            slot="button-next"
          ></span>
        </swiper>
      </div>
    </a-modal>
  </a-row>
</template>

<script>
import monitor from '@/mixins/monitor';
import SgRobot from '@/components/Monitor/Robot';
import SgCamera from '@/components/Monitor/Camera';
import SgDplayer from '@/components/Monitor/DPlayer';
// import ElTree from '@/components/Tree/Element/tree';

import {
  DETECTOR_MODE,
  ControlCMD,
  PtzCMD,
  RobotCMD,
  RobotSelf,
  RobotBody,
  RobotPTZ,
  RobotAssist,
  RobotLight,
  RobotIR,
} from '@/enum';

export default {
  name: 'IntegratedMonitor',
  mixins: [monitor],
  components: {
    SgRobot,
    SgCamera,
    SgDplayer,
  },
  computed: {
    ptzCMD() {
      return PtzCMD;
    },
    robotIR() {
      return RobotIR;
    },
    robotCMD() {
      return RobotCMD;
    },
    robotSelf() {
      return RobotSelf;
    },
    robotBody() {
      return RobotBody;
    },
    robotPtz() {
      return RobotPTZ;
    },
    robotLight() {
      return RobotLight;
    },
    robotAssist() {
      return RobotAssist;
    },
    robotModes() {
      return Object.entries(DETECTOR_MODE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
  },
  watch: {
    monitorList(arr) {
      // 未选中监控时重置控制参数
      if (arr.length === 0) {
        this.monitorIndex = 0;
        this.monitorType = '';
        this.robotId = '';
        this.cameraId = '';
        this.cameraNo = '';
        // 仅选中单个监控时重置控制栏及参数
      } else if (arr.length === 1) {
        const monitor = arr[0];
        this.monitorIndex = 0;
        this.monitorType = monitor.type;
        this.monitorInfo = monitor.defector || {};
        if (monitor.type === 'robot') {
          this.robotId = monitor.detector && monitor.detector.id;
        } else {
          this.cameraId = monitor.did;
          this.cameraNo = monitor.cno;
          this.cameraCode = monitor.detector.id;
          this.getCameraPresets();
        }
      }
    },
    detectorList(arr) {
      // 设备数>1时开启视频流轮巡
      // if (arr.length > 1 && !this.detectorPolling) {
      //   this.detectorPolling = setInterval(() => {
      //     if (this.detectorIndex === arr.length - 1) {
      //       this.detectorIndex = 0;
      //     } else {
      //       this.detectorIndex++;
      //     }
      //     this.monitorList = [arr[this.detectorIndex]];
      //   }, 10000);
      // }
      // 设备数<=1时关闭视频流轮巡
      if (arr.length <= 1 && this.detectorPolling) {
        clearInterval(this.detectorPolling);
        this.detectorIndex = 0;
        this.detectorPolling = null;
        this.monitorList = arr.length === 1 ? [...arr] : [];
      }
    },
  },
  data() {
    const $vm = this;
    return {
      userIdentify: false,
      robotId: '',
      robotModel: {
        robotMode: 1,
        robotModePrev: 1,
        forwardSpeed: undefined,
        backwardSpeed: undefined,
        turnLeftSpeed: undefined,
        turnRightSpeed: undefined,
        presetNumber: undefined,
        power: false,
        wiper: false,
        spotlight: false,
        untrlsound: false,
        ratioValue: 1,
        focusValue: 1,
        focalLength: 1,
      },
      cameraId: '',
      cameraNo: '',
      cameraCode: '',
      cameraModel: { ptzSpeed: 5, setPreset: 1, getPreset: 1, presetList: [] },
      displayMode: 1,
      deviceTree: 1,
      deviceState: 0,
      deviceFocus: 0,
      monitorIndex: 0,
      monitorType: '',
      monitorInfo: {},
      monitorList: [],
      monitorModal: false,
      monitorModalTitle: '',
      monitorAction: 'image',
      monitorImage: null,
      monitorVideos: [],
      monitorOptions: {
        observer: true,
        observeParents: true,
        pagination: { el: '.swiper-pagination' },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        on: {
          slideChange: () => {
            const prevPlayer = $vm.$refs[`player-${this.previousIndex}`][0];
            prevPlayer && prevPlayer.pauseVideo();
            const nextPlayer = $vm.$refs[`player-${this.activeIndex}`][0];
            nextPlayer && nextPlayer.playVideo();
          },
        },
      },
      detectorList: [],
      detectorIndex: 0,
      detectorInterval: 30,
      detectorPolling: null,
    };
  },
  created() {
    this.onWebsocketPush();
  },
  beforeDestroy() {
    this.$bus.$off('stomp');
    this.$bus.$off('cancelled');
    this.$bus.$off('identified');
    if (this.detectorPolling) {
      clearInterval(this.detectorPolling);
      this.detectorPolling = null;
    }
  },
  methods: {
    handleDisplayMode(mode) {
      if (this.displayMode !== mode) {
        this.displayMode = mode;
      }
    },
    handleCloseAll() {
      this.monitorList = [];
    },
    handleFocusNode(node) {
      console.log(node);
      node.focused = !node.focused;
    },
    handleDetectorPolling(action) {
      if (action === 'reboot') {
        if (this.detectorPolling) {
          clearInterval(this.detectorPolling);
          this.detectorPolling = null;
        }
        // 设备数>1时开启视频流轮巡
        if (this.detectorList.length > 1) {
          this.detectorPolling = setInterval(() => {
            if (this.detectorIndex === this.detectorList.length - 1) {
              this.detectorIndex = 0;
            } else {
              this.detectorIndex++;
            }
            this.monitorList = [this.detectorList[this.detectorIndex]];
          }, this.detectorInterval * 1000);
        } else {
          this.$message.warn('请选中多个设备再开启轮巡！');
        }
      } else if (action === 'switch') {
        if (this.detectorPolling) {
          clearInterval(this.detectorPolling);
          this.detectorPolling = null;
        } else {
          if (this.detectorList.length > 1) {
            this.detectorPolling = setInterval(() => {
              if (this.detectorIndex === this.detectorList.length - 1) {
                this.detectorIndex = 0;
              } else {
                this.detectorIndex++;
              }
              this.monitorList = [this.detectorList[this.detectorIndex]];
            }, this.detectorInterval * 1000);
          } else {
            this.$message.warn('请选中多个设备再开启轮巡！');
          }
        }
      }
    },
    onWebsocketPush() {
      this.$bus.$on('stomp', (msg) => {
        const { action, item } = msg;
        if (action === 'detector_station_status' && item.type === 2) {
          const node = this.treeLoaded.find((node) => node.id === item.detector_id);
          node && (node.state = `sg-state__detector-${item.value}`);
        }
      });
    },
    onMointorClosed(index) {
      if (this.monitorIndex === index) {
        this.monitorIndex = 0;
        this.monitorType = '';
        this.robotId = '';
        this.cameraId = '';
        this.cameraNo = '';
      }
      this.monitorList.splice(index, 1);
    },
    onMointorSelected(index) {
      const monitor = this.monitorList[index];
      this.monitorIndex = index;
      this.monitorInfo = monitor.detector || {};
      this.monitorType = monitor.type === 'robot' ? 'robot' : 'camera';
      // 根据监控设备类型设置对应参数
      if (monitor.type === 'robot') {
        this.robotId = monitor.detector && monitor.detector.id;
      } else {
        this.cameraId = monitor.did;
        this.cameraNo = monitor.cno;
        this.getCameraPresets();
      }
    },
    onMonitorRecord({ videos, title }) {
      this.monitorAction = 'video';
      this.monitorVideos =
        videos ||
        Array(3).fill(
          'https://s1.pstatp.com/cdn/expire-1-M/byted-player-videos/1.0.0/xgplayer-demo.mp4'
        );
      this.monitorModalTitle = title;
      this.monitorModal = true;
    },
    onMonitorScreenshot({ image, title }) {
      this.monitorAction = 'image';
      this.monitorImage = image || require('@/assets/images/img_substation.jpg');
      this.monitorModalTitle = title;
      this.monitorModal = true;
    },
    onTreeChange() {
      // console.log(e.target.value);
      // 重置资源数据
      if (!this.loadedKeys.length) return;
      this.loadedKeys = [];
      this.checkedKeys = [];
      this.expandedKeys = [];
      this.getTreeData();
      if (this.treeRadio !== 'patrol') {
        // 重置轮询设备数据
        this.detectorList = [];
        this.detectorIndex = 0;
        if (this.detectorPolling) {
          clearInterval(this.detectorPolling);
          this.detectorPolling = null;
        }
      }
    },
    onDeviceTreeChange(e, type) {
      switch (type) {
        case 'tree':
          if (this.treeRadio !== 'device') return;
          this.loadedKeys = [];
          this.checkedKeys = [];
          this.expandedKeys = [];
          this.getTreeData();
          break;
        case 'state':
          {
            switch (e.target.value) {
              case 0:
                if (this.deviceFocus === 0) {
                  this.treeData = this.filterTreeNodes(this.treeData);
                } else if (this.deviceFocus === 1) {
                  this.treeData = this.filterTreeNodes(
                    this.treeData,
                    (node) => node.focused || node.focused === undefined
                  );
                } else {
                  this.treeData = this.filterTreeNodes(this.treeData, (node) => !node.focused);
                }
                break;
              case 1:
                if (this.deviceFocus === 0) {
                  this.treeData = this.filterTreeNodes(this.treeData, (node) => !node.disabled);
                } else if (this.deviceFocus === 1) {
                  this.treeData = this.filterTreeNodes(
                    this.treeData,
                    (node) => !node.disabled && (node.focused || node.focused === undefined)
                  );
                } else {
                  this.treeData = this.filterTreeNodes(
                    this.treeData,
                    (node) => !node.disabled && !node.focused
                  );
                }
                break;
              case 2:
                if (this.deviceFocus === 0) {
                  this.treeData = this.filterTreeNodes(
                    this.treeData,
                    (node) => node.disabled || node.disabled === undefined
                  );
                } else if (this.deviceFocus === 1) {
                  this.treeData = this.filterTreeNodes(
                    this.treeData,
                    (node) =>
                      (node.disabled || node.disabled === undefined) &&
                      (node.focused || node.focused === undefined)
                  );
                } else {
                  this.treeData = this.filterTreeNodes(
                    this.treeData,
                    (node) => (node.disabled || node.disabled === undefined) && !node.focused
                  );
                }
                break;
              default:
                break;
            }
          }
          break;
        case 'focus':
          {
            switch (e.target.value) {
              case 0:
                if (this.deviceState === 0) {
                  this.treeData = this.filterTreeNodes(this.treeData);
                } else if (this.deviceState === 1) {
                  this.treeData = this.filterTreeNodes(this.treeData, (node) => !node.disabled);
                } else {
                  this.treeData = this.filterTreeNodes(
                    this.treeData,
                    (node) => node.disabled || node.disabled === undefined
                  );
                }
                break;
              case 1:
                if (this.deviceState === 0) {
                  this.treeData = this.filterTreeNodes(
                    this.treeData,
                    (node) => node.focused || node.focused === undefined
                  );
                } else if (this.deviceState === 1) {
                  this.treeData = this.filterTreeNodes(
                    this.treeData,
                    (node) => !node.disabled && (node.focused || node.focused === undefined)
                  );
                } else {
                  this.treeData = this.filterTreeNodes(
                    this.treeData,
                    (node) =>
                      (node.disabled || node.disabled === undefined) &&
                      (node.focused || node.focused === undefined)
                  );
                }
                break;
              case 2:
                if (this.deviceState === 0) {
                  this.treeData = this.filterTreeNodes(this.treeData, (node) => !node.focused);
                } else if (this.deviceState === 1) {
                  this.treeData = this.filterTreeNodes(
                    this.treeData,
                    (node) => !node.disabled && !node.focused
                  );
                } else {
                  this.treeData = this.filterTreeNodes(
                    this.treeData,
                    (node) => (node.disabled || node.disabled === undefined) && !node.focused
                  );
                }
                break;
              default:
                break;
            }
          }
          break;
        default:
          break;
      }
    },
    onRobotModeChange(e) {
      this.sendRobotCmd(RobotCMD.SELF, RobotSelf.SWITCH_MODE, e.target.value);
    },
    onRobotModeSelect(val) {
      this.sendRobotCmd(RobotCMD.SELF, RobotSelf.SWITCH_MODE, val);
    },
    onRobotSwitchChange(checked, cmd) {
      console.log(checked, cmd);
      this.sendRobotCmd(RobotCMD.ASSIST, cmd, checked ? 1 : 2);
    },
    afterModalClose() {
      if (this.monitorAction !== 'video' || this.monitorVideos.length === 0) return;
      this.monitorVideos.forEach((_, index) => {
        const dplayer = this.$refs[`dplayer-${index}`];
        dplayer && dplayer[0].destroyVideo();
      });
    },
    sendRobotCmd(type, cmd, val, dir) {
      if (!this.robotId) return;
      if (
        (type === RobotCMD.SELF &&
          (cmd === RobotSelf.REMOTE_RESET ||
            cmd === RobotSelf.RETURN_BACK ||
            cmd === RobotSelf.SWITCH_MODE ||
            cmd === RobotSelf.GAIN_CONTROL)) ||
        (type === RobotCMD.PTZ && cmd === RobotPTZ.RESET) ||
        (type === RobotCMD.INFRARED_RAY && cmd === RobotIR.REBOOT)
      ) {
        this.$bus.$emit('identify');
        if (!this.userIdentify) {
          this.userIdentify = true;
          this.$bus.$on('cancelled', () => {
            if (cmd === RobotSelf.SWITCH_MODE) {
              this.robotModel.robotMode = this.robotModel.robotModePrev;
            }
          });
          this.$bus.$on('identified', () => {
            if (cmd === RobotSelf.SWITCH_MODE) {
              this.robotModel.robotModePrev = val;
            }
            this.$api
              .postControlApi({
                action: ControlCMD.REMOTE_CONTROL,
                detector_id: this.robotId,
                type: type,
                value: val,
                command: cmd,
                direction: dir,
                syn: '机器人控制指令下发',
              })
              .then(() => {
                this.$message.success('机器人控制指令发送成功！');
              })
              .catch(() => {
                this.$message.error('机器人控制指令发送失败！');
              });
          });
        }
      } else {
        this.$api
          .postControlApi({
            action: ControlCMD.REMOTE_CONTROL,
            detector_id: this.robotId,
            type: type,
            value: val,
            command: cmd,
            direction: dir,
            syn: '机器人控制指令下发',
          })
          .then(() => {
            this.$message.success('机器人控制指令发送成功！');
          })
          .catch(() => {
            this.$message.error('机器人控制指令发送失败！');
          });
      }
    },
    callPresetpoint(ptzh,ptzv,ptzz){
      console.log(ptzh,ptzv,ptzz);
      this.$api
        .getMediaApi('setptzpos', {
          idx: this.cameraId,
          no: this.cameraNo,
          ptzh: ptzh,
          ptzv: ptzv,
          ptzz: ptzz,
        })
        .then((res) => {
          // if (res.success) {
          //   // 设置云台状态
          //   if ((cmd & 1) === 0) {
          //     this.rotate = true;
          //   } else {
          //     this.command = 0;
          //     this.rotate = false;
          //   }
          // }
        });      
    },
    sendCameraCmd(cmd, para1, para2) {
      if (!this.cameraId || !this.cameraNo) return;
      this.$api
        .getMediaApi('ptzControl', {
          idx: this.cameraId,
          no: this.cameraNo,
          command: cmd,
          para1: para1 || this.cameraModel.ptzSpeed,
          para2: para2 || this.cameraModel.ptzSpeed,
        })
        .then((res) => {
          if (res.success) {
            // 设置云台状态
            if ((cmd & 1) === 0) {
              this.rotate = true;
            } else {
              this.command = 0;
              this.rotate = false;
            }
          }
        });
    },
    callWatchPreset(command, code) {
      let times = 1;
      this.sendCameraCmd(command, code);
      const interval = setInterval(() => {
        if (times === 10) clearInterval(interval);
        this.sendCameraCmd(command, code);
        times++;
      }, 5000);
    },
    resetDeviceTree(arr) {
      for (let i = 0, len = arr.length; i < len; i++) {
        const node = arr[i];
        if (node.tier === 2) {
          node.children = [];
          node.isLeaf = false;
          const index = this.expandedKeys.indexOf(node.key);
          if (index > -1) {
            this.expandedKeys.splice(index, 1);
          }
        }
        if (node.children && node.children.length > 0) {
          this.resetDeviceTree(node.children);
        }
      }
      return arr;
    },
    getCameraPresets() {
      if (!this.cameraCode) return;
      this.$api
        .getBaseApi('preset', {
          detector: this.cameraCode,
        })
        .then((res) => {
          if (!res) return;
          this.cameraModel.presetList = res.results;
        });
    },
  },
};
</script>

<style lang="less" scoped>
.wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}
.monitor {
  position: relative;
  width: 80%;
  height: 100%;
  background-color: #000;

  &.patrol {
    .monitor-toolbar {
      display: none;
    }
    .monitor-wrapper {
      height: 100%;
    }
  }
  &-toolbar {
    z-index: 100;
    display: flex;
    align-items: center;
    // justify-content: flex-end;
    width: 100%;
    height: 3vh;
    padding: 0 10px;
    background-color: #222;

    .anticon {
      color: #aaa;
      font-size: 20px;

      + .anticon {
        margin-left: 10px;
      }
      &:hover {
        color: @theme-color3;
      }
    }
    .ant-btn {
      margin-left: auto;
      font-weight: bold;
    }
  }
  &-wrapper {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    width: 100%;
    height: calc(100% - 3vh);
  }
  &-modal {
    width: 100%;
    height: 60vh;

    &__image {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    &__swiper {
      width: 100%;
      height: 100%;

      /deep/ .swiper-pagination {
        width: auto;
        left: 50%;
        transform: translateX(-50%);
      }
    }
  }
}
.aside {
  display: inline-flex;
  align-items: center;
  flex-direction: column;
  width: 20%;
  height: 100%;
  color: #fff;
  overflow-y: auto;
  background-color: #333;

  &-title {
    width: 100%;
    height: 3vh;
    padding-left: 10px;
    line-height: 3vh;
    font-size: 16px;
    font-weight: bold;
    background-color: #000;
  }
  &-control {
    width: 100%;
    padding: 10px;

    &__item {
      display: flex;
      align-items: center;
      justify-content: space-around;
      width: 100%;
      white-space: nowrap;

      + .aside-control__item {
        margin-top: 10px;
      }
      .ant-btn {
        padding: 0;
      }
      &.col-1 {
        > span {
          width: 20%;
        }
        > .ant-btn {
          width: 25%;
        }
        /deep/ .ant-slider {
          width: 200px;
          margin: 0;

          &-rail {
            background-color: #ccc;
          }
        }
        /deep/ .ant-input-number {
          width: 50%;
          &-input {
            color: #fff;
            background-color: #000;
          }
        }
      }
      &.col-2 > .ant-btn {
        width: 40%;
      }
      &.col-3 > .ant-btn {
        width: 30%;
      }
      &.col-4 > .ant-btn {
        width: 24%;
      }
    }
    &__col {
      display: inline-flex;
      align-items: center;
    }
  }
  &-info {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 10px;

    li {
      margin-bottom: 10px;
    }
  }
}
.camera {
  &-operate {
    display: flex;
    flex-wrap: wrap;
    align-content: space-between;
    justify-content: space-between;
    width: 200px;
    height: 200px;
    margin: 0 auto 1vh;

    .zoom {
      display: inline-flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .anticon {
      width: 60px;
      height: 60px;
      color: #fff;
      font-size: 40px;
      line-height: 60px;
      background-color: #aaa;
      cursor: pointer;

      &.anticon-plus,
      &.anticon-minus {
        height: 28px;
        font-size: 30px;
        line-height: 28px;
      }
      &:hover {
        background-color: #ccc;
      }
      &:active {
        color: @theme-color1;
        background-color: #eee;
      }
    }
  }
  &-preset {
    width: 100%;
    height: 30vh;
    overflow-y: auto;

    li {
      width: 100%;
      height: 4vh;
      padding-left: 10px;
      line-height: 4vh;
      border-bottom: 1px solid #444;
      cursor: pointer;
      .text-ellipsis();

      &:hover {
        background-color: #222;
      }
    }
  }
}
</style>
