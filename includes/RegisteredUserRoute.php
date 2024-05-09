<?php
include_once plugin_dir_path(__FILE__) . "Persistance.php";
include_once plugin_dir_path(__FILE__) . "BaseRoute.php";
include_once plugin_dir_path(__FILE__) . "Utils.php";
include_once plugin_dir_path(__FILE__) . "MailService.php";
include_once plugin_dir_path(__FILE__) . "ErrorsUtils.php";

class RegisteredUserRoute extends BaseRoute
{

  public function registerRoutes()
  {
    $this->registerRoute();

  }

  public static function validateUpdatePayload($registration)
  {
    if (!Utils::isValidString($registration->address)) {
      ErrorsUtils::log("address not valid");
      return false;
    }

    if (!Utils::isValidString($registration->last_name)) {
      ErrorsUtils::log("last_name not valid");
      return false;
    }

    if (!Utils::isValidString($registration->name)) {
      ErrorsUtils::log("name not valid");
      return false;
    }

    if ($registration->sex !== "muž" && $registration->sex !== "žena") {
      ErrorsUtils::log("sex not valid");
      return false;
    }

    if (!Utils::isValidPhone($registration->phone)) {
      ErrorsUtils::log("phone not valid");
      return false;
    }

    if (!Utils::isString($registration->club)) {
      ErrorsUtils::log("club not valid");
      return false;
    }

    if (!Utils::isValidEmail($registration->email)) {
      ErrorsUtils::log("email not valid");
      return false;
    }

    if (!Utils::isValidDate($registration->date_of_birth)) {
      ErrorsUtils::log("birth date not valid");
      return false;
    }

    return true;
  }


  public function getPermissionCheck()
  {
    return $this->isAdmin();
  }


  public function updateRegistration($request)
  {
    $transactionId = rand();

    try {

      $postData = json_decode($request->get_body());
      $parameters = $request->get_params();
      $isValid = RegisteredUserRoute::validateUpdatePayload($postData);
      if (!$isValid) {
        ErrorsUtils::log("payload not valid " . $request->get_body());
        return new WP_REST_Response("Bad Request", 400);
      }

      Persistance::updateRegisteredUser(intval($parameters['id'], 10), $postData);
      return new WP_REST_Response("OK", 200);

    } catch (Exception $e) {
      ErrorsUtils::log($e->getMessage());
      Persistance::deleteRegistrationGroupByTransactionId($transactionId);
      Persistance::deleteRegistrations($transactionId);

      return new WP_REST_Response("Internal Server Error", 500);
    }
  }

  private function registerRoute()
  {
    register_rest_route(
      $this->getNamespace(),
      "/registeredUser/(?P<id>\d+)",
      array(
        array(
          'methods' => WP_REST_Server::EDITABLE,
          'callback' => array($this, 'updateRegistration'),
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

  }
}
