const { Markup } = require('telegraf')
const { Keyboard_buttons } = require('../../const')
const { getAllRides } = require('../../handlers')

const main_menu = (ctx) => {
  ctx.reply('@ride_planner_bot', Markup.keyboard([
    Markup.button.callback(Keyboard_buttons.SHOW_UPCOMING),

    Markup.button.callback(Keyboard_buttons.CREATE_NEW_RIDE),
  ]))
}

const show_upcoming_rides = (ctx) => {
  getAllRides()
    .then((rides) => {
      return ctx.reply(JSON.stringify(rides))
    })
    .catch((e) => {
    })
}

const create_new_ride = async (ctx) => {
  ctx.scene.enter('CREATE_RIDE_WIZARD')
}

module.exports = {
  main_menu,
  create_new_ride,
  show_upcoming_rides,
}
