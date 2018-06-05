load('api_log.js');
load('api_mqtt.js');

let Ready = {

  _mqtt_connect: function (conn, ev) {
  if (ev === MQTT.EV_CONNACK) {
    Log.info("MQTT connected");
    Log.info("app initialization complete");
      Feedback.success();
  }
  },

  init: function () {
    Log.info("app initialization starting");
    Feedback.waiting();
    MQTT.setEventHandler(Ready._mqtt_connect, null);
  },

};
