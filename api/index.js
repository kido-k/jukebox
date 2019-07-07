// const express = require('express')
// const app = express()

const querystring = require('querystring')
const express = require('express') // Express web server framework
const request = require('request') // "Request" library
const cors = require('cors')
const cookieParser = require('cookie-parser')

let client_id = '' // Your client id
let client_secret = '' // Your secret

const redirect_uri = 'http://localhost:3000/api/callback' // Your redirect uri

let access_token = ''
let refresh_token = ''
let base_data = ''
let deviceId = ''

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function(length) {
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

const stateKey = 'spotify_auth_state'

const app = express()

app.use(cors()).use(cookieParser())

app.get('/', function(req, res) {
  client_id = req.query.CLIENT_ID // Your client id
  client_secret = req.query.CLIENT_SECRET // Your secret
})

app.get('/login', function(req, res) {
  const state = generateRandomString(16)
  res.cookie(stateKey, state)

  // your application requests authorization
  const scope = 'user-read-private user-read-email'
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      })
  )
})

app.get('/callback', function(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  const code = req.query.code || null
  const state = req.query.state || null
  const storedState = req.cookies ? req.cookies[stateKey] : null

  if (state === null || state !== storedState) {
    res.redirect(
      '/#' +
        querystring.stringify({
          error: 'state_mismatch'
        })
    )
  } else {
    res.clearCookie(stateKey)
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
        scope:
          'user-read-playback-state,playlist-read-private,user-modify-playback-state'
      },
      headers: {
        Authorization:
          'Basic ' +
          // eslint-disable-next-line node/no-deprecated-api
          new Buffer(client_id + ':' + client_secret).toString('base64')
      },
      json: true
    }

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        access_token = body.access_token
        refresh_token = body.refresh_token
        // console.log(body)
        const options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { Authorization: 'Bearer ' + access_token },
          json: true
        }

        // use the access token to access the Spotify Web API
        request.get(options, function(_error, _response, data) {
          base_data = data
        })
        // deviceId = setDeviceId()
        res.redirect('/music')

        // we can also pass the token to the browser to make requests from there
      } else {
        res.redirect(
          '/' +
            querystring.stringify({
              error: 'invalid_token'
            })
        )
      }
    })
  }
})

app.get('/refresh_token', function(req, res) {
  // requesting access token from refresh token
  refresh_token = req.query.refresh_token

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' +
        // eslint-disable-next-line node/no-deprecated-api
        new Buffer(client_id + ':' + client_secret).toString('base64')
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  }

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token
    }
  })
})

app.get('/userData', function(req, res) {
  res.send(base_data)
})

app.get('/device', function(req, res) {
  const requestURL = 'https://api.spotify.com/v1/me/player/devices'
  const options = {
    url: requestURL,
    headers: {
      // Authorization: 'Bearer ' + access_token,
      Authorization: 'Bearer ' + access_token,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    json: true
  }
  request.get(options, function(_error, _response, data) {
    console.log('device')
    if (data) {
      console.log(data)
      console.log(data.devices[0].id)
    }
    deviceId = data.devices[0].id
    res.send(data)
  })
})

app.get('/search', function(req, res) {
  const market = req.query.market ? req.query.market : 'JP'
  const limit = 20
  const offset = 5

  if (req.query.token !== '') {
    access_token = req.query.token
  }
  console.log(access_token)
  // console.log(req.query)
  let requestURL = 'https://api.spotify.com/v1/search?'
  requestURL =
    requestURL +
    'q=' +
    req.query.keyword +
    '&type=' +
    req.query.type +
    '&market=' +
    market +
    '&limit=' +
    limit +
    '&offset=' +
    offset
  // console.log(requestURL)
  const options = {
    url: requestURL,
    headers: {
      Authorization: 'Bearer ' + access_token,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    json: true
  }
  // use the access token to access the Spotify Web API
  request.get(options, function(_error, _response, data) {
    // console.log(data)
    // console.log(data.albums.items)
    res.send(data)
  })
})

app.get('/play', function(req, res) {
  const uri = req.query.uri

  // console.log(access_token)
  // console.log(req.query)

  if (req.query.token !== '') {
    access_token = req.query.token
  }

  const requestURL =
    'https://api.spotify.com/v1/me/player/play?device_id=' + deviceId
  console.log('requestURL')
  console.log(requestURL)
  console.log(uri)
  const param = {
    context_uri: uri,
    offset: {
      position: 0
    },
    position_ms: 0
  }
  const options = {
    url: requestURL,
    headers: {
      Authorization: 'Bearer ' + access_token,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Content-Length': param.length
    },
    json: param
  }

  // use the access token to access the Spotify Web API
  request.put(options, function(_error, response, body) {
    console.log(body)
    // res.send(data)
  })
})

// function setDeviceId() {
//   const requestURL = 'https://api.spotify.com/v1/me/player/devices'
//   const options = {
//     url: requestURL,
//     headers: {
//       // Authorization: 'Bearer ' + access_token,
//       Authorization: 'Bearer ' + access_token,
//       Accept: 'application/json',
//       'Content-Type': 'application/json'
//     },
//     json: true
//   }
//   request.get(options, function(_error, _response, data) {
//     console.log('device')
//     console.log(data.devices[0].id)
//     deviceId = data.devices[0].id
//   })
// }

module.exports = {
  path: '/api/',
  handler: app
}
