const { Telegraf, Scenes, session } = require('telegraf')
const scenes = require('../scenes')
const { Keyboard_buttons } = require('../../const')

const { main_menu, show_upcoming_rides, create_new_ride, find_ride } = require('../callbacks')
const available_callbacks = require('../callbacks')
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
  bot.hears(Keyboard_buttons.SHOW_UPCOMING.title, show_upcoming_rides)
  bot.hears(Keyboard_buttons.CREATE_NEW_RIDE.title, create_new_ride)
  bot.hears(Keyboard_buttons.FIND_RIDE.title, find_ride)

  bot.action('step_back', (ctx) => ctx.wizard.back())
  bot.action('cancel_scene', (ctx) => ctx.scene.leave())

  bot.on('callback_query', (ctx) => {
    const data = ctx.callbackQuery.data.split('#')

    if (Object.keys(available_callbacks).includes(data[0])) {
      available_callbacks[data[0]](ctx, data[1])
    }
  })

  console.log('Bot started, ver:', require('../../../package.json').version)
  return bot
}

module.exports = create_bot
