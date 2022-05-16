const { Markup } = require('telegraf')
const { Keyboard_buttons, levels_cb } = require('../../const')
const { getAllRides, getRide, getUserById, getUserByTgId, joinRide, createUser, leaveRide, cancelRide, editRide } = require('../../handlers')
const { get_ride_markdown, default_bot_reply, get_bot_name } = require('../../utils')

const main_menu = async (ctx) => {
  await ctx.reply(get_bot_name(), Markup.keyboard([
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

const show_specific_ride = async (ctx, id, bot, reply) => {
  if (reply) {
    ctx.reply(reply)
  }

  const ride = await getRide(id)

  if (ride) {
    const author = await getUserById(ride.author)
    const user = ctx.update.callback_query.from.id === author.user_id ? author : await getUserByTgId(ctx.update.callback_query.from.id)

    const is_author = ctx.update.callback_query.from.id.toString() === author.user_id.toString()

    const already_participant = !!ride.participants.find((participant) => participant.toString() === user && user._id.toString())

    ctx.replyWithHTML(
      get_ride_markdown(ride, author),
      Markup.inlineKeyboard([
        // Markup.button.callback('✏️ Редактировать поездку', `edit_ride#${ride._id}`, !is_author),
        Markup.button.callback('❌ Отменить поездку!', `cancel_ride#${ride._id}`, !is_author),
        Markup.button.callback('👌 Я поеду!', `join_ride#${ride._id}`, is_author || already_participant),
        Markup.button.callback('❌ Отменить участие', `leave_ride#${ride._id}`, is_author || !already_participant),
      ], { columns: 1 }),
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
    await show_specific_ride(ctx, ride_id, undefined, 'Вы добавлены в участники\nЯ постараюсь вам напомнить о поездке за 24 часа (но это не точно)')
  }
}

const leave_ride = async (ctx, ride_id) => {
  const { id } = ctx.update.callback_query.from

  const user = await getUserByTgId(id)

  await leaveRide(ride_id, user._id)

  await show_specific_ride(ctx, ride_id, undefined, 'Вы отменили участие')
}

const cancel_ride = async (ctx, ride_id, bot) => {
  const ride = await getRide(ride_id)
  const author = await getUserById(ride.author)

  await cancelRide(ride_id)

  ride.participants.forEach(async (participant) => {
    const user = await getUserById(participant)

    if (user.user_id !== author.user_id) {
      await bot.telegram.sendMessage(user.user_id, get_ride_markdown(ride, author, '😔 Поездка, в которой вы учавствовали, была отменена организатором. 😔'), { parse_mode: 'HTML' })
    }
  })

  await ctx.reply('😔 Поездка была отменена.')
  show_upcoming_rides(ctx)
}

module.exports = {
  main_menu,
  create_new_ride,
  show_specific_ride,
  show_upcoming_rides,
  join_ride,
  find_ride,
  leave_ride,
  cancel_ride,
}
