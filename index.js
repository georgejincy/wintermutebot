const path = require('path')
const botkit = require('botkit')
const token = 'SLACK_API_TOKEN'
const slackAPIToken = require(path.join(__dirname, 'config.json'))[token]

var controller = botkit.slackbot({ debug: true })

controller
  .spawn({ token: slackAPIToken })
  .startRTM(function (err, bot, payload) {
    if (err) {
      throw new Error('Could not connect to Slack')
    }

    // close the RTM for the sake of it in 5 seconds
    setTimeout(function () {
      bot.closeRTM()
    }, 5000)
  })

// give the bot something to listen for.
controller.hears(
  'hello',
  ['direct_message', 'direct_mention', 'mention'],
  function (bot, message) {
    bot.reply(message, 'Hello')
  }
)
