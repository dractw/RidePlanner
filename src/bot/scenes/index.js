const { Scenes, Markup } = require('telegraf')
const moment = require('moment')

const { createUser, createRide } = require('../../handlers')
const { Keyboard_buttons, LEVELS } = require('../../const')

const createRideScene = (bot) => new Scenes.WizardScene('CREATE_RIDE_WIZARD',
  // SET NAME
  async (ctx) => {
    if (ctx.update.callback_query && ctx.update.callback_query.data === 'cancel_scene') {
      ctx.reply('Отменено')
      return ctx.scene.leave()
    }

    if (ctx.message && ctx.message.text) {
      const reserved_text_messages = Object.values(Keyboard_buttons).map(({ title }) => title)

      if (!reserved_text_messages.includes(ctx.message.text)) {
        ctx.session.new_ride = { title: ctx.message.text }
        ctx.message.text = undefined
        ctx.wizard.next()
        return ctx.wizard.steps[ctx.wizard.cursor](ctx)
      }
    }

    await ctx.reply('Укажите название поездки',
      Markup.inlineKeyboard([
        Markup.button.callback(Keyboard_buttons.CANCEL.title, Keyboard_buttons.CANCEL.cb),
      ]))
  },

  // SET DATE
  async (ctx) => {
    if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.BACK.cb) {
      ctx.update.callback_query.data = undefined
      ctx.wizard.back()

      return ctx.wizard.steps[ctx.wizard.cursor](ctx)
    }

    if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.CANCEL.cb) {
      ctx.reply('Отменено')
      return ctx.scene.leave()
    }

    if (ctx.message && ctx.message.text) {
      const date = moment.utc(ctx.message.text, 'DD.MM.YYYY hh:mm')

      if (!date.isValid()) {
        ctx.reply('Неправильно указана дата/время, попробуйте еще раз')
        const step = ctx.wizard.step

        return step(ctx)
      }
      ctx.session.new_ride.date = date

      ctx.message.text = undefined
      ctx.wizard.next()
      return ctx.wizard.steps[ctx.wizard.cursor](ctx)
    }

    await ctx.reply('Укажите дату и время (ДД.ММ.ГГ ЧЧ:ММ)',
      Markup.inlineKeyboard([
        Markup.button.callback(Keyboard_buttons.BACK.title, Keyboard_buttons.BACK.cb),
        Markup.button.callback(Keyboard_buttons.CANCEL.title, Keyboard_buttons.CANCEL.cb),
      ]))
  },

  // SET LOCATION
  async (ctx) => {
    if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.BACK.cb) {
      ctx.update.callback_query.data = undefined
      ctx.wizard.back()

      return ctx.wizard.steps[ctx.wizard.cursor](ctx)
    }

    if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.CANCEL.cb) {
      ctx.reply('Отменено')
      return ctx.scene.leave()
    }

    if (ctx.message.text) {
      ctx.session.new_ride.start_point = ctx.message.text

      ctx.message.text = undefined
      ctx.wizard.next()
      return ctx.wizard.steps[ctx.wizard.cursor](ctx)
    }

    await ctx.reply('Укажите место старта (адрес или координаты)',
      Markup.inlineKeyboard([
        Markup.button.callback(Keyboard_buttons.BACK.title, Keyboard_buttons.BACK.cb),
        Markup.button.callback(Keyboard_buttons.CANCEL.title, Keyboard_buttons.CANCEL.cb),
      ]))
  },

  // SET LEVEL
  async (ctx) => {
    if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.BACK.cb) {
      ctx.update.callback_query.data = undefined
      ctx.wizard.back()

      return ctx.wizard.steps[ctx.wizard.cursor](ctx)
    }

    if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.CANCEL.cb) {
      ctx.reply('Отменено')
      return ctx.scene.leave()
    }

    if (ctx.update.callback_query && ctx.update.callback_query.data && LEVELS.includes(ctx.update.callback_query.data)) {
      ctx.session.new_ride.level = ctx.update.callback_query.data

      ctx.wizard.next()
      return ctx.wizard.steps[ctx.wizard.cursor](ctx)
    }

    await ctx.reply('Установите уровень', Markup.inlineKeyboard([
      [
        Markup.button.callback(Keyboard_buttons.HARD.title, Keyboard_buttons.HARD.cb),
        Markup.button.callback(Keyboard_buttons.MID.title, Keyboard_buttons.MID.cb),
        Markup.button.callback(Keyboard_buttons.EASY.title, Keyboard_buttons.EASY.cb),
      ],
      [
        Markup.button.callback(Keyboard_buttons.BACK.title, Keyboard_buttons.BACK.cb),
        Markup.button.callback(Keyboard_buttons.CANCEL.title, Keyboard_buttons.CANCEL.cb),
      ],
    ]))
  },

  // SET DESCRIPTION
  async (ctx) => {
    if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.CANCEL.cb) {
      ctx.reply('Отменено')
      return ctx.scene.leave()
    }

    if (ctx.message && ctx.message.text) {
      ctx.session.new_ride.description = ctx.message.text
      ctx.wizard.next()

      return ctx.wizard.steps[ctx.wizard.cursor](ctx)
    }

    await ctx.reply('Укажите краткое описание', Markup.inlineKeyboard([
      Markup.button.callback(Keyboard_buttons.BACK.title, Keyboard_buttons.BACK.cb),
      Markup.button.callback(Keyboard_buttons.CANCEL.title, Keyboard_buttons.CANCEL.cb),
    ]))
  },

  // FINISHED
  async (ctx) => {
    if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.BACK.cb) {
      ctx.update.callback_query.data = undefined
      ctx.wizard.back()

      return ctx.wizard.steps[ctx.wizard.cursor](ctx)
    }

    if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.CANCEL.cb) {
      ctx.reply('Отменено')
      return ctx.scene.leave()
    }

    const { id, first_name, last_name, username } = ctx.update.message.from
    const { title, date, level, description, start_point } = ctx.session.new_ride
    const name = `${first_name} ${last_name}`

    const newUser = await createUser({ user_id: id, name, username })

    const ride_id = await createRide({ title, date, level, description, start_point, author: newUser._id, participants: [newUser._id] })

    if (ride_id) {
      ctx.replyWithMarkdown(`Поездка создана\n ID: \`${ride_id}\``)
      ctx.reply('Можете поделиться ID этой поездки с другими участниками, чтобы им было проще её найти.')
    } else {
      ctx.reply('🙁 Что-то пошло не так, попробуйте еще раз ')
    }

    return ctx.scene.leave()
  },
)

module.exports = [
  createRideScene,
]
