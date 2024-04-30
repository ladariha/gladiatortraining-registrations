<?php
include_once plugin_dir_path(__FILE__) . "Persistance.php";
include_once plugin_dir_path(__FILE__) . "BaseRoute.php";
include_once plugin_dir_path(__FILE__) . "Utils.php";
include_once plugin_dir_path(__FILE__) . "ErrorsUtils.php";

class RegistrationGroupRoute extends BaseRoute
{

  public function registerRoutes()
  {
    $this->registerRoute();
  }

  public function getPermissionCheckAdmin()
  {
    return $this->isAdmin();
  }

  public function deleteRegistration($request)
  {
    if (!$this->isAdmin()) {
      return new WP_REST_Response("Not Authorized", 403);
    }


    try {
      $parameters = $request->get_params();
      $id = intval($parameters["id"]);
      $event = Persistance::getEventByGroup($id, !$this->isAdmin());
      if (is_null($event)) {
        return new WP_REST_Response("Bad Request", 404);
      }
      $peopleRemoved = $headCount = Persistance::getRegistrationCountForRegistration($id);
      Persistance::deleteRegistration($id);
      Persistance::deleteRegistrationGroup($parameters['id']);
      $event = Persistance::getEvent($event->id, !$this->isAdmin());

      Persistance::updateEventHeadCount($event->id, $event->people - $peopleRemoved);
      return new WP_REST_Response("", 200);
    } catch (Exception $e) {
      ErrorsUtils::log($e->getMessage());
      return new WP_REST_Response("Internal Server Error", 500);
    }
  }

  public function editGroup($request)
  {
    if (!$this->isAdmin()) {
      return new WP_REST_Response("Not Authorized", 403);
    }


    try {
      $parameters = $request->get_params();
      $groupId = intval($parameters["id"]);
      $payload = json_decode($request->get_body());

      if ($payload->action === "paidChange") {
        $newPaidStatus = intval($payload->value) === 1 ? 1 : 0;
        Persistance::changeRegistrationGroupPaid($groupId, $newPaidStatus);

        if ($newPaidStatus === 1) {
          $event = Persistance::getEventByGroup($groupId, !$this->isAdmin());
          $leader = Persistance::getLeader($groupId);
          MailService::sendPaidConfirmation($event, $leader->name, $leader->last_name, $leader->email);
        }

        return new WP_REST_Response("", 200);
      } else {
        return new WP_REST_Response("Bad Request", 404);
      }
    } catch (Exception $e) {
      ErrorsUtils::log($e->getMessage());
      return new WP_REST_Response("Internal Server Error", 500);
    }
  }

  private function registerRoute()
  {
    register_rest_route(
      $this->getNamespace(),
      "/registrationGroup/(?P<id>\d+)",
      array(
        array(
          'methods' => WP_REST_Server::EDITABLE,
          'callback' => array($this, 'editGroup'),
          'permission_callback' => array($this, 'getPermissionCheckAdmin'),
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
      "/registrationGroup/(?P<id>\d+)",
      array(
        array(
          'methods' => WP_REST_Server::DELETABLE,
          'callback' => array($this, 'deleteRegistration'),
          'permission_callback' => array($this, 'getPermissionCheckAdmin'),
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
