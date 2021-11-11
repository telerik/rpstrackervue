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
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            @click="(e) => onMonthRangeTap(3)"
          >3 Months</button>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            @click="(e) => onMonthRangeTap(6)"
          >6 Months</button>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            @click="(e) => onMonthRangeTap(12)"
          >1 Year</button>
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

interface DateRange {
  dateStart: Date;
  dateEnd: Date;
}

import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "DashboardPage",
  components: {
    ActiveIssues,
  },
  setup() {
    const filter = ref<DashboardFilter>({});
    const statusCounts = ref<StatusCounts>({
      activeItemsCount: 0,
      closeRate: 0,
      closedItemsCount: 0,
      openItemsCount: 0,
    });
    const categories = ref<Date[]>([]);
    const itemsOpenByMonth = ref<number[]>([]);
    const itemsClosedByMonth = ref<number[]>([]);

    const dashboardRepo: DashboardRepository = new DashboardRepository();
    const dashboardService: DashboardService = new DashboardService(
      dashboardRepo
    );

    const refresh = () => {
      dashboardService.getStatusCounts(filter.value as DashboardFilter).then((result) => {
        statusCounts.value = result;
      });
    };
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
    };
  }
});
</script>
