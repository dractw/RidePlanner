const Keyboard_buttons = {
  CREATE_NEW_RIDE: {
    title: '🗺 Запланировать новый',
  },
  SHOW_UPCOMING: {
    title: '🏍 Ближайшие прохваты',
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

const LEVELS = [Keyboard_buttons.EASY.cb, Keyboard_buttons.HARD.cb, Keyboard_buttons.MID.cb]

module.exports = {
  Keyboard_buttons,
  LEVELS,
}
