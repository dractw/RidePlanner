const { Scenes, Markup } = require('telegraf')
const moment = require('moment')

const { createUser, createRide } = require('../../handlers')
const { Keyboard_buttons, LEVELS } = require('../../const')

const date_pick_range_map = () => {
  const days_map = new Map()
  const days_to_plan = 14

  Array(days_to_plan)
    .fill(0)
    .forEach((day, index) => {
      const moment_obj = moment().add(index + 1, 'days')
      const day_to_pick = moment_obj.format('DD MMMM')

      days_map.set(day_to_pick, moment_obj)
    })

  return days_map
}

const default_hours = [
  '8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
]

const wrong_date_message = 'Неправильно указана дата/время, попробуйте еще раз'

const createRideScene = (bot) => {
  const scene_id = 'CREATE_RIDE_WIZARD'
  const current_scene = Keyboard_buttons.CREATE_NEW_RIDE.title

  return new Scenes.WizardScene(scene_id,
    // SET NAME
    async (ctx) => {
      if (ctx.update.callback_query && ctx.update.callback_query.data === 'cancel_scene') {
        ctx.reply('Отменено')
        return ctx.scene.leave()
      }

      if (ctx.message && ctx.message.text) {
        const reserved_text_messages = Object.values(Keyboard_buttons).map(({ title }) => title).filter((title) => title !== current_scene)

        if (reserved_text_messages.includes(ctx.message && ctx.message.text)) {
          return ctx.scene.leave()
        } else if (ctx.message && ctx.message.text === current_scene) {
          ctx.message.text = undefined
        } else {
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
      const reserved_text_messages = Object.values(Keyboard_buttons).map(({ title }) => title).filter((title) => title !== current_scene)

      if (reserved_text_messages.includes(ctx.message && ctx.message.text)) {
        return ctx.scene.leave()
      } else if (ctx.message && ctx.message.text === current_scene) {
        ctx.message.text = undefined
      }

      if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.BACK.cb) {
        ctx.update.callback_query.data = undefined
        ctx.wizard.back()

        return ctx.wizard.steps[ctx.wizard.cursor](ctx)
      }

      if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.CANCEL.cb) {
        ctx.reply('Отменено')
        return ctx.scene.leave()
      }

      const days_map = date_pick_range_map()

      const date_selected = (ctx.message && ctx.message.text) || (ctx.update.callback_query && ctx.update.callback_query.data)

      if (date_selected === wrong_date_message) {
        return
      }

      if (date_selected) {
        const date = days_map.get(date_selected) || moment.utc(date_selected, 'DD.MM.YYYY')

        if (!(date && date.isValid())) {
          ctx.reply(wrong_date_message)
          const step = ctx.wizard.step

          return step(ctx)
        }
        ctx.session.new_ride.date = date

        if (ctx.message && ctx.message.text) {
          ctx.message.text = undefined
        }

        if (ctx.update.callback_query && ctx.update.callback_query.data) {
          ctx.update.callback_query.data = undefined
        }

        ctx.wizard.next()
        return ctx.wizard.steps[ctx.wizard.cursor](ctx)
      }

      const days_buttons = Array.from(days_map, ([name]) => Markup.button.callback(name, name))

      // ctx.replyWithChatAction(Markup.keyboard(days_buttons, { columns: 2 }))

      await ctx.reply('Выберите дату поездки, или укажите вручную (ДД.ММ.ГГ)',
        Markup.inlineKeyboard(
          [
            ...days_buttons,
            Markup.button.callback(Keyboard_buttons.BACK.title, Keyboard_buttons.BACK.cb),
            Markup.button.callback(Keyboard_buttons.CANCEL.title, Keyboard_buttons.CANCEL.cb),
          ],
          { columns: 2 },
        ),
      )
    },

    // SET TIME
    async (ctx) => {
      const reserved_text_messages = Object.values(Keyboard_buttons).map(({ title }) => title).filter((title) => title !== current_scene)

      if (reserved_text_messages.includes(ctx.message && ctx.message.text)) {
        return ctx.scene.leave()
      } else if (ctx.message && ctx.message.text === current_scene) {
        ctx.message.text = undefined
      }

      if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.BACK.cb) {
        ctx.update.callback_query.data = undefined
        ctx.wizard.back()

        return ctx.wizard.steps[ctx.wizard.cursor](ctx)
      }

      if (ctx.update.callback_query && ctx.update.callback_query.data === Keyboard_buttons.CANCEL.cb) {
        ctx.reply('Отменено')
        return ctx.scene.leave()
      }

      const time_selected = (ctx.message && ctx.message.text) || (ctx.update.callback_query && ctx.update.callback_query.data)

      if (time_selected === wrong_date_message) {
        return
      }

      if (time_selected) {
        const temp_date = ctx.session.new_ride.date

        if (!moment(time_selected, 'hh:mm').isValid()) {
          ctx.reply(wrong_date_message)

          if (ctx.message && ctx.message.text) {
            ctx.message.text = undefined
          }
          const step = ctx.wizard.step

          return step(ctx)
        }

        temp_date.set({
          hour: time_selected.split(':')[0],
          minute: time_selected.split(':')[1],
        })

        ctx.session.new_ride.date = temp_date

        if (ctx.message && ctx.message.text) {
          ctx.message.text = undefined
        }

        if (ctx.update.callback_query && ctx.update.callback_query.data) {
          ctx.update.callback_query.data = undefined
        }

        ctx.wizard.next()
        return ctx.wizard.steps[ctx.wizard.cursor](ctx)
      }

      await ctx.reply('Выберите время старта, или укажите вручную (ЧЧ или ЧЧ:MM)',
        Markup.inlineKeyboard(
          [
            ...default_hours.map((hour) => Markup.button.callback(hour, hour)),
            Markup.button.callback(Keyboard_buttons.BACK.title, Keyboard_buttons.BACK.cb),
            Markup.button.callback(Keyboard_buttons.CANCEL.title, Keyboard_buttons.CANCEL.cb),
          ],
          { columns: 2 },
        ),
      )
    },

    // SET LOCATION
    async (ctx) => {
      const reserved_text_messages = Object.values(Keyboard_buttons).map(({ title }) => title).filter((title) => title !== current_scene)

      if (reserved_text_messages.includes(ctx.message && ctx.message.text)) {
        return ctx.scene.leave()
      } else if (ctx.message && ctx.message.text === current_scene) {
        ctx.message.text = undefined
      }

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
        ctx.session.new_ride.start_point = ctx.message.text

        ctx.message.text = undefined
        ctx.wizard.next()
        return ctx.wizard.steps[ctx.wizard.cursor](ctx)
      }

      await ctx.reply('Укажите место старта (Очень желательно указать точный адрес или координаты, чтобы другие участники проще вас нашли)',
        Markup.inlineKeyboard([
          Markup.button.callback(Keyboard_buttons.BACK.title, Keyboard_buttons.BACK.cb),
          Markup.button.callback(Keyboard_buttons.CANCEL.title, Keyboard_buttons.CANCEL.cb),
        ]))
    },

    // SET LEVEL
    async (ctx) => {
      const reserved_text_messages = Object.values(Keyboard_buttons).map(({ title }) => title).filter((title) => title !== current_scene)

      if (reserved_text_messages.includes(ctx.message && ctx.message.text)) {
        return ctx.scene.leave()
      } else if (ctx.message && ctx.message.text === current_scene) {
        ctx.message.text = undefined
      }

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
      const reserved_text_messages = Object.values(Keyboard_buttons).map(({ title }) => title).filter((title) => title !== current_scene)

      if (reserved_text_messages.includes(ctx.message && ctx.message.text)) {
        ctx.scene.leave()
      } else if (ctx.message && ctx.message.text === current_scene) {
        ctx.message.text = undefined
      }

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
      const reserved_text_messages = Object.values(Keyboard_buttons).map(({ title }) => title).filter((title) => title !== current_scene)

      if (reserved_text_messages.includes(ctx.message && ctx.message.text)) {
        return ctx.scene.leave()
      } else if (ctx.message && ctx.message.text === current_scene) {
        ctx.message.text = undefined
      }

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
}

module.exports = createRideScene
