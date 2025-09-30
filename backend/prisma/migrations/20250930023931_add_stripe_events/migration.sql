-- CreateTable
CREATE TABLE "public"."stripe_events" (
    "id" SERIAL NOT NULL,
    "event_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stripe_events_event_id_key" ON "public"."stripe_events"("event_id");
