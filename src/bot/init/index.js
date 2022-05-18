const { Telegraf, Scenes, session, Markup } = require('telegraf')
const marked = require('marked')
const scenes = require('../scenes')
const { Keyboard_buttons, shabang_triggers, welcome_message } = require('../../const')
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
      const markup = `Привет, ${ctx.message.from.first_name || ctx.message.from.username} 👋\n\nRidePlanner - бот для планирования и поиска поездок.\nОн поможет тебе найти покатуху на ближайшую неделю, или организовать свою.\n\n**Для начала загляни в меню!**`

      await ctx.replyWithHTML(marked.parseInline(markup))
    }
  })

  bot.command('bot', async (ctx) => {
    await bot.telegram.sendMessage(ctx.message.from.id, 'Привет, я на связи! 😉')
      .catch((e) => {
        const { first_name, last_name, username, id } = ctx.message.from
        let mention

        if (username) {
          mention = `@${username}`
        } else {
          mention = `[${first_name || last_name}](tg://user?id=${id})`
        }

        ctx.replyWithHTML(marked.parseInline(`${mention} Чтобы воспользоваться ботом, [нажми cюда](tg://user?id=${ctx.botInfo.id}) ;)`))
      })
  })

  bot.command('help', async (ctx) => {
    await ctx.reply('RidePlanner - бот для планирования и поиска поездок.\nНаходится в активной разработке, так что возможны неприятности :)\n\n\n')
      .catch((e) => console.error('Something  bad happens:', e))
    await ctx.replyWithHTML(marked.parseInline(`Предложения и баг-трекинг: [Github](https://github.com/dractw/RidePlanner/issues)\nDev: [dractw](tg://user?id=${375130})\n`))
      .catch((e) => console.error('Something  bad happens:', e))
    await ctx.replyWithHTML(marked.parseInline('Хочешь поддержать?\n- BTC: `1ALnF1TUCxy8zsgxWHFS1hVwAvhwpxy1E8`\n- RUB: 5536913822267734'))
      .catch((e) => console.error('Something  bad happens:', e))
  })

  bot.command('stop', async (ctx) => {
    if (ctx.message && ctx.message.chat.type === 'private') {
      await ctx.reply('bot stopped', Markup.removeKeyboard())
        .catch((e) => console.error('Something  bad happens:', e))
      bot.stop()
    }
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
  shabang_triggers.forEach((trigger) => bot.hears(trigger, default_bot_reply))

  bot.action('step_back', (ctx) => ctx.wizard.back())
  bot.action('cancel_scene', (ctx) => ctx.scene.leave())

  bot.on('callback_query', (ctx) => {
    if (ctx.callbackQuery && ctx.callbackQuery.data) {
      const data = ctx.callbackQuery.data.split('#')

      if (Object.keys(available_callbacks).includes(data[0])) {
        available_callbacks[data[0]](ctx, data[1], bot)
      }
    }
  })

  bot.on('new_chat_members', (ctx) => {
    const { first_name, last_name, username } = ctx.message.from
    const { id, title } = ctx.message.chat

    if (welcome_message[id.toString()]) {
      let mention

      if (username) {
        mention = `@${username}`
      } else {
        mention = `[${first_name || last_name}](tg://user?id=${id})`
      }

      const { link } = welcome_message[id.toString()]

      ctx.replyWithHTML(marked.parseInline(`👋 Добро пожаловать в чат ${title}, ${mention}! Для хорошего старта - [ознакомьтесь с правилами сообщества](${link})`))
    }
  })

  const { NODE_ENV } = process.env

  console.info('Bot started, ver:', require('../../../package.json').version)
  console.info(`Running ${NODE_ENV.toUpperCase()} environment`)
  return bot
}

module.exports = create_bot
