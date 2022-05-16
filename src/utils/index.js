const moment = require('moment')
const marked = require('marked')
const { levels_cb } = require('../const')

const get_ride_markdown = (ride, author) => {
  const { title, date, start_point, level, participants, description, _id } = ride
  const markdown_obj = {
    title: `**${title.toString().toUpperCase()}** (\`${_id}\`)`,
    date: `Начало: ${moment(date).locale('ru').format('DD.MM.YYYY, hh:mm')} `,
    start: `Место сбора: \`${start_point}\` `,
    level: `Сложность: ${levels_cb[level]}`,
    participants: `Кол-во участников: ${participants.length} `,
    description: `Инфо: _${description}_`,
    author: `Орг: [${author.username}](tg://user?id=${author.user_id})`,
  }

  return marked.parseInline(Object.keys(markdown_obj).reduce((acc, next) => acc + markdown_obj[next] + '\n', ''))
}

const default_bot_reply = (ctx) => ctx.reply('@ride_planner_bot - бот для отслеживания запланированых прохватов и событий\n Напиши ему /start, он тебе всё расскажет ;)')

module.exports = {
  get_ride_markdown,
  default_bot_reply,
}
