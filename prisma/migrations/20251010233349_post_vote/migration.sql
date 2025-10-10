-- CreateTable
CREATE TABLE "post_vote" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_vote_pkey" PRIMARY KEY ("id")
);


-- CreateIndex
CREATE INDEX "post_vote_post_id_idx" ON "post_vote"("post_id");

-- CreateIndex
CREATE INDEX "post_vote_user_id_idx" ON "post_vote"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_vote_user_id_post_id_key" ON "post_vote"("user_id", "post_id");

-- AddForeignKey
ALTER TABLE "post_vote" ADD CONSTRAINT "post_vote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_vote" ADD CONSTRAINT "post_vote_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

