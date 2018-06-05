load('api_config.js');
load('api_gpio.js');
load('api_log.js');
load('api_mqtt.js');
load('api_rpc.js');

let Relay = {
  pin: 0,
  topic: Cfg.get('app.mqtt_topic') + '/' + Cfg.get('relay.mqtt_topic'),

  send: function (data) {
    let topic = Relay.topic;
    let s = JSON.stringify(data);
    Log.info("logging relay to " + topic + ": " + s);
    MQTT.pub(topic, s, 0, true);
    return data;
  },

  read: function () {
    return {state: GPIO.read(Relay.pin) === 1 ? "ON" : "OFF"};
  },

  toggle: function () {
    GPIO.toggle(Relay.pin);
    Feedback.success();
    return Relay.send(Relay.read());
  },

  set: function (on, quiet) {
    GPIO.write(Relay.pin, (on ? 1 : 0));
    if (!quiet) Feedback.success();
    return Relay.send(Relay.read());
  },

  init: function (gpio_pin, initial_state) {
    if (gpio_pin < 0) return;
    Relay.pin = gpio_pin;

    GPIO.set_mode(Relay.pin, GPIO.MODE_OUTPUT);
    Relay.set(initial_state, true);

    MQTT.setEventHandler(function(conn, ev) {
      if (ev === MQTT.EV_CONNACK) Relay.send(Relay.read());
    }, null);

    MQTT.sub(Relay.topic + "/toggle", Relay.toggle, null);

    MQTT.sub(Relay.topic + "/set", function(conn, topic, msg) {
      Relay.set(msg === 'ON' || msg === 'on' || msg === 'On');
    }, null);

    RPC.addHandler('Relay.Read', Relay.read);
    RPC.addHandler('Relay.Set', Relay.set);
    RPC.addHandler('Relay.Toggle', Relay.toggle);
  },

};
