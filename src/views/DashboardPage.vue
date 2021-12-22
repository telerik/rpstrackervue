<template>
  <div class="dashboard">
    <div
      class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3"
    >
      <div class="col-md order-md-first text-center text-md-left">
        <h2>
          <span class="small text-uppercase text-muted d-block">Statistics</span>
          <span
            v-if="filter.dateStart && filter.dateEnd"
          >{{formatDateEnUs(filter.dateStart)}} - {{formatDateEnUs(filter.dateEnd)}}</span>
        </h2>
      </div>

      <div class="btn-toolbar mb-2 mb-md-0">
        <div class="btn-group mr-2">

          <kendo-combobox
            :data-items="users"
            :text-field="'fullName'"
            :placeholder="'Select assignee...'"
            :item-render="'userFilterItemTemplate'"
            @open="userFilterOpen"
            @change="userFilterValueChange"
            style="width: 250px;"
          >
            <template v-slot:userFilterItemTemplate="{props}">
              <div class="row k-item" style="margin-left: 5px;" @click="(e) => props.onClick(e)">
                <img class="li-avatar rounded" :src="props.dataItem.avatar" />
                <span style="margin-left: 5px;">{{ props.dataItem.fullName }}</span>
              </div>
            </template>
          </kendo-combobox>
          
          <kendo-buttongroup>
            <kendo-button
              icon="calendar"
              @click="(e) => onMonthRangeTap(3)"
            >3 Months</kendo-button>
            <kendo-button
              icon="calendar"
              @click="(e) => onMonthRangeTap(6)"
            >6 Months</kendo-button>
            <kendo-button
              icon="calendar"
              @click="(e) => onMonthRangeTap(12)"
            >1 Year</kendo-button>
          </kendo-buttongroup>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-header">Active Issues</h3>
      <div class="card-block">
        <ActiveIssues :statusCounts="statusCounts"/>

        <div class="row">
          <div class="col-sm-12">
            <h3>All issues</h3>


              <kendo-chart>
                <ChartTitle :text="'All Issues'" :position="'top'" :align="'center'" />

                <ChartCategoryAxis>
                  <ChartCategoryAxisItem
                    :categories="categories" :majorGridLines="false" :baseUnit="'months'" />
                </ChartCategoryAxis>

                <ChartLegend :position="'bottom'" />
                <ChartSeriesDefaults :type="'column'" :stack="true" :gap="0.06" />
                <ChartSeries>
                  <ChartSeriesItem
                    :name="'Open'"
                    :color="'#CC3458'"
                    :opacity="0.7"
                    :data-items="itemsOpenByMonth" />
                  <ChartSeriesItem
                    :name="'Closed'"
                    :color="'#35C473'"
                    :opacity="0.7"
                    :data-items="itemsClosedByMonth" />
                </ChartSeries>
              </kendo-chart>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  DashboardRepository,
  DashboardFilter,
  FilteredIssues,
} from "@/repositories/dashboard-repository";
import { DashboardService } from "@/services/dashboard-service";
import {
    TypeCounts,
    PriorityCounts,
    StatusCounts,
} from "@/shared/models/ui/stats";
import { formatDateEnUs } from "@/core/helpers/date-utils";
import ActiveIssues from "@/components/dashboard/ActiveIssues.vue";

import { Button, ButtonGroup } from '@progress/kendo-vue-buttons';
import { ComboBox, ComboBoxChangeEvent } from '@progress/kendo-vue-dropdowns';
import { 
  Chart, 
  ChartSeries, 
  ChartSeriesItem, 
  ChartTitle,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartSeriesDefaults,
  ChartLegend
   } from '@progress/kendo-vue-charts';


interface DateRange {
  dateStart: Date;
  dateEnd: Date;
}

import { defineComponent, ref } from "vue";
import { PtUser } from "@/core/models/domain";
import { PtUserService } from "@/core/services/pt-user-service";
import { Store } from "@/core/state/app-store";
import { Observable } from "rxjs";

export default defineComponent({
  name: "DashboardPage",
  components: {
    ActiveIssues,
    'kendo-button': Button,
    'kendo-buttongroup': ButtonGroup,
    'kendo-combobox': ComboBox,
    'kendo-chart': Chart,
    ChartSeries, 
    ChartSeriesItem,
    ChartTitle,
    ChartCategoryAxis,
    ChartCategoryAxisItem,
    ChartSeriesDefaults,
    ChartLegend
  },
  setup() {
    const filter = ref<DashboardFilter>({});
    const statusCounts = ref<StatusCounts>({
      activeItemsCount: 0,
      closeRate: 0,
      closedItemsCount: 0,
      openItemsCount: 0,
    });

    // chart properties
    const categories = ref<Date[]>([]);
    const itemsOpenByMonth = ref<number[]>([]);
    const itemsClosedByMonth = ref<number[]>([]);

    const dashboardRepo: DashboardRepository = new DashboardRepository();
    const dashboardService: DashboardService = new DashboardService(
      dashboardRepo
    );

    const store: Store = new Store();
    const userService: PtUserService = new PtUserService(store);
    const users = ref<PtUser[]>([]);
    const users$: Observable<PtUser[]> = store.select<PtUser[]>('users');

    users$.subscribe((newUsers: PtUser[]) => {
      users.value = newUsers;
    });

    const refresh = () => {

      Promise.all<StatusCounts, FilteredIssues>([
        dashboardService.getStatusCounts(filter.value as DashboardFilter),
        dashboardService.getFilteredIssues(filter.value as DashboardFilter)
      ]).then((results) => {
        statusCounts.value = results[0];
        updateStats(results[1]);
      });
    };

    const updateStats = (issuesAll: FilteredIssues) => {
      const cats = issuesAll.categories.map(c=> new Date(c));

      const open: number[] = [];
      const closed: number[] = [];

      issuesAll.items.forEach((item) => {
        open.push(item.open.length);
        closed.push(item.closed.length);
      });

      categories.value = cats;
      itemsOpenByMonth.value = open;
      itemsClosedByMonth.value = closed;
    };


    const userFilterOpen = () => {
      userService.fetchUsers();
    }

    const userFilterValueChange = (e: ComboBoxChangeEvent) => {
      const selectedUser: PtUser = e.value as PtUser;

      if (selectedUser) {
        filter.value.userId = selectedUser.id;
      } else {
        filter.value.userId = undefined;
      }

      refresh();
    }

    refresh();

    const onMonthRangeTap = (months: number) => {
      const range = getDateRange(months);
      filter.value = {
        userId: filter.value.userId,
        dateEnd: range.dateEnd,
        dateStart: range.dateStart,
      };
      refresh();
    };

    const getDateRange = (months: number): DateRange => {
      const now = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - months);
      return {
        dateStart: start,
        dateEnd: now,
      };
    };

    return {
      formatDateEnUs,
      onMonthRangeTap,
      refresh,
      filter,
      statusCounts,
      categories,
      itemsOpenByMonth,
      itemsClosedByMonth,
      users,
      userFilterOpen,
      userFilterValueChange,
    };
  }
});
</script>
