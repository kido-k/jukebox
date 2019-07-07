<template>
  <v-app dark>
    <v-toolbar>
      <v-toolbar-side-icon @click="drawer = !drawer" />
      <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>web</v-icon>
      </v-btn>
      <v-spacer />
      <v-btn @click.stop="login">
        ログイン
      </v-btn>
    </v-toolbar>
    <div>
      <nuxt />
    </div>
    <v-footer app>
      <span>&copy; 2019</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      clipped: false,
      drawer: false
    }
  },
  methods: {
    login() {
      console.log('login')
      location.href = 'http://localhost:3000/api/login'
      // const data = await this.$axios.$get('http://localhost:3000/api/login')
      // console.log(data)
    }
  }
}
</script>
