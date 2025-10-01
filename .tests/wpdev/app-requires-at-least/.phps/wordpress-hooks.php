<?php

// define hook actions tests. ===========================================
/**
 * @since 2.1.0
 * @since 4.4.0 The `$feed` parameter was added.
 */
do_action( "do_feed_{$feed}", $wp_query->is_comment_feed, $feed );

/**
 * @since 2.1.0
 */
do_action( 'do_robotstxt' );

/**
 * @since MU (3.0.0)
 * @since 5.5.0 Added the `$user` parameter.
 */
do_action( 'wpmu_delete_user', $id, $user );

/**
 * @since 1.5.0
 */
do_action( $page_hook );

/** Just has no document. */
do_action( 'after_mu_upgrade', $response );

if ( is_user_logged_in() ) {
} else {
    /**
     * Some doc block about if but not action hook.
     */
    if ( ! has_action( "wp_ajax_{$action}" ) ) {
		wp_die( '0', 400 );
	}

    /**
     * @since 2.8.0
     */
    do_action( "wp_ajax_nopriv_{$action}" );
}

/**
 * @since 2.6.0
 */
do_action_ref_array( 'wp_default_styles', array( &$this ) );

/** Just has no document. */
do_action_ref_array( 'phpmailer_init', array( &$phpmailer ) );

/**
 * @since 2.1.0
 */
do_action_ref_array( $hook, $v['args'] );

/**
 * @since 1.5.0
 */
do_action_deprecated(
    'wp_blacklist_check',
    array( $author, $email, $url, $comment, $user_ip, $user_agent ),
    '5.5.0',
    'wp_check_comment_disallowed_list',
    __( 'Please consider writing more inclusive code.' )
);

/**
 * @since MU (3.0.0)
 */
do_action_deprecated( 'delete_blog', array( $old_site->id, true ), '5.1.0' );

/**
 * @since 3.0.0
 * @since 3.6.0 The `$value` and `$expiration` parameters were added.
 */
do_action_deprecated( 'setted_transient', array( $transient, $value, $expiration ), '6.8.0', 'set_transient' );

foreach ( $cronhooks as $hook => $keys ) {
    if ( $keys ) {
        /**
         * @since 6.1.0
         */
        do_action( 'cron_reschedule_event_error', $keys, $hook, $v );
    }
}

function do_activate_header() {
	/**
	 * @since 3.0.0
	 */
	do_action( 'activate_wp_head' );
}

class SomeClassAction {
    public function someMethodAction() {
        /**
         * @since 3.4.0
         */
        do_action( 'customize_controls_init' );
    }
}
// define hook actions tests. ===========================================

// define hook filters tests. ===========================================
/**
 * @since 2.0.5
 */
$location = apply_filters( 'comment_post_redirect', $location, $comment );

/**
 * @since MU (3.0.0)
 */
$settings_html = apply_filters( 'myblogs_options', '', 'global' );

/**
 * @since 5.3.1
 */
$remind_interval = (int) apply_filters( 'admin_email_remind_interval', 3 * DAY_IN_SECONDS );

/**
 * @since 2.6.0
 * @since 4.4.0 The `$tag` parameter was added.
 */
$slug = isset( $tag->slug ) ? apply_filters( 'editable_slug', $tag->slug, $tag ) : '';

$themes = array(
    /**
     * @since 3.1.0
     */
    'all'      => apply_filters( 'all_themes', wp_get_themes() ),
);

$settings = [
    /**
     * @since 4.2.0
     */
    'baseUrl' => apply_filters( 'emoji_url', 'https://s.w.org/images/core/emoji/16.0.1/72x72/' ),
];

/**
 * @since 3.2.0
 */
$capability = apply_filters( "option_page_capability_{$option_page}", $capability );

/**
 * @since 0.0.2 Variable in the filter name. (Custom, not anywhere in WordPress.)
 */
$test_filter_var = apply_filters( $filter_use_var, true);

/**
 * @since 5.3.0
 * @since 5.6.0 The returned array of comment data is assigned to the `comments` property
 *              of the current WP_Comment_Query instance.
 */
$comment_data = apply_filters_ref_array( 'comments_pre_query', array( $comment_data, &$this ) );

/**
 * @since 2.1.0
 */
$login_header_title = apply_filters_deprecated(
    'login_headertitle',
    array( $login_header_title ),
    '5.2.0',
    'login_headertext',
    __( 'Usage of the title attribute on the login logo is not recommended for accessibility reasons. Use the link text instead.' )
);

/**
 * @since 3.7.0
 */
$request_order = apply_filters_deprecated( 'http_api_transports', array( $transports, $args, $url ), '6.4.0' );

/**
 * @since 5.7.0
 */
echo apply_filters( 'login_site_html_link', $html_link );

/**
 * @since 5.9.0
 */
wp_dropdown_languages( apply_filters( 'login_language_dropdown_args', $args ) );

/**
 * @since 4.8.0
 */
if ( apply_filters( 'enable_login_autofocus', true ) && ! $error ) {
}

/**
 * @since 3.7.0
 */
if ( 'manual' !== $type && ! apply_filters( 'auto_core_update_send_email', true, $type, $core_update, $result ) ) {
}

/**
 * This function must not contains `@version`.
 */
function get_per_page( $comment_status = 'all' ) {
    $comments_per_page = 20;

    /**
     * @since 2.6.0
     */
    return apply_filters( 'comments_per_page', $comments_per_page, $comment_status );
}

class Bulk_Plugin_Upgrader_Skin {
    public $_actions = '';

    public function bulk_footer() {
        $screenid = '';

        /**
         * @since 3.1.0
         * @since 5.6.0 A bulk action can now contain an array of options in order to create an optgroup.
         */
        $this->_actions = apply_filters( "bulk_actions-{$screenid}", $this->_actions );

        $update_actions = [];
        $plugin_info = [];

        /**
		 * @since 3.0.0
		 */
		$update_actions = apply_filters( 'update_bulk_plugins_complete_actions', $update_actions, $plugin_info );
    }

    public function old_method() {
        $content = '';
        $strings = [];
        $description = false;
        $blocks = false;
        /**
		 * @since 4.9.6
		 * @since 5.0.0 Added the `$strings`, `$description`, and `$blocks` parameters.
		 */
		return apply_filters_deprecated(
			'wp_get_default_privacy_policy_content',
			array( $content, $strings, $description, $blocks ),
			'5.7.0',
			'wp_add_privacy_policy_content()'
		);
    }
}
// define hook filters tests. ===========================================


// prepare things just for prevent errors in the editor. ================
// the functions added here also working for calls WP hooks function qualified name check.
// for example: in file .phpcs/caller/namespace1-unnamespace_hooks.php.
// There is calls `add_action()` inside `namespace MyProject`. 
// This function will be resolved to `add_action()` instead of `MyProject\add_action()` if there is one declared function here.
if (!function_exists('do_action')) {
    function do_action()
    {}
}
if (!function_exists('do_action_ref_array')) {
    function do_action_ref_array()
    {}
}
if (!function_exists('do_action_deprecated')) {
    function do_action_deprecated()
    {}
}
if (!function_exists('apply_filters')) {
    function apply_filters()
    {}
}
if (!function_exists('apply_filters_ref_array')) {
    function apply_filters_ref_array()
    {}
}
if (!function_exists('apply_filters_deprecated')) {
    function apply_filters_deprecated()
    {}
}
if (!function_exists('is_user_logged_in')) {
    function is_user_logged_in()
    {}
}
if (!function_exists('wp_die')) {
    function wp_die()
    {}
}
if (!function_exists('wp_get_themes')) {
    function wp_get_themes()
    {}
}
if (!function_exists('__')) {
    function __()
    {}
}
if (!function_exists('wp_dropdown_languages')) {
    function wp_dropdown_languages()
    {}
}
if (!defined('DAY_IN_SECONDS')) {
    define('DAY_IN_SECONDS', 0);
}

// functions below is for name resolver and use with calls hook functions. (read comment above.) ---------------------
if (!function_exists('has_filter')) {
    function has_filter() {}
}
if (!function_exists('add_filter')) {
    function add_filter() {}
}
if (!function_exists('remove_filter')) {
    function remove_filter() {}
}
if (!function_exists('remove_all_filters')) {
    function remove_all_filters() {}
}
if (!function_exists('doing_filter')) {
    function doing_filter() {}
}
if (!function_exists('did_filter')) {
    function did_filter() {}
}

if (!function_exists('has_action')) {
    function has_action() {}
}
if (!function_exists('add_action')) {
    function add_action() {}
}
if (!function_exists('remove_action')) {
    function remove_action() {}
}
if (!function_exists('remove_all_actions')) {
    function remove_all_actions() {}
}
if (!function_exists('doing_action')) {
    function doing_action() {}
}
if (!function_exists('did_action')) {
    function did_action() {}
}