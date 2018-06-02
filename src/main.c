#include "mgos.h"
#include "mgos_mqtt.h"

static void sonoff_mqtt_connect_cb(struct mg_connection *c,
                                   const char *client_id,
                                   struct mg_send_mqtt_handshake_opts *opts,
                                   void *arg) {
  char *will_topic = (char *) calloc(1, strlen(mgos_sys_config_get_app_mqtt_topic()) + 8);
  strcpy(will_topic, mgos_sys_config_get_app_mqtt_topic());
  strcat(will_topic, "/switch");
  LOG(LL_INFO, ("intercepting connect, will_topic=%s", will_topic));
  opts->will_topic = will_topic;
  opts->will_message = "{\"state\":\"OFF\"}";
  mg_send_mqtt_handshake_opt(c, client_id, *opts);
  free(will_topic);
}

enum mgos_app_init_result mgos_app_init(void) {
  mgos_mqtt_set_connect_fn(sonoff_mqtt_connect_cb, NULL);
  return MGOS_APP_INIT_SUCCESS;
}
