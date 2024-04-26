<?php

include_once plugin_dir_path(__FILE__) . "Persistance.php";

class ErrorsUtils
{

  public static function log($msg)
  {
    Persistance::logError($msg);
  }

}
