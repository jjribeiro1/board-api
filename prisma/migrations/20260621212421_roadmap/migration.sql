-- CreateTable
CREATE TABLE "roadmap" (
    "id" UUID NOT NULL,
    "name" VARCHAR(140) NOT NULL,
    "description" TEXT,
    "slug" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "organization_id" UUID NOT NULL,

    CONSTRAINT "roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_column" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "color" VARCHAR(50) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "roadmap_id" UUID NOT NULL,

    CONSTRAINT "roadmap_column_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_item" (
    "id" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "column_id" UUID NOT NULL,
    "post_id" UUID NOT NULL,

    CONSTRAINT "roadmap_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_slug_key" ON "roadmap"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_organization_id_slug_key" ON "roadmap"("organization_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_column_roadmap_id_name_key" ON "roadmap_column"("roadmap_id", "name");

-- CreateIndex
CREATE INDEX "roadmap_item_column_id_idx" ON "roadmap_item"("column_id");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_item_post_id_key" ON "roadmap_item"("post_id");

-- AddForeignKey
ALTER TABLE "roadmap" ADD CONSTRAINT "roadmap_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_column" ADD CONSTRAINT "roadmap_column_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_item" ADD CONSTRAINT "roadmap_item_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "roadmap_column"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_item" ADD CONSTRAINT "roadmap_item_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
