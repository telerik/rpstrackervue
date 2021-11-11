<template>
  <div>
    <form>
      <div class="form-row align-items-center">
        <img :src="currentUser.avatar" class="mr-3 li-avatar rounded">

        <div class="col-sm-6">
          <textarea
            v-model="newCommentText"
            placeholder="Enter new comment..."
            class="form-control pt-text-comment-add"
            name="newComment"
          ></textarea>
        </div>
        <button
          type="button"
          @click="onAddTapped"
          class="btn btn-primary"
          :disabled="!newCommentText"
        >Add</button>
      </div>
    </form>

    <hr>

    <ul class="list-unstyled">
      <li v-for="comment in comments" :key="comment.id" class="media chitchat-item">
        <img :src="comment.user.avatar" class="mr-3 li-avatar rounded">
        <div class="media-body">
          <h6 class="mt-0 mb-1">
            <span>{{comment.user.fullName}}</span>
            <span class="li-date">{{comment.dateCreated.toDateString()}}</span>
          </h6>

          <span class="chitchat-text">{{comment.title}}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";
import { EMPTY_STRING } from '@/core/helpers/string-helpers';
import { PtComment, PtUser } from '@/core/models/domain';
import { PtNewComment } from '@/shared/models/dto/pt-new-comment';

export default defineComponent({
  name: "PtItemChitchat",
  props: {
    comments: Array as PropType<PtComment[]>,
    currentUser: Object as PropType<PtUser>,
  },
  setup() {
    const newCommentText = ref(EMPTY_STRING);
    const addNewComment = (newComment: PtNewComment) => {
      console.log("add new comment" + newComment);
    };

    const onAddTapped = () => {
      const newTitle = newCommentText.value.trim();
      if (newTitle.length === 0) {
        return;
      }
      const newComment: PtNewComment = {
        title: newTitle,
      };
      addNewComment(newComment);

      newCommentText.value = EMPTY_STRING;
    };

    return {
      newCommentText,
      onAddTapped,
    };
  }
});
</script>

<style scoped>
.chitchat-item {
  margin-top: 20px;
}

.chitchat-text {
  color: #495057;
  font-size: 0.9em;
}
</style>
