<template>
  <form>
    <div class="form-row align-items-center">
      <div class="col-sm-6">
        <input
          v-model="newTaskTitle"
          placeholder="Enter new task..."
          class="form-control pt-text-task-add"
          name="newTask"
        />
      </div>
      <button
        type="button"
        @click="() => onAddTapped()"
        class="btn btn-primary"
        :disabled="!newTaskTitle"
      >
        Add
      </button>
    </div>
    <hr />
    <div v-for="task in tasks" :key="task.id" class="input-group mb-3 col-sm-6">
      <div class="input-group-prepend">
        <div class="input-group-text">
          <input
            type="checkbox"
            :checked="task.completed"
            @change="() => onToggleTapped(task)"
            aria-label="Checkbox for following text input"
            :name="'checked' + task.id"
          >
        </div>
      </div>
      <input
        :value="task.title"
        @input="(e) => onTaskTitleChange(task, e)"
        @blur="() => onTaskBlurred(task)"
        type="text"
        class="form-control"
        aria-label="Text input with checkbox"
        :name="'tasktitle' + task.id"
      >

      <div class="input-group-append">
        <button class="btn btn-danger" type="button" @click="() => onTaskDelete(task)">Delete</button>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";
import { EMPTY_STRING } from "@/core/helpers/string-helpers";
import { PtTask } from "@/core/models/domain";
import { PtNewTask } from "@/shared/models/dto/pt-new-task";
import { PtTaskUpdate } from "@/shared/models/dto/pt-task-update";

export default defineComponent({
  name: "PtItemTasks",
  props: {
    tasks: Array as PropType<PtTask[]>
  },
  setup(props, context) {
    const newTaskTitle = ref(EMPTY_STRING);
    let lastUpdatedTitle = EMPTY_STRING;

    const onAddTapped = () => {
      const newTitle = newTaskTitle.value.trim();
      if (newTitle.length === 0) {
        return;
      }
      const newTask: PtNewTask = {
        title: newTitle,
        completed: false,
      };
      context.emit("addNewTask", newTask);

      newTaskTitle.value = EMPTY_STRING;
    };

    const onToggleTapped = (task: PtTask) => {
      const taskUpdate: PtTaskUpdate = {
        task,
        toggle: true,
      };
      context.emit("updateTask", taskUpdate);
    };

    const onTaskTitleChange = (task: PtTask, event: any) => {
      if (task.title === event.target.value) {
        return;
      }
      lastUpdatedTitle = event.target.value;
    };

    const onTaskBlurred = (task: PtTask) => {
      if (task.title === lastUpdatedTitle) {
        return;
      }
      const taskUpdate: PtTaskUpdate = {
        task,
        toggle: false,
        newTitle: lastUpdatedTitle,
      };
      context.emit("updateTask", taskUpdate);
      lastUpdatedTitle = EMPTY_STRING;
    };

    const onTaskDelete = (task: PtTask) => {
      const taskUpdate: PtTaskUpdate = {
        task,
        toggle: false,
        delete: true,
      };
      context.emit("updateTask", taskUpdate);
    };

    return {
      onTaskDelete,
      onTaskBlurred,
      onTaskTitleChange,
      onToggleTapped,
      onAddTapped,
      newTaskTitle,
    };
  },
});
</script>
