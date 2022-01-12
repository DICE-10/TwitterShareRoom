<template>
  <div class="container-sm mt-20">
    <div class="mx-5">
      <Message
        v-for="{ id, text, userPhotoURL, userName, userId } in messages"
        :key="id"
        :name="userName"
        :photo-url="userPhotoURL"
        :sender="userId === user?.uid"
        :user="twitterId"
      >
        <span class="text_white" v-html="text.replace(/\n/g,'<br/>')"></span>
      </Message>
    </div>
  </div>

  <div ref="bottom" class="mt-20" />

  <div class="bottom">
    <div class="container-sm">
      <form v-if="isLogin" @submit.prevent="send">
        <textarea v-model="message" placeholder="Message" required />
        <button type="submit">
          <SendIcon />
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue'
import { useAuth, useChat } from '@/firebase'

import SendIcon from './SendIcon.vue'
import Message from './Message.vue'
import firebase from 'firebase/app'
export default {
  components: { Message, SendIcon },
  setup() {
    const { user , isLogin } = useAuth()
    const { messages, sendMessage } = useChat()
    const { twitterId } = ref()
    const bottom = ref(null)
    console.dir(user)
    watch(
      messages,
      () => {
        nextTick(() => {
          bottom.value?.scrollIntoView({ behavior: 'smooth' })
        })
      },
      { deep: true },
      firebase
        .auth()
        .getRedirectResult()
        .then(userCredential => {
          console.dir(userCredential.additionalUserInfo)
          twitterId.value = userCredential.additionalUserInfo.username //Twitter ID を取得
          //ついでに最新の表示名とアイコンも取得
          // this.displayName = userCredential.additionalUserInfo.profile.name
          // this.photoURL =
          //   userCredential.additionalUserInfo.profile.profile_image_url
        })
    )

    const message = ref('')
    const send = () => {
      sendMessage(message.value)
      message.value = ''
    }

    return { user, isLogin, messages, bottom, message, send, twitterId }
  },
  methods: {
    repNewLine(val) {
      return val.replace('\n','<br />');
    }
  }
}

</script>
