const { Markup } = require('telegraf')
const marked = require('marked')
const { Keyboard_buttons, levels_cb } = require('../../const')
const { getAllRides } = require('../../handlers')

const main_menu = (ctx) => {
  ctx.reply('@ride_planner_bot', Markup.keyboard([
    Markup.button.callback(Keyboard_buttons.SHOW_UPCOMING.title),

    Markup.button.callback(Keyboard_buttons.CREATE_NEW_RIDE.title),
  ]))
}

const show_upcoming_rides = (ctx) => {
  // TODO Create scene
  getAllRides()
    .then((rides) => {
      // const rides_markup_arr = rides.map(({ title, description, date, start_point, level, participants }) => {
      //   const markdown = {
      //     title: `**${title.toString().toUpperCase()}**`,
      //     date: `Начало: ${date.toLocaleString('ru')} `,
      //     start: `Место сбора: \`${start_point}\` `,
      //     level: `Сложность: ${levels_cb[level]}`,
      //     participants: `Кол-во участников: ${participants.length} `,
      //     description: `_${description}_`,
      //   }
      //
      //   return Object.keys(markdown).reduce((acc, next) => acc + markdown[next] + '\n', '')
      // }).join('\n')

      // marked.parseInline(rides_markup_arr)

      // eslint-disable-next-line id-match
      const rides_markup_arr = rides.map(({ _id, title, description, date, start_point, level, participants }) => {
        // const markdown = {
        //   title: `**${title.toString().toUpperCase()}**`,
        //   date: `Начало: ${date.toLocaleString('ru')} `,
        //   start: `Место сбора: \`${start_point}\` `,
        //   level: `Сложность: ${levels_cb[level]}`,
        //   participants: `Кол-во участников: ${participants.length} `,
        //   description: `_${description}_`,
        // }

        return Markup.button.callback(`${title.toString().toUpperCase()} / ${levels_cb[level]} / ${date.toLocaleString('ru')}`, 'find_ride')
      })

      return ctx.reply('Ближайшие запланированые поездки\n Выберите поездку чтобы узнать подробнее или принять участие', Markup.inlineKeyboard(rides_markup_arr.slice(0, 7), { columns: 1 }))
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
