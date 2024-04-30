<?php
include_once plugin_dir_path(__FILE__) . "Persistance.php";
include_once plugin_dir_path(__FILE__) . "BaseRoute.php";
include_once plugin_dir_path(__FILE__) . "EventRoute.php";
include_once plugin_dir_path(__FILE__) . "Utils.php";
include_once plugin_dir_path(__FILE__) . "ErrorsUtils.php";

class EventsRoute extends BaseRoute
{

  // http://localhost/wordpress/?rest_route=/
  // http://localhost/wordpress/?rest_route=/gtevents/v1/events/1

  public function getPermissionCheck()
  {
    return true;
  }
  public function getCreatePermissionCheck()
  {
    return $this->isAdmin();
  }

  /**
   * Register the routes for the objects of the controller.
   */
  public function registerRoutes()
  {
    register_rest_route(
      $this->getNamespace(),
      '/events/(?P<limit>\d+)',
      array(
        array(
          'methods' => WP_REST_Server::READABLE,
          'callback' => array($this, 'getEvents'),
          'permission_callback' => array($this, 'getPermissionCheck'),
          'args' => array(
            'limit' => array(
              'validate_callback' => function ($param, $request, $key) {
                return is_numeric($param);
              }
            ),
          ),
        ),
      )
    );

    register_rest_route(
      $this->getNamespace(),
      '/events',
      array(
        array(
          'methods' => WP_REST_Server::CREATABLE,
          'callback' => array($this, 'createEvent'),
          'permission_callback' => array($this, 'getCreatePermissionCheck'),
          'args' => array(),
        ),
      )
    );
  }

  /**
   * Get a collection of items
   *
   * @param WP_REST_Request $request Full data about the request.
   * @return WP_Error|WP_REST_Response
   */
  public function getEvents($request)
  {
    try {
      $limit = $request->get_params()["limit"];
      $result = Persistance::listEvents(!$this->isAdmin(), $limit);
      $resp = new stdClass;
      $resp->items = $result;
      return new WP_REST_Response($resp, 200);
    } catch (Exception $e) {
      ErrorsUtils::log($e->getMessage());
      return new WP_REST_Response("Internal Server Error", 500);
    }
  }

  public function createEvent($request)
  {
    try {
      $postData = json_decode($request->get_body());
      $isValid = EventRoute::validateEventPayload($postData);
      if (!$isValid) {
        ErrorsUtils::log("invalid request: " . $request->get_body());
        return new WP_REST_Response("Bad Request", 404);
      }
      $newId = Persistance::createEvent($postData);
      $newEvent = Persistance::getEvent($newId, !$this->isAdmin());

      return new WP_REST_Response($newEvent, 201);
    } catch (Exception $e) {
      ErrorsUtils::log($e->getMessage());
      return new WP_REST_Response("Internal Server Error", 500);
    }
  }
}
