<template>
  <div class="message">
    <a v-if="!sender" :href="'https://twitter.com/'+sender"><span>{{ name }}</span></a>
    <a v-else :href="'https://twitter.com/'+sender"><span  class="font_italic sender">{{ name }}</span></a>
    <div class="flex" :class="sender ? 'flex-row-reverse' : ''">
      <Avatar class="mt-1" :src="photoUrl" />
      <div class="text w-3/4" :class="sender ? 'bg-green-800' : 'bg-gray-700'">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import Avatar from './Avatar.vue'
export default {
  components: { Avatar },
  props: {
    name: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    sender: { type: Boolean, default: false }
  }
}
</script>
