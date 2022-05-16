const { Telegraf, Scenes, session, Markup } = require('telegraf')
const marked = require('marked')
const scenes = require('../scenes')
const { Keyboard_buttons, shabang_triggers, command_triggers } = require('../../const')
const { default_bot_reply } = require('../../utils')

const { main_menu, show_upcoming_rides, create_new_ride, find_ride } = require('../callbacks')
const available_callbacks = require('../callbacks')

const create_bot = () => {
  const bot = new Telegraf(process.env.TG_BOT_KEY)

  return register_triggers(bot, register_scenes)
}

const register_triggers = (bot, register_scenes_cb) => {
  bot.start(async (ctx) => {
    if (ctx.message && ctx.message.chat.type === 'private') {
      main_menu(ctx)
    } else {
      default_bot_reply(ctx)
    }
  })

  bot.command('help', async (ctx) => {
    ctx.reply('RidePlanner - бот для планирования и поиска поездок.\nНапиши ему в личку /start, и он тебе поможет найти покатуху, или запланировать свою\n')
    ctx.reply('Находится в активной разработке, так что возможны неприятности :)\n\n\n')
    await ctx.replyWithHTML(marked.parseInline(`Предложения и баг-трекинг: [Github](https://github.com/dractw/RidePlanner/issues)\nDev: [dractw](tg://user?id=${375130})\n`))
    await ctx.replyWithHTML(marked.parseInline('Хочешь поддержать?\n- BTC: `1ALnF1TUCxy8zsgxWHFS1hVwAvhwpxy1E8`\n- RUB: 5536913822267734'))
  })

  bot.command('stop', async (ctx) => {
    await ctx.reply('bot stopped', Markup.removeKeyboard())
    bot.stop()
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
  command_triggers.forEach((trigger) => bot.command(`${trigger}`, default_bot_reply))
  shabang_triggers.forEach((trigger) => bot.hears(trigger, default_bot_reply))

  bot.action('step_back', (ctx) => ctx.wizard.back())
  bot.action('cancel_scene', (ctx) => ctx.scene.leave())

  bot.on('callback_query', (ctx) => {
    if (ctx.callbackQuery && ctx.callbackQuery.data) {
      const data = ctx.callbackQuery.data.split('#')

      if (Object.keys(available_callbacks).includes(data[0])) {
        available_callbacks[data[0]](ctx, data[1])
      }
    }
  })

  console.log('Bot started, ver:', require('../../../package.json').version)
  return bot
}

module.exports = create_bot
