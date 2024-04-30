<?php
include_once plugin_dir_path(__FILE__) . "Persistance.php";
include_once plugin_dir_path(__FILE__) . "BaseRoute.php";
include_once plugin_dir_path(__FILE__) . "Utils.php";
include_once plugin_dir_path(__FILE__) . "ErrorsUtils.php";
include_once plugin_dir_path(__FILE__) . "MailService.php";

class MailRoute extends BaseRoute
{

  public function registerRoutes()
  {
    $this->registerRoute();
  }


  public function getPermissionCheck()
  {
    return true;
  }

  public function sendPaymentDetails($request)
  {
    $payload = json_decode($request->get_body());

    $groupId = intval($payload->groupId);
    $requestedEmail = $payload->email;

    $user = Persistance::getLeader($groupId);
    if ($user->email !== $requestedEmail) {
      return new WP_REST_Response("Bad Request", 404);
    }

    $event = Persistance::getEventByGroup($groupId, true);

    if (is_null($event)) {
      return new WP_REST_Response("Bad Request", 404);
    }

    $registrations = Persistance::getRegistrationsByGroupId($groupId);
    MailService::sendNewRegistration($event, $user->id, $user->name, $user->last_name, $user->email, $registrations);

    return new WP_REST_Response("OK", 200);
  }

  private function registerRoute()
  {
    register_rest_route(
      $this->getNamespace(),
      "/mail/payment",
      array(
        array(
          'methods' => WP_REST_Server::EDITABLE,
          'callback' => array($this, 'sendPaymentDetails'),
          'permission_callback' => array($this, 'getPermissionCheck'),
          'args' => array(),
        )
      )
    );
  }

}
