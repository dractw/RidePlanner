const { Telegraf, Scenes, session } = require('telegraf')
const scenes = require('../scenes')

const { main_menu, show_upcoming_rides, create_new_ride } = require('../callbacks')
// const trigger_hashtag = ['rides', 'прохват', 'прохваты', 'покататься', 'покатушки', 'покатухи']

const create_bot = () => {
  const bot = new Telegraf(process.env.TG_BOT_KEY)

  return register_triggers(bot, register_scenes)
}

const register_triggers = (bot, register_scenes_cb) => {
  bot.start((ctx) => {
    main_menu(ctx)
  })

  return register_scenes_cb(bot)
}

const register_scenes = (bot) => {
  const stage = new Scenes.Stage(scenes.map((scene) => scene(bot)))

  bot.use(session())
  bot.use(stage.middleware())

  return register_actions(bot)
}

const register_actions = (bot) => {
  bot.hears('🏍 Ближайшие прохваты', show_upcoming_rides)
  bot.hears('🗺 Запланировать новый', create_new_ride)

  bot.action('step_back', (ctx) => ctx.wizard.back())
  bot.action('cancel_scene', (ctx) => ctx.scene.leave())

  return bot
}

module.exports = create_bot
