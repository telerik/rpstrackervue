<template>
  <div class="row">
    <div class="col-12 col-lg-6 col-xl pb-4 active-issues">
      <span class="comp-label">
        <strong>{{statusCounts.activeItemsCount}}</strong>
        <small>Active issues</small>
      </span>
    </div>

    <div class="col-12 col-lg-6 col-xl pb-4 text-success closed-issues">
      <span class="comp-label">
        <strong>{{statusCounts.closedItemsCount}}</strong>
        <small>Closed issues</small>
      </span>
    </div>

    <div class="col-12 col-lg-6 col-xl pb-4 text-danger open-issues">
      <span class="comp-label">
        <strong>{{statusCounts.openItemsCount}}</strong>
        <small>Open issues</small>
      </span>
    </div>

    <div class="col-12 col-lg-6 col-xl pb-4 close-rate">
      <span class="comp-label">
        <strong>{{Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 }).format(statusCounts.closeRate)}}</strong>
        <small>Close rate</small>
      </span>
      <p class="m-0 small text-uppercase text-muted">
        Highest:
        100%
        on Oct 11, 2018
      </p>
      <p class="m-0 small text-uppercase text-muted">
        Lowest:
        20%
        on Oct 9, 2018
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { StatusCounts } from '@/shared/models/ui/stats';

export default defineComponent({
  name: "ActiveIssues",
  props: {
    statusCounts: Object as PropType<StatusCounts>,
  },
});
</script>

<style scoped>
.comp-label strong {
  font-size: 4em;
  line-height: 1;
  font-weight: 200;
  display: block;
}
.comp-label small {
  font-size: 0.7em;
  text-transform: uppercase;
  display: block;
}
</style>
