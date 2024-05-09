<?php
include_once plugin_dir_path(__FILE__) . "Persistance.php";
include_once plugin_dir_path(__FILE__) . "BaseRoute.php";
include_once plugin_dir_path(__FILE__) . "Utils.php";
include_once plugin_dir_path(__FILE__) . "MailService.php";
include_once plugin_dir_path(__FILE__) . "ErrorsUtils.php";

class RegistrationsRoute extends BaseRoute
{

  public function registerRoutes()
  {
    $this->registerRoute();

  }

  public function getRegistrations($request)
  {
    try {
      $parameters = $request->get_params();

      $result = Persistance::getRegistrations($parameters['id'], $this->isAdmin());
      if (is_null($result)) {
        return new WP_REST_Response("Not Found", 404);
      }

      $resp = new stdClass;
      $resp->items = $result;
      return new WP_REST_Response($resp, 200);

    } catch (Exception $e) {
      return new WP_REST_Response("Internal Server Error", 500);
    }
  }

  public function getPermissionCheck()
  {
    return true;
  }

  public static function validateRegistrationPayload($payload, $requiredPeopleCount, $isRegistrationAllowed, $spacesLeft)
  {
    $isClubRequired = $requiredPeopleCount > 1;
    if (!Utils::isString($payload->club)) {
      ErrorsUtils::log("club not valid");
      return false;
    }

    if (!Utils::isValidString($payload->registration_type_name)) {
      ErrorsUtils::log("registration_type_name not valid");
      return false;
    }

    if ($requiredPeopleCount !== count($payload->registrations)) {
      ErrorsUtils::log("number of people in registration not valid");
      return false;
    }

    foreach ($payload->registrations as $registration) {

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


      if (!Utils::isValidEmail($registration->email)) {
        ErrorsUtils::log("email not valid");
        return false;
      }


      if (!Utils::isValidDate($registration->date_of_birth)) {
        ErrorsUtils::log("birth date not valid");
        return false;
      }

      if ($registration->gdpr !== 1) {
        ErrorsUtils::log("gdpr not valid");
        return false;
      }

    }

    return true;
  }




  public function findRegistration($regTypes, $requestedName)
  {
    foreach ($regTypes as $type) {
      if ($type->name === $requestedName) {
        return $type;
      }
    }

    return null;
  }


  public function createRegistration($request)
  {
    $transactionId = rand();

    try {

      $postData = json_decode($request->get_body());

      $parameters = $request->get_params();
      $event = Persistance::getEvent($parameters['id'], true);
      if (is_null($event)) {
        ErrorsUtils::log("registration event not found: " . $parameters['id']);
        return new WP_REST_Response("Not Found", 404);
      }


      $regTypes = json_decode($event->registrations);
      $requestedRegistration = $this->findRegistration($regTypes, $postData->registration_type_name);

      if (is_null($requestedRegistration)) {
        ErrorsUtils::log("registration group not found: " . $request->get_body());
        return new WP_REST_Response("Not Found", 404);
      }


      $spacesLeft = $event->max_people - $event->people;
      $isRegistrationAllowed = Utils::isPastDate($event->registration_end);
      $isValid = RegistrationsRoute::validateRegistrationPayload($postData, intval($requestedRegistration->number_of_people), $isRegistrationAllowed, $spacesLeft);
      if (!$isValid) {
        ErrorsUtils::log("payload not valid " . $request->get_body());
        return new WP_REST_Response("Bad Request", 400);
      }

      $newGroupId = Persistance::createRegistrationGroup($event->id, -1, $requestedRegistration->name, intval($requestedRegistration->price), intval($requestedRegistration->number_of_people), $postData->registrations[0]->email, $transactionId);
      $leaderId = Persistance::createSingleRegistration($event->id, $newGroupId, $postData->registrations[0], $postData->club, $transactionId);

      $leaderName = $postData->registrations[0]->name;
      $leaderLastName = $postData->registrations[0]->last_name;
      $leaderEmail = $postData->registrations[0]->email;

      Persistance::updateGroupLeader($leaderId, $newGroupId);

      if (count($postData->registrations) > 1) {
        array_shift($postData->registrations);
        Persistance::createRegistration($event->id, $newGroupId, $postData, $postData->club, $transactionId);
      }


      Persistance::updateEventHeadCount($event->id, $event->people + intval($requestedRegistration->number_of_people));

      $registrations = Persistance::getRegistrationsByGroupId($newGroupId);
      MailService::sendNewRegistration($event, $leaderId, $leaderName, $leaderLastName, $leaderEmail, $registrations);

      return new WP_REST_Response("OK", 201);
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
      "/registrations/(?P<id>\d+)",
      array(
        array(
          'methods' => WP_REST_Server::READABLE,
          'callback' => array($this, 'getRegistrations'),
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
      "/registrations/(?P<id>\d+)",
      array(
        array(
          'methods' => WP_REST_Server::CREATABLE,
          'callback' => array($this, 'createRegistration'),
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
