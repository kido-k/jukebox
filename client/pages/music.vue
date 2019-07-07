<template>
  <section class="container">
    <v-text-field v-model="token" label="※カスタムトークン" />
    <v-text-field
      v-model="keyword"
      label="探したい曲名かアーティストを入力してください"
    />
    <v-select
      v-model="types"
      :items="types_key"
      attach
      chips
      label="検索するタイプを全て選んでください"
      multiple
    />
    <!-- <v-text-field v-model="type" label="artist or track" /> -->
    <v-select
      v-model="market"
      :items="country"
      label="国名コードを選択して下さい"
    />
    <v-btn light @click="sendData">
      送信
    </v-btn>
    <v-btn light @click="getUserData">
      データ取得
    </v-btn>
    <v-btn light @click="getDeviceData">
      デバイスデータ取得
    </v-btn>
    <v-data-table :headers="album_headers" :items="albums" class="data-table">
      <template v-slot:items="props">
        <td>{{ props.item.id }}</td>
        <td class="text-xs-left">
          {{ props.item.album_type }}
        </td>
        <td class="text-xs-left">
          {{ props.item.name }}
        </td>
        <td class="text-xs-left">
          <!-- <v-carousel hide-delimiters>
            <v-carousel-item
              v-for="(image, i) in props.item.images"
              :key="i"
              :src="image.url"
            />
          </v-carousel> -->
          <img :src="props.item.images[0].url" class="jacket" />
          <!-- {{ props.item.images[0].url }} -->
        </td>
        <td
          class="
                           text-xs-left"
        >
          {{ props.item.genres }}
        </td>
        <td>
          <v-btn @click="playMusic(props.item.uri)">
            <v-icon>play_circle_filled</v-icon>
          </v-btn>
        </td>
      </template>
    </v-data-table>
    <v-data-table :headers="headers" :items="artists" class="data-table">
      <template v-slot:items="props">
        <td>{{ props.item.id }}</td>
        <td class="text-xs-right">
          {{ props.item.type }}
        </td>
        <td class="text-xs-right">
          {{ props.item.genres }}
        </td>
        <td class="text-xs-right">
          {{ props.item.name }}
        </td>
        <td class="text-xs-right">
          {{ props.item.image }}
        </td>
      </template>
    </v-data-table>
    <v-data-table :headers="headers" :items="tracks" class="data-table">
      <template v-slot:items="props">
        <td>{{ props.item.id }}</td>
        <td class="text-xs-right">
          {{ props.item.type }}
        </td>
        <td class="text-xs-right">
          {{ props.item.genres }}
        </td>
        <td class="text-xs-right">
          {{ props.item.name }}
        </td>
        <td class="text-xs-right">
          {{ props.item.image }}
        </td>
      </template>
    </v-data-table>
  </section>
</template>

<script>
const api = 'http://localhost:3000/api/'

export default {
  components: {},
  data() {
    return {
      keyword: 'ワニマ',
      types: ['album'],
      market: 'JP',
      headers: [
        { text: 'id', value: 'id' },
        { text: 'type', value: 'type' },
        { text: 'genres', value: 'genres' },
        { text: 'name', value: 'name' },
        { text: 'image', value: 'image' }
      ],
      album_headers: [
        { text: 'id', value: 'id' },
        { text: 'type', value: 'type' },
        { text: 'name', value: 'name' },
        { text: 'image', value: 'image' },
        { text: 'other', value: 'other' }
      ],
      types_key: ['artist', 'album', 'track', 'playlist'],
      country: ['JP', 'US'],
      artists: [],
      albums: [],
      tracks: [],
      token: ''
    }
  },
  // async beforeCreate() {
  //   const userData = await this.$axios.$get(api + 'userData')
  //   if (userData === '') {
  //     location.href = 'http://localhost:3000'
  //   }
  // },
  beforeCreate() {
    this.$axios.$get(api, {
      params: {
        CLIENT_ID: process.env.CLIENT_ID,
        CLIENT_SECRET: process.env.CLIENT_SECRET
      }
    })
  },
  methods: {
    async sendData() {
      const keyword = encodeURI(this.keyword)
      const type = this.types.join('%2C')
      await this.$axios
        .$get(api + 'search', {
          params: {
            keyword: keyword,
            type: type,
            market: this.market,
            token: this.token
          }
        })
        .then((res) => {
          console.log('res')
          console.log(res)
          if (res.artists) {
            this.artists = res.artists.items
          }
          if (res.albums) {
            this.albums = res.albums.items
          }
          if (res.tracks) {
            this.tracks = res.tracks.items
          }
        })
    },
    async getUserData() {
      const baseData = await this.$axios.$get(api + 'userData')
      console.log('baseData')
      console.log(baseData)
    },
    async getDeviceData() {
      const deviceData = await this.$axios.$get(api + 'device')
      console.log('deviceData')
      console.log(deviceData)
    },
    async playMusic(uri) {
      await this.$axios
        .$get(api + 'play', {
          params: {
            uri: uri,
            token: this.token
          }
        })
        .then((res) => {
          console.log('res')
          console.log(res)
        })
    }
  }
}
</script>

<style>
.data-table {
  margin: 50px 0 0 0;
}
.jacket {
  width: 200px;
  height: auto;
}
</style>
