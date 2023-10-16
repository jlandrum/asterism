<?php get_header(); ?>

<!-- Main Content Area -->
<main>

  <?php if (have_posts()) : ?>

    <?php while (have_posts()) : the_post(); ?>
      <!-- Display post content here -->
      <article>
        <h2><?php the_title(); ?></h2>
        <div><?php the_content(); ?></div>
      </article>
    <?php endwhile; ?>

    <!-- Pagination links -->
    <?php the_posts_pagination(); ?>

  <?php else : ?>
    <p>No posts found.</p>
  <?php endif; ?>

</main>

<?php get_footer(); ?>