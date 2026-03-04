CREATE TABLE "blog_post_views" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "blog_post_views_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "blog_post_views" ADD CONSTRAINT "blog_post_views_postId_ip_key" UNIQUE ("postId", "ip");
ALTER TABLE "blog_post_views" ADD CONSTRAINT "blog_post_views_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
