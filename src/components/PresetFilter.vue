<template>
  <div class="btn-group mr-2">
    <button
      type="button"
      class="btn btn-sm btn-outline-secondary"
      @click="onSelectPresetTap('my')"
    >My Items</button>
    <button
      type="button"
      class="btn btn-sm btn-outline-secondary"
      @click="onSelectPresetTap('open')"
    >Open Items</button>
    <button
      type="button"
      class="btn btn-sm btn-outline-secondary"
      @click="onSelectPresetTap('closed')"
    >Done Items</button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { PresetType } from "@/core/models/domain/types";

export default defineComponent({
  name: "PresetFilter",
  setup(_props, context) {
    const onSelectPresetTap = (preset: PresetType) => {
      context.emit("onPresetSelected", preset);
    };

    return {
      onSelectPresetTap,
    };
  },
});
</script>
