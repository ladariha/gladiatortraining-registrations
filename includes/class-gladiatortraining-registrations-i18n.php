<?php

/**
 * Define the internationalization functionality
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @link       https://github.com/ladariha
 * @since      1.0.0
 *
 * @package    Gladiatortraining_Registrations
 * @subpackage Gladiatortraining_Registrations/includes
 */

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      1.0.0
 * @package    Gladiatortraining_Registrations
 * @subpackage Gladiatortraining_Registrations/includes
 * @author     Lada Riha <riha.vladimir@gmail.com>
 */
class Gladiatortraining_Registrations_i18n {


	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    1.0.0
	 */
	public function load_plugin_textdomain() {

		load_plugin_textdomain(
			'gladiatortraining-registrations',
			false,
			dirname( dirname( plugin_basename( __FILE__ ) ) ) . '/languages/'
		);

	}



}
