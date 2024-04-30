<?php
include_once plugin_dir_path(__FILE__) . "Persistance.php";
include_once plugin_dir_path(__FILE__) . "BaseRoute.php";
include_once plugin_dir_path(__FILE__) . "Utils.php";
include_once plugin_dir_path(__FILE__) . "ErrorsUtils.php";

class EventRoute extends BaseRoute
{


  public static function validateEventPayload($payload, $isEdit = false)
  {

    if (!Utils::isValidString($payload->name)) {
      ErrorsUtils::log("Name not valid");
      return false;
    }

    if (!Utils::isValidString($payload->short_description)) {
      ErrorsUtils::log("short_description not valid");
      return false;
    }
    if (!Utils::isValidString($payload->description)) {
      ErrorsUtils::log("description not valid");
      return false;
    }

    if (!Utils::isValidDate($payload->time)) {
      ErrorsUtils::log("time not valid");
      return false;
    }

    if (!Utils::isValidNumber($payload->max_people, 1)) {
      ErrorsUtils::log("max_people not valid");
      return false;
    }

    if ($isEdit && !Utils::isValidNumberInBounds($payload->visible, 0, 1)) {
      ErrorsUtils::log("visible not valid");
      return false;
    }

    if (!Utils::isValidDate($payload->registration_end)) {
      ErrorsUtils::log("registration_end not valid");
      return false;
    }

    if (!Utils::isValidStringNumber($payload->bank_code)) {
      ErrorsUtils::log("bank_code not valid");
      return false;
    }

    if (!Utils::isValidStringNumber($payload->account_number)) {
      ErrorsUtils::log("account_number not valid");
      return false;
    }

    return true;
  }

  public function registerRoutes()
  {
    $this->registerEventRoute();

  }

  public function getEvent($request)
  {
    try {
      global $wpdb;
      $parameters = $request->get_params();
      $onlyVisible = !$this->isAdmin();
      $result = Persistance::getEvent($parameters['id'], $onlyVisible);
      if (is_null($result)) {
        return new WP_REST_Response("Not Found", 404);
      }

      // return json_encode($result);
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

  public function getPermissionCheckAdmin()
  {
    return $this->isAdmin();
  }

  private function registerEventRoute()
  {
    register_rest_route(
      $this->getNamespace(),
      "/event/(?P<id>\d+)",
      array(
        array(
          'methods' => WP_REST_Server::READABLE,
          'callback' => array($this, 'getEvent'),
          'permission_callback' => array($this, 'getPermissionCheck'),
          'args' => array(
            'id' => array(
              'validate_callback' => function ($param, $request, $key) {
                return is_numeric($param);
              }
            ),
          ),
        )
      )
    );

    register_rest_route(
      $this->getNamespace(),
      "/event/(?P<id>\d+)",
      array(
        array(
          'methods' => WP_REST_Server::EDITABLE,
          'callback' => array($this, 'updateEvent'),
          'permission_callback' => array($this, 'getPermissionCheckAdmin'),
          'args' => array(
            'id' => array(
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
      "/event/(?P<id>\d+)",
      array(
        array(
          'methods' => WP_REST_Server::DELETABLE,
          'callback' => array($this, 'deleteEvent'),
          'permission_callback' => array($this, 'getPermissionCheckAdmin'),
          'args' => array(
            'id' => array(
              'validate_callback' => function ($param, $request, $key) {
                return is_numeric($param);
              }
            ),
          ),
        ),
      )
    );
  }

  public function updateEvent($request)
  {
    try {
      $parameters = $request->get_params();
      $payload = json_decode($request->get_body());
      $isValid = EventRoute::validateEventPayload($payload, true);
      if (!$isValid) {
        return new WP_REST_Response(array('error' => 'Error message.'), 400);
      }
      Persistance::updateEvent($parameters['id'], $payload);
      $newEvent = Persistance::getEvent($parameters['id'], !$this->isAdmin());

      return new WP_REST_Response($newEvent, 200);

    } catch (Exception $e) {
      return new WP_REST_Response("Internal Server Error", 500);
    }
  }

  public function deleteEvent($request)
  {
    try {
      $parameters = $request->get_params();
      $reqData = json_decode($request->get_body());
      if (!$this->isAdmin()) {
        return new WP_REST_Response("Not Authorized", 403);
      }

      if ($reqData->visible === "hide" || $reqData->visible === "visible") {
        Persistance::updateEventVisibility($parameters['id'], $reqData->visible === "hide" ? 0 : 1);
      } else if ($reqData->visible === "delete") {
        Persistance::deleteEvent($parameters['id']);
      }
      return new WP_REST_Response("", 200);
    } catch (Exception $e) {
      ErrorsUtils::log($e->getMessage());
      return new WP_REST_Response("Internal Server Error", 500);
    }
  }
}
