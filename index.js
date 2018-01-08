const path = require('path')
const botkit = require('botkit')
const request = require('request-promise')
const token = 'SLACK_API_TOKEN'
const slackAPIToken = require(path.join(__dirname, 'config.json'))[token]

var controller = botkit.slackbot({ debug: true })
var fullChannelList = []

var wintermute = controller.spawn({ token: slackAPIToken })
wintermute.startRTM(function (err, bot) {
  if (err) {
    throw new Error(err)
  }

  // @ https://api.slack.com/methods/groups.list to accesss private channels as well
  bot.api.groups.list({}, function (err, response) {
    console.log(err)
    if (response.hasOwnProperty('groups') && response.ok) {
      var total = response.groups.length
      for (var i = 0; i < total; i++) {
        var channel = response.groups[i]
        fullChannelList.push({ name: channel.name, id: channel.id })
      }
    }
  })
})

function checkHealth () {
  request({
    method: 'GET',
    uri: 'http://172.20.20.20:8080/v1/healthcheck',
    json: true
  })
    .then(function (response) {
      if (!response.timestamp) {
        wintermute.say({
          text: ':rotating_light::elephant: _knysna_ *DOWN*.',
          channel: getChannelID('doitlive')
        })
      }
    })
    .catch(function (err) {
      console.log(err)
      wintermute.say({
        text: ':rotating_light::elephant: _knysna_ *DOWN*',
        channel: getChannelID('doitlive')
      })
    })

  request({
    method: 'GET',
    // uri: 'http://172.20.20.10:80/healthcheck', //test checking dev
    uri: 'http://172.20.20.20:80/healthcheck',
    json: true
  })
    .then(function (response) {
      if (!response.timestamp) {
        wintermute.say({
          text: ':rotating_light::circus_tent: _ringleader_ *DOWN*',
          channel: getChannelID('doitlive')
        })
      }
    })
    .catch(function (err) {
      console.log(err)
      wintermute.say({
        text: ':rotating_light::circus_tent: _ringleader_ *DOWN*',
        channel: getChannelID('doitlive')
      })
    })
}

function checkKnysnaHealth (bot, message) {
  request({
    method: 'GET',
    uri: 'http://172.20.20.20:8080/v1/healthcheck',
    json: true
  })
    .then(function (response) {
      console.log('Blabla')
      console.log(JSON.stringify(response))

      if (response.timestamp) {
        bot.reply(message, ':white_check_mark::elephant: _knysna_ *UP*')
      } else {
        bot.reply(message, ':rotating_light::elephant: _knysna_ *DOWN*.')
      }
    })
    .catch(function (err) {
      console.log(err)
      bot.reply(message, ':rotating_light::elephant: _knysna_ :confused: ')
    })
}

function checkRingleaderHealth (bot, message) {
  request({
    method: 'GET',
    uri: 'http://172.20.20.20:80/healthcheck',
    json: true
  })
    .then(function (response) {
      console.log('Blabla')
      console.log(JSON.stringify(response))
      if (response.timestamp) {
        bot.reply(message, ':white_check_mark::circus_tent: _ringleader_ *UP*')
      } else {
        bot.reply(message, ':rotating_light::circus_tent: _ringleader_ *DOWN*')
      }
    })
    .catch(function (err) {
      console.log(err)
      bot.reply(
        message,
        ':rotating_light::circus_tent: _ringleader_ :confused:'
      )
    })
}

// Get channel ID for sending alerts
function getChannelID (name) {
  let doitlivechannel = null
  for (var i = 0, j = fullChannelList.length; i < j; i++) {
    if (fullChannelList[i].name === name) {
      doitlivechannel = fullChannelList[i]
    }
  }

  if (doitlivechannel === null) {
    return doitlivechannel
  } else {
    return doitlivechannel.id
  }
}

// Bot listens for hello / hi.
controller.hears(
  ['hello', 'hi'],
  'direct_message,direct_mention,mention',
  function (bot, message) {
    let currentUser
    bot.api.users.info({ user: message.user }, function (err, response) {
      if (err) {
        bot.reply('Hello')
      } else {
        currentUser = response['user']
        bot.reply(message, 'Hello @' + currentUser['name'])
      }
    })
  }
)

// Bot listens for ringleader.
controller.hears(
  ['ringleader', 'ringleader health'],
  'direct_message,direct_mention,mention',
  function (bot, message) {
    checkRingleaderHealth(bot, message)
  }
)

// Bot listens for knysna.
controller.hears(
  ['knysna', 'knysna health'],
  'direct_message,direct_mention,mention',
  function (bot, message) {
    checkKnysnaHealth(bot, message)
  }
)

controller.hears(['test'], 'direct_message,direct_mention,mention', function (
  bot,
  message
) {
  let id = getChannelID('doitlive')
  bot.reply(message, 'Channel id for ' + id)
})

// Check health of ringleader and knysna every 10 minutes
// Send an alert in the doitlive channel if any applications are down
setInterval(checkHealth, 600000)

// let timerID = setInterval(checkHealth, 30000) // test checking dev 30 seconds
