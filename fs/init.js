load('api_rpc.js');
load('api_timer.js');
load('api_log.js');
load('api_mqtt.js');
load('ready.js');

let topic_base = Cfg.get('app.mqtt_topic');

let led_pin = Cfg.get('app.led_pin');
GPIO.set_mode(led_pin, GPIO.MODE_OUTPUT);

let switch_pin = Cfg.get('app.switch_pin');
GPIO.set_mode(switch_pin, GPIO.MODE_OUTPUT);
GPIO.write(switch_pin, 1);

function readSwitchState() {
  let data = {};
  let state = GPIO.read(switch_pin);
  data.state = (state === 1 ? "ON" : "OFF");
  return data;
}

function publishSwitchState() {
  let data = readSwitchState();
  let s = JSON.stringify(data);
  Log.info("logging to " + topic_base + "/switch: " + s);
  MQTT.pub(topic_base + "/switch", s, 0, true);
  return data;
}

function pulse2() {
  // two slower pulses
  BitBang.write(led_pin, BitBang.DELAY_MSEC, 0, 0, 100, 100, '\xC0', 1);
  GPIO.write(led_pin, 1);
}
function toggleSwitch() {
  let v = GPIO.toggle(switch_pin);
  Log.info("switching " + (v === 1 ? "on" : "off"));
  pulse2();
  return publishSwitchState();
}

function setSwitch(on) {
  GPIO.write(switch_pin, (on ? 1 : 0));
  Log.info("switching " + (on ? "on" : "off"));
  pulse2();
  return publishSwitchState();
}

MQTT.setEventHandler(function(conn, ev, edata) {
  if (ev === MQTT.EV_CONNACK) {
    publishSwitchState();
  }
}, null);


MQTT.sub(topic_base + "/switch/toggle", function() {
  Log.info("received toggle");
  toggleSwitch();
}, null);

MQTT.sub(topic_base + "/switch/set", function(conn, topic, msg) {
  Log.info("received set: " + msg);
  setSwitch(msg === 'ON' || msg === 'on' || msg === 'On');
}, null);

RPC.addHandler('Switch.Read', readSwitchState);
RPC.addHandler('Switch.Set', setSwitch);
RPC.addHandler('Switch.Toggle', toggleSwitch);

let button_pin = Cfg.get('app.button_pin');
GPIO.set_button_handler(button_pin, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function() {
  Log.info('button pressed');
  toggleSwitch();
}, null);
