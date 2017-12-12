const path = require('path')
const botkit = require('botkit')
const request = require('request-promise')
const token = 'SLACK_API_TOKEN'
const slackAPIToken = require(path.join(__dirname, 'config.json'))[token]

var controller = botkit.slackbot({ debug: true })

controller.spawn({ token: slackAPIToken }).startRTM()

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
    request({
      method: 'GET',
      uri: 'http://ringleader.int.bhwebapps.com/healthcheck',
      json: true
    })
      .then(function (response) {
        console.log('Blabla')
        console.log(JSON.stringify(response))
        if (response.timestamp) {
          bot.reply(
            message,
            'Ringleader is healthy . timestamp:' + response.timestamp
          )
        } else {
          bot.reply(message, 'Ringleader is down :(')
        }
      })
      .catch(function (err) {
        bot.reply(message, 'Ringleader is down :(' + err)
      })
  }
)

// Bot listens for knysna.
controller.hears(
  ['knysna', 'knysna health'],
  'direct_message,direct_mention,mention',
  function (bot, message) {
    request({
      method: 'GET',
      uri: 'http://172.20.20.20:8080/v1/healthcheck',
      json: true
    })
      .then(function (response) {
        console.log('Blabla')
        console.log(JSON.stringify(response))
        if (response.timestamp) {
          bot.reply(
            message,
            'Knysna is alive and well . timestamp:' + response.timestamp
          )
        } else {
          bot.reply(message, 'Knysna is unwell :(')
        }
      })
      .catch(function (err) {
        bot.reply(message, 'Knysna is unwell :(' + err)
      })
  }
)
