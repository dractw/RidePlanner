const { Scenes, Markup } = require('telegraf')
const moment = require('moment')
const { Keyboard_buttons } = require('../../const')

const createRideScene = (bot) => new Scenes.WizardScene('CREATE_RIDE_WIZARD',
  // SET NAME
  async (ctx) => {
    if (ctx.update.callback_query && ctx.update.callback_query.data === 'cancel_scene') {
      ctx.reply('Отменено')
      return ctx.scene.leave()
    }

    if (ctx.message && ctx.message.text) {
      const reserved_text_messages = Object.values(Keyboard_buttons)

      if (!reserved_text_messages.includes(ctx.message.text)) {
        ctx.session.new_ride = { name: ctx.message.text }
        ctx.message.text = undefined
        ctx.wizard.next()
        return ctx.wizard.steps[ctx.wizard.cursor](ctx)
      }
    }

    await ctx.reply('Название поездки?', Markup.inlineKeyboard([
      Markup.button.callback('❌ Отменить', 'cancel_scene'),
    ]))
  },

  // SET DATE
  async (ctx) => {
    if (ctx.update.callback_query && ctx.update.callback_query.data === 'step_back') {
      ctx.update.callback_query.data = undefined
      ctx.wizard.back()

      return ctx.wizard.steps[ctx.wizard.cursor](ctx)
    }

    if (ctx.update.callback_query && ctx.update.callback_query.data === 'cancel_scene') {
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

    await ctx.reply('Укажите дату и время\n (ДД.ММ.ГГ ЧЧ:ММ)',
      Markup.inlineKeyboard([
        Markup.button.callback('🔙 Назад', 'step_back'),
        Markup.button.callback('❌ Отменить', 'cancel_scene'),
      ]))
  },

  // SET LOCATION
  async (ctx) => {
    if (ctx.update.callback_query && ctx.update.callback_query.data === 'step_back') {
      ctx.update.callback_query.data = undefined
      ctx.wizard.back()

      return ctx.wizard.steps[ctx.wizard.cursor](ctx)
    }

    if (ctx.update.callback_query && ctx.update.callback_query.data === 'cancel_scene') {
      ctx.reply('Отменено')
      return ctx.scene.leave()
    }

    if (ctx.message.text) {
      ctx.session.new_ride.place = ctx.message.text
      ctx.wizard.next()

      return ctx.wizard.steps[ctx.wizard.cursor](ctx)
    }

    await ctx.reply('Место старта или координаты', Markup.inlineKeyboard([
      Markup.button.callback('🔙 Назад', 'step_back'),
      Markup.button.callback('❌ Отменить', 'cancel_scene'),
    ]))
  },

  // FINISHED
  async (ctx) => {
    if (ctx.update.callback_query && ctx.update.callback_query.data === 'step_back') {
      ctx.update.callback_query.data = undefined
      ctx.wizard.back()

      return ctx.wizard.steps[ctx.wizard.cursor](ctx)
    }

    if (ctx.update.callback_query && ctx.update.callback_query.data === 'cancel_scene') {
      ctx.reply('Отменено')
      return ctx.scene.leave()
    }

    ctx.reply('Поездка создана!')
    ctx.reply(JSON.stringify(ctx.session.new_ride))
    return ctx.scene.leave()
  },
)

module.exports = [
  createRideScene,
]
