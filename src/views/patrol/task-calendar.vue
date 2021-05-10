<template>
  <a-row class="sg-row" :gutter="10">
    <a-col class="sg-col" :span="4">
      <sg-tree @check="onTreeCheck" />
    </a-col>
    <a-col class="sg-col calendar" :span="14">
      <header class="task-monthly__header">巡视任务月历</header>
      <ul class="task-monthly__footer">
        <li
          v-for="(item, index) in taskStates"
          :key="index"
          :class="`sg-state__task-${item.value}`"
        >
          <span>{{ item.label }}</span> <i></i>
        </li>
      </ul>
      <a-spin :spinning="taskLoad">
        <a-calendar
          class="task-monthly"
          v-model="currentDate"
          @select="onCalendarSelect"
          @change="onCalendarChange"
        >
          <template v-slot:dateFullCellRender="date">
            <div class="task-monthly__wrapper">
              <div class="task-monthly__title">
                <span v-if="taskMonthly[date.format('YYYY-MM-DD')]">
                  任务数: {{ taskMonthly[date.format('YYYY-MM-DD')].length }}
                </span>
                <span class="task-monthly__day">{{ date.date() }}</span>
              </div>
              <ul class="task-monthly__list">
                <li
                  v-for="(item, index) in taskMonthly[date.format('YYYY-MM-DD')]"
                  :class="['task-monthly__item', `sg-state__task-${item.status}`]"
                  :key="index"
                >
                  <div>{{ `${item.substation}` }}</div>
                  <div>{{ `${item.name}-${item.time}` }}</div>
                </li>
              </ul>
            </div>
          </template>
        </a-calendar>
      </a-spin>
    </a-col>
    <a-col class="sg-col" :span="6">
      <a-list
        class="task-daily"
        :data-source="taskDaily"
        item-layout="vertical"
        header="巡视任务日历"
        bordered
      >
        <template v-slot:renderItem="item">
          <li class="task-daily__item">
            <div class="task-daily__item-header">
              <span>{{ item.substation }}</span>
              <span>{{ `${item.date} ${item.time}` }}</span>
            </div>
            <div class="task-daily__item-content" :class="`sg-state__task-${item.status}`">
              {{ item.name }}({{ item.state }})
            </div>
          </li>
        </template>
      </a-list>
    </a-col>
  </a-row>
</template>

<script>
import _ from 'lodash';
import { TASK_STATUS } from '@/enum';
import { extractDate, extractTime } from '@/utils';
import SgTree from '@/components/Tree/Antd';

export default {
  name: 'TaskCalendar',
  components: {
    SgTree,
  },
  computed: {
    taskStates() {
      return Object.entries(TASK_STATUS).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
  },
  data() {
    return {
      stationId: '',
      currentDate: this.$moment(),
      taskDate: this.$moment(),
      taskInit: false,
      taskLoad: false,
      taskDaily: [],
      taskMonthly: {},
      dateStart: this.$moment().startOf('M').format('YYYY-MM-DD'),
      dateEnd: this.$moment().endOf('M').format('YYYY-MM-DD'),
    };
  },
  created() {
    this.getTaskData();
  },
  methods: {
    onTreeCheck(_, { node, checked }) {
      const { dataRef } = node;
      if (checked) {
        this.stationId = dataRef.id;
      } else {
        this.stationId = '';
      }
      this.getTaskData();
    },
    onCalendarSelect(moment) {
      const date = moment.format('YYYY-MM-DD');
      this.taskDaily = this.taskMonthly[date] || [];
    },
    onCalendarChange(moment) {
      if (this.taskDate.year() !== moment.year() || this.taskDate.month() !== moment.month()) {
        this.taskDate = moment;
        this.dateStart = moment.startOf('M').format('YYYY-MM-DD');
        this.dateEnd = moment.endOf('M').format('YYYY-MM-DD');
        this.getTaskData();
      }
    },
    getTaskData() {
      this.taskLoad = true;
      Promise.all([
        this.$api.getBaseApi('plantask_depth', {
          substation: this.stationId,
          plantime__range: `${this.dateStart},${this.dateEnd}`,
        }),
        this.$api.postHistoryApi('historytask', '_search', {
          query: {
            bool: {
              must: this.stationId ? [{ match: { substation_id: this.stationId } }] : undefined,
              filter: [{ range: { start_time: { gt: this.dateStart, lt: this.dateEnd } } }],
            },
          },
          _source: { excludes: ['image'] },
          track_total_hits: true,
        }),
      ])
        .then(([res1, res2]) => {
          let taskMap = {};
          if (res1 && res1.count > 0) {
            res1.results.forEach((item) => {
              const date = extractDate(item.plantime);
              const dataItem = {
                id: item.id,
                name: item.name,
                substation: item.substation.name,
                date: date,
                time: extractTime(item.plantime),
                status: 0,
                state: '未执行',
              };
              if (!taskMap[date]) {
                taskMap[date] = [dataItem];
              } else {
                taskMap[date].push(dataItem);
              }
            });
          }
          if (res2 && res2.hits.total.value > 0) {
            res2.hits.hits.forEach((item) => {
              const source = item._source;
              const dateStart = extractDate(source.start_time);
              const dataItem = {
                id: source.plantask_id,
                name: source.plantask_name,
                substation: source.substation_name,
                date: dateStart,
                time: extractTime(source.start_time),
                status: source.status,
                state: TASK_STATUS[source.status],
              };
              if (!taskMap[dateStart]) {
                taskMap[dateStart] = [dataItem];
              } else {
                taskMap[dateStart].push(dataItem);
              }
              // if (dateStart !== dateEnd) {
              //   const tableItem = {
              //     id: source.task_id,
              //     name: source.task_name,
              //     status: source.status,
              //     date: dateEnd,
              //   };
              //   if (!taskMap[dateEnd]) {
              //     taskMap[dateEnd] = [taskItem];
              //   } else {
              //     taskMap[dateEnd].push(taskItem);
              //   }
              // }
            });
          }
          this.taskMonthly = taskMap;
          if (!this.taskInit) {
            const date = this.currentDate.format('YYYY-MM-DD');
            this.taskDaily = this.taskMonthly[date] || [];
            this.taskInit = true;
          }
        })
        .finally(() => {
          this.taskLoad = false;
        });
    },
  },
};
</script>

<style lang="less" scoped>
.calendar {
  background-color: #fff;
}
.task-monthly {
  width: 100%;
  height: 100%;
  // background-color: #fff;
  &__wrapper {
    height: 12vh;
    padding: 0 10px;
  }
  &__title {
    display: flex;
    align-items: center;
    width: 100%;
    height: 2vh;
    font-weight: 600;
  }
  &__day {
    margin-left: auto;
  }
  &__list {
    height: 10vh;
    overflow-y: auto;
  }
  &__item {
    font-size: 12px;
    + .task-monthly__item {
      border-top: 1px solid currentColor;
    }
  }
  &__header {
    z-index: 100;
    position: absolute;
    top: 0;
    left: 50%;
    height: 5vh;
    line-height: 5vh;
    color: #fff;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    transform: translateX(-50%);
  }
  &__footer {
    display: flex;
    align-items: center;
    position: absolute;
    left: 0;
    bottom: 0;
    height: 4vh;
    line-height: 4vh;
    padding-left: 10px;

    li {
      display: inline-flex;
      align-items: center;

      + li {
        margin-left: 10px;
      }
      > i {
        width: 10px;
        height: 10px;
        margin-left: 5px;
        border-radius: 50%;
        background-color: currentColor;
      }
    }
  }
  /deep/ .ant-fullcalendar {
    &-header {
      width: 100%;
      height: 5vh;
      padding: 0 15px;
      line-height: 5vh;
      background-color: @theme-color1;
    }
    &-table {
      height: 80vh;
      background-color: #fff;
    }
    &-cell {
      border: @border-default;
    }
    &-date {
      border-top: 0;
    }
    &-calendar-body {
      padding: 0;
    }
    &-column-header {
      padding: 5px 10px;
      text-align: center;
      border: @border-default;
      background-color: @theme-color2;
    }
    &-last-month-cell,
    &-next-month-btn-day {
      .task-monthly__day {
        color: #ccc;
      }
    }
  }
}
.task-daily {
  width: 100%;
  height: 100%;
  background-color: #fff;

  /deep/ .ant-list {
    &-header {
      height: 5vh;
      line-height: 5vh;
      padding: 0 20px;
      font-size: 18px;
      font-weight: bold;
    }
    &-items {
      width: 100%;
      height: 84vh;
      overflow-y: auto;
    }
  }
  &__item {
    padding: 10px;
    font-size: 16px;
    border-bottom: @border-light;

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    &-content {
      margin-top: 1vh;
    }
  }
}
</style>
