const { Scenes, Markup } = require('telegraf')
const { get_ride_markdown } = require('../../utils')

const { getRide, getUserById } = require('../../handlers')
const { Keyboard_buttons } = require('../../const')

const findRideScene = (bot) => {
  const current_scene = Keyboard_buttons.FIND_RIDE.title

  return new Scenes.WizardScene('FIND_RIDE_SCENE',
    async (ctx) => {
      if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.CANCEL.cb) {
        ctx.reply('Отменено')
        ctx.scene.leave()
      }

      if (ctx.message && ctx.message.text) {
        const reserved_text_messages = Object.values(Keyboard_buttons).map(({ title }) => title).filter((title) => title !== current_scene)

        if (reserved_text_messages.includes(ctx.message && ctx.message.text)) {
          return ctx.scene.leave()
        } else if (ctx.message && ctx.message.text === current_scene) {
          ctx.message.text = undefined
        }

        const ride = await getRide(ctx.message.text)
          .catch((e) => {
            console.log(e)
            ctx.reply('Поездки не существует')
          })

        if (ride) {
          const author = await getUserById(ride.author)

          ctx.replyWithHTML(
            get_ride_markdown(ride, author),
            Markup.inlineKeyboard([
              Markup.button.callback('Я поеду!', `join_ride#${ride._id}`),
            ]))

          return ctx.scene.leave()
        }
      }

      await ctx.reply('Введите ID поездки', Markup.inlineKeyboard([
        Markup.button.callback(Keyboard_buttons.CANCEL.title, Keyboard_buttons.CANCEL.cb),
      ]))
    },
  )
}

module.exports = findRideScene
