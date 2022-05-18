const welcome_message = require('./welcome_message')

const Keyboard_buttons = {
  CREATE_NEW_RIDE: {
    title: '🗺 Запланировать новый',
  },
  SHOW_UPCOMING: {
    title: '🏍 Ближайшие прохваты',
  },
  FIND_RIDE: {
    title: '🔎 Найти поездку',
    cb: 'find_ride',
  },
  NOTIFY_PARTICIPANTS: {
    title: '📣 Уведомление для участников',
    cb: 'notify_participants',
  },
  CANCEL: {
    title: '❌ Отменить',
    cb: 'cancel_scene',
  },
  BACK: {
    title: '🔙 Назад',
    cb: 'step_back',
  },
  HARD: {
    title: '🌶🌶🌶',
    cb: 'level_hard',
  },
  MID: {
    title: '🌶🌶',
    cb: 'level_mid',
  },
  EASY: {
    title: '🌶',
    cb: 'level_easy',
  },
}

const levels_cb = {
  level_easy: Keyboard_buttons.EASY.title,
  level_hard: Keyboard_buttons.HARD.title,
  level_mid: Keyboard_buttons.MID.title,
}

const LEVELS = [Keyboard_buttons.EASY.cb, Keyboard_buttons.HARD.cb, Keyboard_buttons.MID.cb]
const command_triggers = ['ride', 'bot']
const shabang_triggers = ['#прохват', '#прохваты', '#покатухи', '#покататься', '#бот', '#покатать']

module.exports = {
  Keyboard_buttons,
  levels_cb,
  LEVELS,
  command_triggers,
  shabang_triggers,
  welcome_message,
}
