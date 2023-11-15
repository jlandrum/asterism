<?php

/**
 * Get the content from a ContentInput component
 * @param array $attributes The Gutenberg attributes var
 * @param string $var_name The name of the field that holds the ContentInput data
 */
function ast_get_content_input_query($attributes, $var_name)
{
	/* TODO: The plan is to eventually allow querying multiple content types,
			     as well as adding conditions. For now, we only support querying
					 a single content type; this does meak this method is more complex
					 than it needs to be - but that will be addressed in the future. 
	*/

	// Ensure the vars exist; if not, return an empty set to prevent errors.
	if (!isset($attributes[$var_name]) || count($attributes[$var_name]) === 0) {
		return [];
	}

	// Get attributes
	$post_type = $attributes[$var_name]["postType"] ?? "pages";
	$order = $attributes[$var_name]["order"] ?? "az";
	$method = $attributes[$var_name]["method"] ?? "inclusive";
	$items = $attributes[$var_name]["isolated"] ?? [];
	$fixed_to_top = $attributes[$var_name]["fixed"] ?? [];
	$limit = $attributes[$var_name]["limit"] ?? 0;
	$filters = $attributes[$var_name]["filters"] ?? [];

	// Setup core query args
	$exclude = $method === "exclusive" ? $fixed_to_top : array_merge($fixed_to_top, $items);
	$include = $method === "inclusive" ? array_diff($items, $fixed_to_top) : array_diff($items, $fixed_to_top);

	$include_fixed = $method === "exclusive" ? array_intersect($items, $fixed_to_top) : array_diff($fixed_to_top, $items);

	// Apply filters
	$tax_query = [];
	foreach ($filters as $filter) {
		array_push(
			$tax_query,
			array(
				'taxonomy' => $filter['key'],
				'field' => 'term_id',
				'terms' => $filter['value'],
			)
		);
	}

	// Get fixed items
	$fixed_posts = count($include_fixed) === 0 ? [] : get_posts(
		[
			'post_type' => $post_type,
			'post__in' => $include_fixed,
			'order' => 'ASC',
			'tax_query' => $tax_query,
		]
	);

	// Set the limit for remaining items
	$remainingLimit = $limit === 0 ? PHP_INT_MAX : $limit - count($fixed_posts);

	$remaining_posts = [];

	if ($remainingLimit > 0 || $remaining_posts === PHP_INT_MAX) {
		$orderBy = $order === 'random' ? 'rand' : ($order === 'az' || 'za' ? 'title' : 'date'
		);

		$args = array(
			'post_type' => $post_type,
			'posts_per_page' => $remainingLimit < 0 ? -1 : $remainingLimit,
			'orderby' => $orderBy,
			'order' => $order === 'az' || 'oldest' ? 'ASC' : 'DESC',
			'tax_query' => $tax_query,
		);

		if ($method === "exclusive" && count($include) > 0) {
			$args['post__in'] = $include;
		}
		if (count($exclude) > 0) {
			$args['post__not_in'] = $exclude;
		}

		$remaining_posts = count($include) === 0 && $method === "exclusive" ? [] : get_posts($args);
	}

	$posts = array_merge($fixed_posts, $remaining_posts);
	return $limit === 0 ? $posts : array_slice($posts, 0, $limit);
}