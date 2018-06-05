load('api_gpio.js');
load('api_log.js');
load('api_mqtt.js');

let Button = {

  send: function (data) {
    let topic = Cfg.get('app.mqtt_topic') + '/' + Cfg.get('button.mqtt_topic');
    let s = JSON.stringify(data);
    Log.info("logging button to " + topic + ": " + s);
    MQTT.pub(topic, s);
  },

  press: function () {
    Log.info('button pressed');
    Relay.toggle();
    Button.send({event: "press"});
  },

  init: function (gpio_pin) {
    GPIO.set_button_handler(gpio_pin, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 50, Button.press, null);
  },

};
