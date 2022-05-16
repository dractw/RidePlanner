const { Markup } = require('telegraf')
const { Keyboard_buttons, levels_cb } = require('../../const')
const { getAllRides, getRide, getUserById, getUserByTgId, joinRide, createUser } = require('../../handlers')
const { get_ride_markdown, default_bot_reply } = require('../../utils')

const main_menu = async (ctx) => {
  await ctx.reply('@ride_planner_bot', Markup.keyboard([
    Markup.button.callback(Keyboard_buttons.SHOW_UPCOMING.title),
    Markup.button.callback(Keyboard_buttons.CREATE_NEW_RIDE.title),
    Markup.button.callback(Keyboard_buttons.FIND_RIDE.title),
  ])).catch((e) => console.error('Something  bad happens:', e))
}

const show_upcoming_rides = async (ctx) => {
  if (ctx.message && ctx.message.chat.type !== 'private') {
    return default_bot_reply(ctx)
  }

  const rides = await getAllRides(Date.now())

  if (rides && rides.length > 0) {
    // eslint-disable-next-line id-match
    const rides_markup_arr = rides.map(({ _id, title, description, date, start_point, level, participants }) => {
      return Markup.button.callback(`${title.toString().toUpperCase()} / ${levels_cb[level]} / ${date.toLocaleString('ru')}`, `show_specific_ride#${_id}`)
    })

    return ctx.reply('Запланированые поездки на ближайшую неделю\nВыберите поездку чтобы узнать подробнее или принять участие', Markup.inlineKeyboard(rides_markup_arr.slice(0, 7), { columns: 1 }))
  }

  return ctx.reply('😔 На ближайшую неделю ничего не запланировано')
}

const create_new_ride = async (ctx) => {
  if (ctx.message && ctx.message.chat.type !== 'private') {
    return default_bot_reply(ctx)
  }

  ctx.scene.enter('CREATE_RIDE_WIZARD')
}

const find_ride = async (ctx) => {
  if (ctx.message && ctx.message.chat.type !== 'private') {
    return default_bot_reply(ctx)
  }

  ctx.scene.enter('FIND_RIDE_SCENE')
}

const show_specific_ride = async (ctx, id) => {
  const ride = await getRide(id)

  if (ride) {
    const author = await getUserById(ride.author)

    ctx.replyWithHTML(
      get_ride_markdown(ride, author),
      Markup.inlineKeyboard([
        Markup.button.callback('Я поеду!', `join_ride#${ride._id}`),
      ]),
    )
  } else {
    ctx.reply('Поездки не существует')
  }
}

const join_ride = async (ctx, ride_id) => {
  const { id, first_name, last_name, username } = ctx.update.callback_query.from
  const name = `${first_name} ${last_name}`

  let user = await getUserByTgId(id)

  if (!user) {
    user = await createUser({ user_id: id, name, username })
  }

  const joined = await joinRide(ride_id, user._id)

  if (joined.modifiedCount > 0) {
    ctx.reply('Вы добавлены в участники\nЯ постараюсь вам напомнить о поездке за 24 часа (но это не точно)')
  } else {
    ctx.reply('Вы уже учавствуете')
  }
}

module.exports = {
  main_menu,
  create_new_ride,
  show_specific_ride,
  show_upcoming_rides,
  join_ride,
  find_ride,
}
