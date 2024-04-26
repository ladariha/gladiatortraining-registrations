<?php
include_once plugin_dir_path(__FILE__) . "Persistance.php";
include_once plugin_dir_path(__FILE__) . "BaseRoute.php";
include_once plugin_dir_path(__FILE__) . "ErrorsUtils.php";

class ApiKeysRoute extends BaseRoute
{

  public function getPermissionCheck()
  {
    return $this->isAdmin();
  }

  public function setKey($request)
  {
    try {
      if (!$this->isAdmin()) {
        return new WP_REST_Response("Unauthorized", 403);
      }

      $payload = json_decode($request->get_body());
      Persistance::setApiKey($payload->name, $payload->value);
      return new WP_REST_Response("OK", 200);
    } catch (Exception $e) {
      ErrorsUtils::log($e->getMessage());
      return new WP_REST_Response("Internal Server Error", 500);
    }
  }

  public function registerRoutes()
  {
    register_rest_route(
      $this->getNamespace(),
      '/keys',
      array(
        array(
          'methods' => WP_REST_Server::EDITABLE,
          'callback' => array($this, 'setKey'),
          'permission_callback' => array($this, 'getPermissionCheck'),
          'args' => array(
          ),
        )
      )
    );
  }
}
