<template>
  <div>
    <section class="container" />
    <v-btn @click="check"></v-btn>
  </div>
</template>

<script>
const api = 'http://localhost:3000/api/'

export default {
  components: {},
  data() {
    return {
      music: ''
    }
  },
  beforeCreate() {
    this.$axios.$get(api, {
      params: {
        CLIENT_ID: process.env.CLIENT_ID,
        CLIENT_SECRET: process.env.CLIENT_SECRET
      }
    })
  },
  methods: {
    check() {
      console.log(process.env.CLIENT_ID)
    },
    sendData() {
      console.log(this.music)
    }
  }
}
</script>
