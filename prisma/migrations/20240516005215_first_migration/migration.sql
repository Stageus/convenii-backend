-- CreateTable
CREATE TABLE "account" (
    "idx" SERIAL NOT NULL,
    "password" VARCHAR NOT NULL,
    "deleted_at" TIMESTAMP(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" VARCHAR NOT NULL,
    "nickname" VARCHAR NOT NULL,
    "rank_idx" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "account_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "bookmark" (
    "idx" SERIAL NOT NULL,
    "account_idx" SERIAL NOT NULL,
    "product_idx" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmark_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "category" (
    "idx" SERIAL NOT NULL,
    "name" VARCHAR,

    CONSTRAINT "category_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "company" (
    "idx" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "event" (
    "idx" SERIAL NOT NULL,
    "type" VARCHAR NOT NULL,
    "priority" INTEGER NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "event_history" (
    "idx" SERIAL NOT NULL,
    "company_idx" SERIAL NOT NULL,
    "product_idx" SERIAL NOT NULL,
    "event_idx" SERIAL NOT NULL,
    "start_date" DATE NOT NULL,
    "price" VARCHAR,

    CONSTRAINT "event_history_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "product" (
    "idx" SERIAL NOT NULL,
    "category_idx" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "price" VARCHAR NOT NULL,
    "image_url" VARCHAR NOT NULL,
    "deleted_at" TIMESTAMP(6),
    "score" DECIMAL(3,2),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "rank" (
    "idx" SERIAL NOT NULL,
    "type" VARCHAR NOT NULL,

    CONSTRAINT "rank_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "review" (
    "idx" SERIAL NOT NULL,
    "product_idx" SERIAL NOT NULL,
    "account_idx" SERIAL NOT NULL,
    "content" TEXT,
    "score" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_pkey" PRIMARY KEY ("idx")
);

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "fk_rank_to_account" FOREIGN KEY ("rank_idx") REFERENCES "rank"("idx") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookmark" ADD CONSTRAINT "fk_account_to_bookmark" FOREIGN KEY ("account_idx") REFERENCES "account"("idx") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookmark" ADD CONSTRAINT "fk_product_to_bookmark" FOREIGN KEY ("product_idx") REFERENCES "product"("idx") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event_history" ADD CONSTRAINT "fk_company_to_event_history" FOREIGN KEY ("company_idx") REFERENCES "company"("idx") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event_history" ADD CONSTRAINT "fk_event_to_event_history" FOREIGN KEY ("event_idx") REFERENCES "event"("idx") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event_history" ADD CONSTRAINT "fk_product_to_event_history" FOREIGN KEY ("product_idx") REFERENCES "product"("idx") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "fk_category_to_product" FOREIGN KEY ("category_idx") REFERENCES "category"("idx") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "fk_account_to_review" FOREIGN KEY ("account_idx") REFERENCES "account"("idx") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "fk_product_to_review" FOREIGN KEY ("product_idx") REFERENCES "product"("idx") ON DELETE NO ACTION ON UPDATE NO ACTION;
