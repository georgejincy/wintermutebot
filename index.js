const path = require('path')
const botkit = require('botkit')
const token = 'SLACK_API_TOKEN'
const slackAPIToken = require(path.join(__dirname, 'config.json'))[token]

var controller = botkit.slackbot({ debug: true })

controller.spawn({ token: slackAPIToken }).startRTM()

// give the bot something to listen for.
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
