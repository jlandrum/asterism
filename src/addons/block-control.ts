export function generateOmitBlocks(blocks: string[]) {
	return `
add_filter('allowed_block_types_all', function($allowed_blocks, $post) {
	$allowed_blocks = WP_Block_Type_Registry::get_instance()->get_all_registered();
	$allowed_blocks = array_keys($allowed_blocks);
	$exclude_blocks = ["${blocks.join('","')}"];
	$allowed_blocks = array_diff($allowed_blocks, $exclude_blocks);
	return array_values($allowed_blocks);
}, 10, 2);
`;
}

export function generateAllowBlocks(blocks: string[]) {
	return `
add_filter('allowed_block_types_all', function() {
	return ["${blocks.join('","')}"];
}, 10, 2);
`;
}

export function blockGutenbergOnClient() {
	return `
add_action( 'wp_enqueue_scripts', function (){
  wp_dequeue_style( 'wp-block-library' );
  wp_dequeue_style( 'wp-block-library-theme' );
  wp_dequeue_style( 'wc-blocks-style' );
}, 100 );
`;
}