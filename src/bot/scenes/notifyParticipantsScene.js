const { Scenes, Markup } = require('telegraf')
const moment = require('moment')
const marked = require('marked')

const { show_specific_ride } = require('../callbacks')
const { getRide, getUserById } = require('../../handlers')
const { Keyboard_buttons } = require('../../const')

const findRideScene = (bot) => {
  const current_scene = Keyboard_buttons.NOTIFY_PARTICIPANTS.title

  return new Scenes.WizardScene('NOTIFY_PARTICIPANTS_SCENE',
    async (ctx) => {
      if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.CANCEL.cb) {
        ctx.reply('Отменено')
        return ctx.scene.leave()
      }
      if (ctx.message && ctx.message.text) {
        const reserved_text_messages = Object.values(Keyboard_buttons).map(({ title }) => title).filter((title) => title !== current_scene)

        if (reserved_text_messages.includes(ctx.message && ctx.message.text)) {
          return ctx.scene.leave()
        } else if (ctx.message && ctx.message.text === current_scene) {
          ctx.message.text = undefined
        }

        const ride = await getRide(ctx.scene.state.ride_id)
          .catch((e) => {
            ctx.reply('Поездки не существует')
          })

        if (ride && ctx.message.text) {
          const author = await getUserById(ride.author)

          console.log(ctx.message.text)
          ctx.scene.state.author = author
          ctx.scene.state.ride = ride
          ctx.scene.state.message = ctx.message.text

          console.log('state', ctx.scene.state.message)

          ctx.wizard.next()
          return ctx.wizard.steps[ctx.wizard.cursor](ctx)
        }
      }

      await ctx.reply('Введите текст уведомления, его получат все участники', Markup.inlineKeyboard([
        Markup.button.callback(Keyboard_buttons.CANCEL.title, Keyboard_buttons.CANCEL.cb),
      ]))
    },

    async (ctx) => {
      if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.CANCEL.cb) {
        ctx.reply('Отменено')
        return ctx.scene.leave()
      }

      if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.BACK.cb) {
        ctx.update.callback_query.data = undefined
        ctx.wizard.back()

        return ctx.wizard.steps[ctx.wizard.cursor](ctx)
      }

      if (ctx.update.callback_query && ctx.update.callback_query.data === 'step_next') {
        ctx.update.callback_query.data = undefined
        ctx.wizard.next()

        return ctx.wizard.steps[ctx.wizard.cursor](ctx)
      }

      if (ctx.message && ctx.message.text) {
        const reserved_text_messages = Object.values(Keyboard_buttons).map(({ title }) => title).filter((title) => title !== current_scene)

        if (reserved_text_messages.includes(ctx.message && ctx.message.text)) {
          return ctx.scene.leave()
        } else if (ctx.message && ctx.message.text === current_scene) {
          ctx.message.text = undefined
        }

        ctx.scene.state.message = ctx.message.text
      }

      await ctx.replyWithHTML(marked.parseInline(`Сообщение к отправке: \`\`\`${ctx.scene.state.message}\`\`\`\ \n\nИли введите новый текст`), Markup.inlineKeyboard([
        [
          Markup.button.callback('✔️ Отправить', 'step_next'),
        ],
        [
          Markup.button.callback(Keyboard_buttons.CANCEL.title, Keyboard_buttons.CANCEL.cb),
        ],
      ]))
    },

    async (ctx) => {
      const { author, ride, message } = ctx.scene.state
      const message_markup = [`📣 Сообщение от организатора **${ride.title} / ${moment(ride.date).locale('ru').format('DD.MM.YYYY, hh:mm')}**:\n\n`]

      message_markup.push(message)

      for (let index = 0; index < ride.participants.length; index++) {
        const participant = ride.participants[index]
        const user = await getUserById(participant)

        if (user.user_id !== author.user_id) {
          await bot.telegram.sendMessage(
            user.user_id,
            marked.parseInline(message_markup.join('')),
            { parse_mode: 'HTML' },
          )
        }
      }

      ctx.scene.leave()
      return show_specific_ride(ctx, ride._id, undefined, '✔️ Ваше сообщение отправлено')
    },
  )
}

module.exports = findRideScene
