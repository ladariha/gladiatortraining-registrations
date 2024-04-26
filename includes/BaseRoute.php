<?php
include_once plugin_dir_path(__FILE__) . "Persistance.php";
include_once plugin_dir_path(__FILE__) . "BaseRoute.php";

class BaseRoute extends WP_REST_Controller
{
  public function isAdmin()
  {
    // https://stackoverflow.com/questions/42381521/how-to-get-current-logged-in-user-using-wordpress-rest-api
    $isAdmin = false;

    if (current_user_can("manage_options")) {
      $isAdmin = true;
    }

    return $isAdmin;
  }


  public function getNamespace()
  {
    $version = '1';
    $namespace = 'gtevents/v' . $version;
    return $namespace;
  }
}
