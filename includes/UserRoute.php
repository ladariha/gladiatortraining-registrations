<?php
include_once plugin_dir_path(__FILE__) . "Persistance.php";
include_once plugin_dir_path(__FILE__) . "BaseRoute.php";
include_once plugin_dir_path(__FILE__) . "Utils.php";
include_once plugin_dir_path(__FILE__) . "ErrorsUtils.php";

class UserRoute extends BaseRoute
{

  public function registerRoutes()
  {
    register_rest_route(
      $this->getNamespace(),
      '/user',
      array(
        array(
          'methods' => WP_REST_Server::READABLE,
          'callback' => array($this, 'getUser'),
          'permission_callback' => array($this, 'getPermissionCheck'),
          'args' => array(
          ),
        )
      )
    );
  }

  public function getUser($request)
  {
    try {
      global $wpdb;
      $result = new stdClass;
      $result->role = $this->isAdmin() ? "admin" : "user";
      return new WP_REST_Response($result, 200);

    } catch (Exception $e) {
      ErrorsUtils::log($e->getMessage());
      return new WP_REST_Response("Internal Server Error", 500);
    }
  }

  public function getPermissionCheck()
  {
    return true;
  }
}
