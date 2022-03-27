const { Markup } = require('telegraf')
const { getAllRides, createUser } = require('../../handlers')

const main_menu = (ctx) => {
  ctx.reply('@ride_planner_bot', Markup.inlineKeyboard([
    Markup.button.callback('Ближайшие прохваты', 'show_upcoming_rides'),

    Markup.button.callback('Запланировать новый', 'create_new_ride'),
  ]))
}

const show_upcoming_rides = (ctx) => {
  getAllRides()
    .then((rides) => {
      console.log(rides)
      return ctx.reply(JSON.stringify(rides))
    })
    .catch((e) => {
      ctx.reply('Show upcoming')
    })
}

const create_new_ride = async (ctx) => {
  const { id, last_name, first_name, username } = ctx.update.callback_query.from

  const user_params = {
    user_id: id,
    name: `${first_name} ${last_name}`,
    username,
  }

  createUser(user_params)

  ctx.reply('create new')
}

module.exports = {
  main_menu,
  create_new_ride,
  show_upcoming_rides,
}
