<template>
  <div>
    <form>
      <div class="form-group row">
        <label class="col-sm-2 col-form-label">Title</label>
        <div class="col-sm-10">
          <input class="form-control" v-model="itemForm.title" @blur="onBlurTextField" name="title">
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2 col-form-label">Description</label>
        <div class="col-sm-10">
          <textarea
            class="form-control"
            v-model="itemForm.description"
            @blur="onBlurTextField"
            name="description"
          ></textarea>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2 col-form-label">Item Type</label>
        <div class="col-sm-10">
          <select
            class="form-control"
            v-model="itemForm.typeStr"
            @change="onNonTextFieldChange"
            name="itemType"
          >
            <option v-for="t in itemTypesProvider" :value="t" :key="t">{{ t }}</option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2 col-form-label">Status</label>
        <div class="col-sm-10">
          <select
            class="form-control"
            v-model="itemForm.statusStr"
            @change="onNonTextFieldChange"
            name="itemStatus"
          >
            <option v-for="s in statusesProvider" :value="s" :key="s">{{ s }}</option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2 col-form-label">Estimate</label>
        <div class="col-sm-10">
          <input
            class="form-control"
            type="range"
            step="1"
            min="0"
            max="20"
            v-model="itemForm.estimate"
            @blur="onBlurTextField"
            style="width: 300px"
            name="estimate"
          >
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2 col-form-label">Priority</label>
        <div class="col-sm-10">
          <select
            class="form-control"
            v-model="itemForm.priorityStr"
            @change="onNonTextFieldChange"
            name="itemPrority"
          >
            <option v-for="p in prioritiesProvider" :value="p" :key="p">{{ p }}</option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2 col-form-label">Assignee</label>

        <div class="col-sm-10">
          <img :src="selectedAssignee.avatar" class="li-avatar rounded">
          <span>{{itemForm.assigneeName}}</span>
          
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            @click="assigneePickerOpen"
          >Pick assignee</button>
        </div>
      </div>
    </form>

    <transition v-if="showAddModal">
      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <div class="modal-header">
              <h4 class="modal-title" id="modal-basic-title">Select Assignee</h4>
              <button type="button" class="close" @click="toggleModal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <ul class="list-group list-group-flush">
                <li
                  v-for="user in users"
                  class="list-group-item d-flex justify-content-between align-items-center"
                  @click="assigneePickerClose(user)"
                  :key="user.id"
                >
                  <span>{{ user.fullName }}</span>
                  <span class="badge">
                    <img :src="user.avatar" class="li-avatar rounded mx-auto d-block">
                  </span>
                </li>
              </ul>
            </div>

            <div class="modal-footer"></div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, toRefs } from "vue";
import { Observable } from "rxjs";

import { PtItem, PtUser } from "@/core/models/domain";
import {
  ItemType,
  PT_ITEM_STATUSES,
  PT_ITEM_PRIORITIES,
} from "@/core/constants";
import {
  PtItemDetailsEditFormModel,
  ptItemToFormModel,
} from "@/shared/models/forms/pt-item-details-edit-form";

export default defineComponent({
  name: "PtItemChitchat",
  props: {
    item: {
      type: Object as PropType<PtItem>,
      default: () => ({
        description: "",
      }),
    },
    usersObs: {
      type: Object as PropType<Observable<PtUser[]>>,
      required: true
    }
  },
  setup(props, context) {
    const itemTypesProvider = ref(ItemType.List.map((t) => t.PtItemType));
    const statusesProvider = ref(PT_ITEM_STATUSES);
    const prioritiesProvider = ref(PT_ITEM_PRIORITIES);

    const showAddModal = ref(false);
    const users = ref<PtUser[]>([]);
    const itemForm = ref<PtItemDetailsEditFormModel | undefined>();
    const selectedAssignee = ref<PtUser | undefined>();
    let { item } = toRefs(props);

    if (props.item) {
      itemForm.value = ptItemToFormModel(props.item);
      selectedAssignee.value = item.value.assignee as PtUser;
    }

    const assigneePickerOpen = () => {
      props.usersObs.subscribe((newUsers: PtUser[]) => {
        if (newUsers.length > 0) {
          users.value = newUsers;
          showAddModal.value = true;
        }
      });

      context.emit("usersRequested");
    };

    const onNonTextFieldChange = () => {
      notifyUpdateItem();
    };

    const onBlurTextField = () => {
      notifyUpdateItem();
    };

    const toggleModal = () => {
      showAddModal.value = !showAddModal.value;
      return false;
    };

    const assigneePickerClose = (user: PtUser) => {
      selectedAssignee.value = user;
      itemForm.value!.assigneeName = user.fullName;
      notifyUpdateItem();
      showAddModal.value = false;
    };

    const notifyUpdateItem = () => {
      if (!itemForm.value) {
        return;
      }
      const updatedItem = getUpdatedItem(
        props.item!,
        itemForm.value,
        selectedAssignee.value!
      );
      context.emit('itemSaved', updatedItem);
    };

    const getUpdatedItem = (
      item: PtItem,
      itemForm: PtItemDetailsEditFormModel,
      assignee: PtUser
    ): PtItem => {
      const updatedItem = Object.assign({}, item, {
        title: itemForm.title,
        description: itemForm.description,
        type: itemForm.typeStr,
        status: itemForm.statusStr,
        priority: itemForm.priorityStr,
        estimate: itemForm.estimate,
        assignee,
      });

      return updatedItem;
    };

    return {
      assigneePickerClose,
      toggleModal,
      onBlurTextField,
      assigneePickerOpen,
      onNonTextFieldChange,
      itemTypesProvider,
      statusesProvider,
      prioritiesProvider,
      showAddModal,
      users,
      selectedAssignee,
      itemForm,
    };
  },
});
</script>
