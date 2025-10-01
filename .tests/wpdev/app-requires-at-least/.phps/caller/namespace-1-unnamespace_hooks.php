<?php
/**
 * Declaring multiple namespaces and unnamespaced code
 * 
 * @link https://www.php.net/manual/en/language.namespaces.definitionmultiple.php Namespace refrence
 * @link https://learn.wordpress.org/lesson/working-with-hooks/ Working with WordPress hooks
 * @link https://developer.wordpress.org/plugins/hooks/ WordPress hooks reference
 * @link https://kinsta.com/blog/wordpress-hooks/ Functions that used
 */


namespace {
    if (has_action('registered_post_type')) {
        add_action('registered_post_type');
    }
    if (has_filter('body_class')) {
        add_filter('body_class');
    }

    // the hooks below have version info in ../wordpress-hooks.php file.
    add_action('do_robotstxt');
    add_action('do_feed_post');// expect hook action `do_feed_{$feed}`
    remove_action('after_mu_upgrade');
    remove_all_actions('phpmailer_init');
    doing_action('wp_blacklist_check');
    did_action('delete_blog');

    add_filter('comment_post_redirect');
    remove_filter('admin_email_remind_interval');
}


namespace MyProject {
    if (has_action('setup_theme')) {
        add_action('setup_theme');
    }
    if (has_filter('attachment_fields_to_edit')) {
        add_filter('attachment_fields_to_edit');
    }

    // the hooks below have version info in ../wordpress-hooks.php file.
    add_action('wpmu_delete_user');
    remove_action('wp_default_styles');

    add_filter('myblogs_options');
    add_filter('option_page_capability_settings');// expect hook filter `option_page_capability_{$option_page}`
    remove_filter('editable_slug');
    remove_all_filters('all_themes');
    doing_filter('emoji_url');
    did_filter('comments_pre_query');
}