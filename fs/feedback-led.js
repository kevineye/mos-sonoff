load('api_bitbang.js');
load('api_gpio.js');
load('api_timer.js');

let Feedback = {
  pin: 0,
  timer: null,

  stop: function () {
    if (Feedback.timer !== null) {
      Timer.del(Feedback.timer);
      Feedback.timer = null;
    }
    GPIO.write(Feedback.pin, 1);
  },

  // three quick pulses every two seconds
  waiting: function () {
    Feedback.stop();
    Feedback.timer = Timer.set(2000, Timer.REPEAT, function() {
      BitBang.write(Feedback.pin, BitBang.DELAY_MSEC, 0, 0, 50, 50, '\xE0', 1);
      GPIO.write(Feedback.pin, 1);
    }, null);
  },

  // two slower pulses
  success: function () {
    Feedback.stop();
    BitBang.write(Feedback.pin, BitBang.DELAY_MSEC, 0, 0, 100, 100, '\xC0', 1);
    GPIO.write(Feedback.pin, 1);
  },

  init: function (gpio_pin) {
    Feedback.pin = gpio_pin;
    GPIO.set_mode(Feedback.pin, GPIO.MODE_OUTPUT);
    Feedback.stop();
  }

};
