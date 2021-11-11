<template>
  <div v-if="item">
    <div
      class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3"
    >
      <h1 class="h2">{{ item.title }}</h1>
      <div class="btn-toolbar mb-2 mb-md-0">
        <div class="btn-group mr-2">
          <button
            type="button"
            @click="onScreenSelected('details')"
            class="btn btn-sm btn-outline-secondary"
          >Details</button>
          
          <button
            type="button"
            @click="onScreenSelected('tasks')"
            class="btn btn-sm btn-outline-secondary"
          >Tasks</button>
          
          <button
            type="button"
            @click="onScreenSelected('chitchat')"
            class="btn btn-sm btn-outline-secondary"
          >Chitchat</button>
        </div>
      </div>
    </div>

    <PtItemDetails
      v-if="selectedDetailsScreen === 'details'"
      :item="item"
      :usersObs="users$"
      @usersRequested="onUsersRequested"
      @itemSaved="onItemSaved"
    />

    <PtItemTasks
      v-else-if="selectedDetailsScreen === 'tasks'"
      :tasks="item.tasks"
      @addNewTask="onAddNewTask"
      @updateTask="onUpdateTask"
    />

    <PtItemChitchat
      v-else-if="selectedDetailsScreen === 'chitchat'"
      :comments="item.comments"
      :currentUser="currentUser"
      @addNewComment="onAddNewComment"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { Observable } from 'rxjs';

import { BacklogService } from '@/services/backlog-service';
import { BacklogRepository } from '@/repositories/backlog-repository';
import { PtUserService } from '@/core/services/pt-user-service';
import { EMPTY_STRING } from '@/core/helpers';
import { Store } from '@/core/state/app-store';

import { PresetType } from '@/core/models/domain/types';
import { PtItem, PtTask, PtUser } from '@/core/models/domain';
import { ItemType } from '@/core/constants';
import { PtNewItem } from '@/shared/models/dto/pt-new-item';
import PtItemDetails from '@/components/detail/ItemDetails.vue';
import PtItemTasks from '@/components/detail/ItemTasks.vue';
import PtItemChitchat from '@/components/detail/ItemChitchat.vue';
import { getIndicatorClass } from '@/shared/helpers/priority-styling';

import { DetailScreenType } from '@/shared/models/ui/types/detail-screens';
import { PtNewTask } from '@/shared/models/dto/pt-new-task';
import { PtTaskUpdate } from '@/shared/models/dto/pt-task-update';
import { PtNewComment } from '@/shared/models/dto/pt-new-comment';

export default defineComponent({
  name: "DetailPage",
  components: {
    PtItemDetails,
    PtItemTasks,
    PtItemChitchat,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const selectedDetailsScreen = ref<DetailScreenType>('details' );
    let store: Store = new Store();
    let backlogRepo: BacklogRepository = new BacklogRepository();
    let backlogService: BacklogService = new BacklogService(backlogRepo, store);
    let ptUserService: PtUserService = new PtUserService(store);
    let itemId = 0;
    const item = ref<PtItem | null>();
    let currentUser = ref<PtUser | undefined>(store.value.currentUser);
    let users$ = ref<Observable<PtUser[]>>(store.select<PtUser[]>('users'));

    selectedDetailsScreen.value = route.params.screen as DetailScreenType;
    itemId = Number(route.params.id);
    const refresh = () => {
      backlogService.getPtItem(itemId).then((newItem) => {
        item.value = newItem;
      });
    };
    refresh();

    const onScreenSelected = (screen: DetailScreenType) => {
      selectedDetailsScreen.value = screen;
      router.push(`/detail/${itemId}/${screen}`);
    };

    const onItemSaved = (currentItem: PtItem) => {
      backlogService.updatePtItem(currentItem).then((updateItem: PtItem) => {
        item.value = updateItem;
      });
    };

    const onAddNewTask = (newTask: PtNewTask) => {
      if (item.value) {
        backlogService.addNewPtTask(newTask, item.value).then((nextTask) => {
          item.value!.tasks = [nextTask].concat(item.value!.tasks);
        });
      }
    };

    const onUpdateTask = (taskUpdate: PtTaskUpdate) => {
      if (item.value) {
        if (taskUpdate.delete) {
          backlogService
            .deletePtTask(item.value, taskUpdate.task)
            .then(ok => {
              if (ok) {
                const newTasks = item.value!.tasks.filter((task) => {
                  if (task.id !== taskUpdate.task.id) {
                    return task;
                  }
                });
                item.value!.tasks = newTasks;
              }
            });
        } else {
          backlogService
            .updatePtTask(
              item.value,
              taskUpdate.task,
              taskUpdate.toggle,
              taskUpdate.newTitle
            )
            .then((updatedTask) => {
              const newTasks = item.value!.tasks.map((task) => {
                if (task.id === updatedTask.id) {
                  return updatedTask;
                } else {
                  return task;
                }
              });
              item.value!.tasks = newTasks;
            });
        }
      }
    };

    const onAddNewComment = (newComment: PtNewComment) => {
      if (item.value) {
        backlogService
          .addNewPtComment(newComment, item.value)
          .then(nextComment => {
            item.value!.comments = [nextComment].concat(item.value!.comments);
          });
      }
    };

    const onUsersRequested = () => {
      ptUserService.fetchUsers();
    };

    const getIndicatorImage = (currentItem: PtItem) => {
      return ItemType.imageResFromType(currentItem.type);
    };

    const getPriorityClass = (currentItem: PtItem): string => {
      const indicatorClass = getIndicatorClass(currentItem.priority);
      return indicatorClass;
    };

    const initModalNewItem = (): PtNewItem => {
      return {
        title: EMPTY_STRING,
        description: EMPTY_STRING,
        typeStr: 'PBI',
      };
    }

    return {
      getPriorityClass,
      getIndicatorImage,
      onUsersRequested,
      onAddNewComment,
      onUpdateTask,
      onAddNewTask,
      onScreenSelected,
      onItemSaved,
      item,
      currentUser,
      users$,
      selectedDetailsScreen,
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
