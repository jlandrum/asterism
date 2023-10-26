

export function generateDestyles(styles: string[]): string {
	return "add_action('wp_enqueue_scripts', function () {\n" +
		styles.map((s) => "  wp_deregister_style('" + s + "');").join('\n') +
	"\n}, 9999);";
}