<?php
// FOLLOWING LINE MUST BE 3rd LINE OF FILE FOR BUILD.SH !!!
$PLUGIN_VERSION = "1.0.90";
/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://github.com/ladariha/gladiatortraining-registrations
 * @since             1.0.0
 * @package           Gladiatortraining_Registrations
 *
 * @wordpress-plugin
 * Plugin Name:       gladiatortraining-registrations
 * Plugin URI:        https://github.com/ladariha/gladiatortraining-registrations
 * Description:       Registrace na události Gladiator Training.
 * Version:           1.0.90
 * Author:            Lada Riha
 * Author URI:        https://github.com/ladariha/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       gladiatortraining-registrations
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
	die;
}

$fonts = array();

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */

define('GLADIATORTRAINING_REGISTRATIONS_VERSION', $PLUGIN_VERSION);

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-gladiatortraining-registrations-activator.php
 */
function activate_gladiatortraining_registrations()
{
	require_once plugin_dir_path(__FILE__) . 'includes/class-gladiatortraining-registrations-activator.php';
	Gladiatortraining_Registrations_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-gladiatortraining-registrations-deactivator.php
 */
function deactivate_gladiatortraining_registrations()
{
	require_once plugin_dir_path(__FILE__) . 'includes/class-gladiatortraining-registrations-deactivator.php';
	Gladiatortraining_Registrations_Deactivator::deactivate();
}

function activate_gladiatortraining_rest()
{
	require_once plugin_dir_path(__FILE__) . 'includes/UserRoute.php';
	require_once plugin_dir_path(__FILE__) . 'includes/EventsRoute.php';
	require_once plugin_dir_path(__FILE__) . 'includes/EventRoute.php';
	require_once plugin_dir_path(__FILE__) . 'includes/RegistrationsRoute.php';
	require_once plugin_dir_path(__FILE__) . 'includes/RegistrationGroupRoute.php';
	require_once plugin_dir_path(__FILE__) . 'includes/ErrorsRoute.php';
	require_once plugin_dir_path(__FILE__) . 'includes/ApiKeysRoute.php';

	(new UserRoute())->registerRoutes();
	(new EventsRoute())->registerRoutes();
	(new EventRoute())->registerRoutes();
	(new RegistrationsRoute())->registerRoutes();
	(new RegistrationGroupRoute())->registerRoutes();
	(new ErrorsRoute())->registerRoutes();
	(new ApiKeysRoute())->registerRoutes();

}


function frontend_init()
{

	global $fonts;
	global $PLUGIN_VERSION;

	$path = "/frontend/build/static";
	wp_register_script(
		"gladiatortraining_registrations_app_js",
		plugins_url($path . "/js/main.js", __FILE__),
		array(),
		"1.3",
		array(
			'in_footer' => true,
		)
	);
	wp_register_style("gladiatortraining_registrations_app_css", plugins_url($path . "/css/main.css", __FILE__), array(), $PLUGIN_VERSION, "all");

	// fonts
	$index = 0;
	foreach (array_filter(glob(__DIR__ . $path . "/media/*.*"), 'is_file') as $file) {
		$fonts[] = $file;
		$index += 1;
		$filename = pathinfo($file);
		wp_register_style("gladiatortraining_registrations_app_font_" . $index, plugins_url($path . "/media/" . $filename["basename"], __FILE__), array(), $PLUGIN_VERSION, "all");

	}
}

function gladiatortraining_registrations_app()
{

	global $fonts;
	global $PLUGIN_VERSION;

	wp_enqueue_script("gladiatortraining_registrations_app_js", $PLUGIN_VERSION, true);
	wp_localize_script(
		'gladiatortraining_registrations_app_js',
		'GladiatortrainingRegistrations',
		array(
			'nonce' => wp_create_nonce("wp_rest"),
			'baseUrl' => home_url(),
		)
	);
	wp_enqueue_style("gladiatortraining_registrations_app_css");
	// fonts
	$index = 0;
	foreach ($fonts as $font) {
		$index += 1;
		wp_enqueue_style("gladiatortraining_registrations_app_font_" . $index);

	}

	return "<div id=\"gladiatortraining_registrations_app\"></div>";
}


register_activation_hook(__FILE__, 'activate_gladiatortraining_registrations');
register_deactivation_hook(__FILE__, 'deactivate_gladiatortraining_registrations');
add_action('rest_api_init', 'activate_gladiatortraining_rest');
add_action('init', 'frontend_init');
add_shortcode('gladiatortraining_registrations_app', 'gladiatortraining_registrations_app');


/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path(__FILE__) . 'includes/class-gladiatortraining-registrations.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_gladiatortraining_registrations()
{

	$plugin = new Gladiatortraining_Registrations();
	$plugin->run();

}
run_gladiatortraining_registrations();
