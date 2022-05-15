const { Markup } = require('telegraf')
const { Keyboard_buttons, levels_cb } = require('../../const')
const { getAllRides, getRide, getUserById, getUserByTgId, joinRide, createUser } = require('../../handlers')
const { get_ride_markdown } = require('../../utils')

const main_menu = (ctx) => {
  ctx.reply('@ride_planner_bot', Markup.keyboard([
    Markup.button.callback(Keyboard_buttons.SHOW_UPCOMING.title),
    Markup.button.callback(Keyboard_buttons.CREATE_NEW_RIDE.title),
    Markup.button.callback(Keyboard_buttons.FIND_RIDE.title),
  ]))
}

const show_upcoming_rides = (ctx) => {
  // TODO Create scene
  getAllRides()
    .then((rides) => {
      // eslint-disable-next-line id-match
      const rides_markup_arr = rides.map(({ _id, title, description, date, start_point, level, participants }) => {
        return Markup.button.callback(`${title.toString().toUpperCase()} / ${levels_cb[level]} / ${date.toLocaleString('ru')}`, `show_specific_ride#${_id}`)
      })

      return ctx.reply('Ближайшие запланированые поездки\nВыберите поездку чтобы узнать подробнее или принять участие', Markup.inlineKeyboard(rides_markup_arr.slice(0, 7), { columns: 1 }))
    })
    .catch((e) => {
    })
}

const create_new_ride = async (ctx) => {
  ctx.scene.enter('CREATE_RIDE_WIZARD')
}

const find_ride = async (ctx) => {
  console.log('enters find ride scene')
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
