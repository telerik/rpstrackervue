<template>
  <div>
    <div
      class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3"
    >
      <h1 class="h2">Backlog</h1>
      <div class="btn-toolbar mb-2 mb-md-0">
        <PresetFilter :selectedPreset="currentPreset" @onPresetSelected="onSelectPresetTap"/>

        <div class="btn-group mr-2">
          <kendo-button :icon="'plus-circle'" @click="toggleModal">Add</kendo-button>
        </div>
      </div>
    </div>

    <kendo-grid
      :data-items="gridData"
      :columns="columns"
      @rowclick="onSelectionChange"
      :pageable="true"
      :skip="skip"
      :take="take"
      :total="total"
      @pagechange="onPageChange"
      :sortable="true"
      :sort="sort"
      @sortchange="onSortChange"
      style="height: 400px;"
    >
      <template v-slot:typeCell="{props}">
        <td :class="props.className">
          <img :src="getIndicatorImage(props.dataItem)" class="backlog-icon">
        </td>
      </template>

      <template v-slot:assigneeCell="{props}">
        <td :class="props.className">
          <div>
            <img :src="props.dataItem.assignee.avatar" class="li-avatar rounded mx-auto">
            <span style="margin-left: 10px;">{{props.dataItem.assignee.fullName}}</span>
          </div>
        </td>
      </template>

      <template v-slot:priorityCell="{props}">
        <td :class="props.className">
          <span :class="'badge ' + getPriorityClass(props.dataItem)">{{props.dataItem.priority}}</span>
        </td>
      </template>

      <template v-slot:estimateCell="{props}">
        <td :class="props.className">
          <span class="li-estimate">{{props.dataItem.estimate}}</span>
        </td>
      </template>

      <template v-slot:dateCreatedCell="{props}">
        <td :class="props.className">
          <span class="li-date">{{props.dataItem.dateCreated.toDateString()}}</span>
        </td>
      </template>

    </kendo-grid>


    <transition v-if="showAddModal">
      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <div class="modal-header">
              <h4 class="modal-title" id="modal-basic-title">Add New Item</h4>
              <button type="button" class="close" @click="toggleModal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <form>
                <div class="form-group row">
                  <label class="col-sm-2 col-form-label">Title</label>
                  <div class="col-sm-10">
                    <input class="form-control" v-model="newItem.title" name="title">
                  </div>
                </div>

                <div class="form-group row">
                  <label class="col-sm-2 col-form-label">Description</label>
                  <div class="col-sm-10">
                    <textarea class="form-control" v-model="newItem.description" name="description"></textarea>
                  </div>
                </div>

                <div class="form-group row">
                  <label class="col-sm-2 col-form-label">Item Type</label>
                  <div class="col-sm-10">
                    <select class="form-control" v-model="newItem.typeStr" name="itemType">
                      <option v-for="t in itemTypesProvider" :key="t" :value="t">{{t}}</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div class="modal-footer">
              <button class="btn" @click="toggleModal">Cancel</button>
              <button class="btn btn-primary" @click="onAddSave">OK</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { BacklogService } from "@/services/backlog-service";
import { BacklogRepository } from "@/repositories/backlog-repository";
import { EMPTY_STRING } from "@/core/helpers";
import { Store } from "@/core/state/app-store";

import { PresetType } from "@/core/models/domain/types";
import { PtItem, PtUser } from "@/core/models/domain";
import { ItemType } from "@/core/constants";
import { PtNewItem } from "@/shared/models/dto/pt-new-item";
import PresetFilter from "@/components/PresetFilter.vue";
import { getIndicatorClass } from "@/shared/helpers/priority-styling";

import {Grid, GridColumnProps, GridPageChangeEvent, GridSelectionChangeEvent, GridSortChangeEvent} from '@progress/kendo-vue-grid';
import { orderBy, SortDescriptor } from '@progress/kendo-data-query';
import { Button } from '@progress/kendo-vue-buttons';

export default defineComponent({
  name: "BacklogPage",
  components: {
    PresetFilter,
    'kendo-grid': Grid,
    'kendo-button': Button
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const currentPreset = ref<PresetType>("open");
    const items = ref<PtItem[]>([]);
    const itemTypesProvider = ref(ItemType.List.map(t => t.PtItemType));
    const showAddModal = ref(false);
    const listItemTap = (item: PtItem) => {
      // navigate to detail page
      router.push(`/detail/${item.id}/details`);
    };

    const columns = ref<GridColumnProps[]>([
      { field: 'type', title: ' ', width: 44, cell: 'typeCell' },
      { field: 'assignee', title: 'Assignee', width: 260, cell: 'assigneeCell' },
      { field: 'title', title: 'Title' },
      { field: 'priority', title: 'Priority', width: 100, cell: 'priorityCell' },
      { field: 'estimate', title: 'Estimate', width: 100, cell: 'estimateCell' },
      { field: 'dateCreated', title: 'Created', width: 160, cell: 'dateCreatedCell' },
    ]);

    const skip = ref(0);
    const take = ref(10);
    const sort = ref<SortDescriptor[]>([{ field: 'title', dir: 'desc' }]);

    const total = computed(() => {
      return items.value ? items.value.length : 0;
    });

    const gridData = computed(() => {
      return items.value 
        ? orderBy(
        items.value.slice(skip.value, take.value + skip.value),
        sort.value)
        : [];
    });

    const getIndicatorImage = (item: PtItem) => {
      return ItemType.imageResFromType(item.type);
    };

    const getPriorityClass = (item: PtItem): string => {
      const indicatorClass = getIndicatorClass(item.priority);
      return indicatorClass;
    };

    const onAddSave = () => {
      if (store.value.currentUser) {
        backlogService
          .addNewPtItem(newItem.value, store.value.currentUser)
          .then((nextItem: PtItem) => {
            showAddModal.value = false;
            newItem.value = initModalNewItem();
            items.value = [nextItem, ...items.value];
          });
      }
    };

    const refresh = () => {
      backlogService.getItems(currentPreset.value).then(ptItems => {
          items.value = ptItems;
      });
    };

    const onSelectPresetTap = (preset: PresetType) => {
      currentPreset.value = preset;
      router.push('/backlog/' + preset);
    };

    const toggleModal = () => {
      showAddModal.value = !showAddModal.value;
    };

    const onPageChange = (event: GridPageChangeEvent) => {
      skip.value = event.page.skip;
      take.value = event.page.take;
    }

    const onSortChange = (event: GridSortChangeEvent) => {
      sort.value = event.sort;
    };

    const onSelectionChange = (event: GridSelectionChangeEvent) => {
      const selItem = event.dataItem as PtItem;
      router.push(`/detail/${selItem.id}/details`);
    };

    const initModalNewItem = (): PtNewItem => {
      return {
        title: EMPTY_STRING,
        description: EMPTY_STRING,
        typeStr: 'PBI',
      };
    };

    const newItem = ref<PtNewItem>(initModalNewItem());
    let store: Store = new Store();
    let backlogRepo: BacklogRepository = new BacklogRepository();
    let backlogService: BacklogService = new BacklogService(backlogRepo, store);
    currentPreset.value = route.params.preset as PresetType;
    refresh();

    watch(route, () => {
      refresh();
    });

    return {
      onAddSave,
      toggleModal,
      getPriorityClass,
      getIndicatorImage,
      listItemTap,
      currentPreset,
      itemTypesProvider,
      newItem,
      onSelectPresetTap,
      refresh,
      items,
      showAddModal,
      columns,
      skip,
      take,
      total,
      onPageChange,
      gridData,
      sort,
      onSortChange,
      onSelectionChange
    };
  },
});
</script>

<style scoped>
.backlog-icon {
  height: 20px;
}

.li-indicator {
  height: 58px;
  width: 10px;
  text-align: left;
}

.li-indicator div {
  width: 5px;
  height: 58px;
}

.li-info-wrapper {
  margin-left: 5px;
}

.li-title {
  font-size: 14px;
  color: #4b5833;
}

.pt-table-row {
  cursor: pointer;
}
</style>
