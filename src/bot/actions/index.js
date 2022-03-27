const { Telegraf } = require('telegraf')

const { main_menu, show_upcoming_rides, create_new_ride } = require('../callbacks')
const trigger_hashtag = ['rides', 'прохват', 'прохваты', 'покататься', 'покатушки', 'покатухи']

const create_bot = () => {
  const bot = new Telegraf(process.env.TG_BOT_KEY)

  return register_triggers(bot, register_actions)
}

const register_triggers = (bot, register_actions_cb) => {
  bot.hashtag(trigger_hashtag, (ctx) => {
    main_menu(ctx)
  })

  return register_actions_cb(bot)
}
const register_actions = (bot) => {
  bot.action('show_upcoming_rides', show_upcoming_rides)

  bot.action('create_new_ride', create_new_ride)

  return bot
}

module.exports = create_bot
