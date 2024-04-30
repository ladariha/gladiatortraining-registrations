<?php
include_once plugin_dir_path(__FILE__) . "Persistance.php";
include_once plugin_dir_path(__FILE__) . "BaseRoute.php";
include_once plugin_dir_path(__FILE__) . "ErrorsUtils.php";
include_once plugin_dir_path(__FILE__) . "MailService.php";

class ErrorsRoute extends BaseRoute
{
  public function getPermissionCheck()
  {
    return $this->isAdmin();
  }

  public function registerRoutes()
  {
    register_rest_route(
      $this->getNamespace(),
      '/errors',
      array(
        array(
          'methods' => WP_REST_Server::READABLE,
          'callback' => array($this, 'getErrors'),
          'permission_callback' => array($this, 'getPermissionCheck'),
          'args' => array(
          ),
        )
      )
    );
  }

  public function getErrors()
  {
    try {
      $result = Persistance::listErrors();
      $resp = new stdClass;
      $resp->items = $result;
      return new WP_REST_Response($resp, 200);
    } catch (Exception $e) {
      ErrorsUtils::log($e->getMessage());
      return new WP_REST_Response("Internal Server Error", 500);
    }
  }
}
