load('api_config.js');
load('button-sonoff.js');
load('feedback-led.js');
load('ready.js');
load('relay.js');

Feedback.init(Cfg.get('app.led_pin'));
Ready.init();
Relay.init(Cfg.get('relay.pin'), true);
Button.init(Cfg.get('button.pin'));
