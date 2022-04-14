const Keyboard_buttons = {
  CREATE_NEW_RIDE: {
    title: '🗺 Запланировать новый',
  },
  SHOW_UPCOMING: {
    title: '🏍 Ближайшие прохваты',
  },
  SHOW_RIDE: {
    title: 'Показать поездку',
    cb: 'find_ride',
  },
  FIND_RIDE: {
    title: 'Найти поездку',
    cb: 'find_ride',
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

module.exports = {
  Keyboard_buttons,
  levels_cb,
  LEVELS,
}
