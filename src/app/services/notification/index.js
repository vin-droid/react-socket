module.exports = {
  notify_text_msg: function (msg, config){
    notify(msg, config)
  },
  notify_image_msg: function (msg, config){
    config.size || 'large'
    notify(msg, config)
  },
  notify_voice_msg: function (msg, config) {
    notify(msg, config)
  },
  notify: function (msg, config = {}) {
    if (msg.image) {
      config.size = config.size || 'large'
    }
    Lobibox.notify(config.type || 'success', {
      title: msg.title || 'Message',
      size: config.size || 'normal',              // normal, mini, large
      rounded: config.rounded || false,
      icon: config.icon || false,
      msg: msg.text || 'Hi',
      sound: msg.voice || true,
      onClickUrl: msg.url || null,
      img: msg.image || null
    });
  }
}