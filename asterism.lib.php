<?php

/**
 * Get the content from a ContentInput component
 * 
 * If a search is provided, the limit and fixed items will be ignored
 * @param array $attributes The Gutenberg attributes var
 * @param string $var_name The name of the field that holds the ContentInput data
 */
function ast_get_content_input_query($attributes, $var_name = "content")
{
	// Ensure the vars exist; if not, return an empty set to prevent errors.
	if (!isset($attributes[$var_name])) {
		return [];
	}

	// Get attributes
	$search = $attributes[$var_name]["search"] ?? null;
	$post_types = $attributes[$var_name]["postType"] ?? ["page"];
	$order = $attributes[$var_name]["order"] ?? "az";
	$method = $attributes[$var_name]["method"] ?? "inclusive";
	$items = $attributes[$var_name]["isolated"] ?? [];
	$fixed_to_top = $search ? [] : $attributes[$var_name]["fixed"] ?? [];
	$limit = empty($search) ? $attributes[$var_name]["limit"] ?? 20 : 50;
	$limit = $limit == 0 ? 50 : $limit;
	$filters = $attributes[$var_name]["filters"] ?? [];

	// Setup core query args
	$exclude = $method === "exclusive" ? $fixed_to_top : array_merge($fixed_to_top, $items);
	$include = $method === "inclusive" ? array_diff($items, $fixed_to_top) : array_diff($items, $fixed_to_top);

	$include_fixed = $method === "exclusive" ? array_unique(array_merge($items, $fixed_to_top)) : array_diff($fixed_to_top, $items);

	// Generate Filters
	$tax_query = ['relation' => 'OR', 'include_children' => false];
	foreach ($post_types as $post_type) {
		$sub_query = ['relation' => 'AND'];
		foreach ($filters as $filter) {
			array_push(
				$sub_query,
				[
					'taxonomy' => $filter['key'],
					'field' => 'term_id',
					'terms' => $filter['value'],
					'include_children' => true,
				]
			);
		}
		array_push($tax_query, $sub_query);
	}

	$posts_query = new WP_Query();
	$fixed_query = [
		'post_type' => $post_types,
		'post__in' => $include_fixed,
		'orderby' => 'post__in',
	];

	if ($search) {
		$fixed_query['s'] = $search;
	}
	$fixed_posts = count($include_fixed) > 0
		? $posts_query->query($fixed_query)
		: [];

	// Set the limit for remaining items
	$remainingLimit = $limit === 0 ? PHP_INT_MAX : $limit - count($fixed_posts);

	$remaining_posts = [];

	if ($remainingLimit > 0 || $remaining_posts === PHP_INT_MAX) {
		$orderBy = $order === 'random' ? 'rand' : ($order === 'az' || $order === 'za' ? 'title' : 'date');

		$args = array(
			'post_type' => $post_types,
			'posts_per_page' => $remainingLimit < 0 ? -1 : $remainingLimit,
			'orderby' => $orderBy,
			'order' => $order === 'az' ||  $order === 'oldest' ? 'ASC' : 'DESC',
			'tax_query' => $tax_query,
			's' => $search,
		);

		if ($method === "exclusive" && count($include) > 0) {
			$args['post__in'] = $include;
		}

		if (count($exclude) > 0) {
			$args['post__not_in'] = $exclude;
		}

		$remaining_posts = count($include) === 0 && $method === "exclusive" ? [] : $posts_query->query($args);
	}

	$posts = array_merge($fixed_posts, $remaining_posts);
	$posts = $limit === 0 ? $posts : array_slice($posts, 0, $limit);

	$posts = array_map(
		function ($post) {
			if (function_exists('get_fields')) {
				$post->acf = get_fields($post->ID);
			}
			return $post;
		},
		$posts
	);
	
	return $posts;
}

/** Exposes a JSON API endpoint for ContentInput */
add_action('rest_api_init', function () {
	register_rest_route('ast/v1', '/query', array(
		'methods' => WP_REST_Server::READABLE,
		'callback' => function ($request) {
			$post_types = $request["postType"] ?? ["page"];

			// Rest controllers
			$rest_controllers = [];
			foreach ($post_types as $post_type) {
				$rest_controllers[$post_type] = new WP_REST_Posts_Controller($post_type);
			}

			$attributes = ['content' => $request->get_params()];
			$posts = ast_get_content_input_query($attributes);

			// Use Rest Controller to make the response a rest response
			$request = new WP_REST_Request();
			$posts = array_map(
				function ($post) use ($rest_controllers, $request) {
					$controller = $rest_controllers[$post->post_type];
					$result = $controller->prepare_item_for_response($post, $request)->data;

					// Add support for ACF fields
					if (function_exists('get_fields')) {
						$acf = get_fields($post->ID);
						if (isset($post)) {
							$result['acf'] = $acf;
						}
					}
					return $result;
				},
				$posts
			);

			return rest_ensure_response($posts);
		},
	));
});