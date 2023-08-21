-- CreateTable
CREATE TABLE "Session" (
    "id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "active_expires" INT8 NOT NULL,
    "idle_expires" INT8 NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Key" (
    "id" STRING NOT NULL,
    "hashed_password" STRING,
    "user_id" STRING NOT NULL,

    CONSTRAINT "Key_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" STRING NOT NULL,
    "name" STRING,
    "email" STRING,
    "emailVerified" TIMESTAMP(3),
    "image" STRING,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Osteopath" (
    "id" STRING NOT NULL,
    "batch" STRING NOT NULL,
    "userId" STRING NOT NULL,

    CONSTRAINT "Osteopath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" STRING NOT NULL,
    "label" STRING NOT NULL,
    "description" STRING,
    "place" STRING NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "duration" INT4 NOT NULL,
    "osteopathId" STRING NOT NULL,
    "userId" STRING NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_id_key" ON "Session"("id");

-- CreateIndex
CREATE INDEX "Session_user_id_idx" ON "Session"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Key_id_key" ON "Key"("id");

-- CreateIndex
CREATE INDEX "Key_user_id_idx" ON "Key"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Osteopath_userId_key" ON "Osteopath"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_osteopathId_key" ON "Appointment"("osteopathId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_userId_key" ON "Appointment"("userId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Key" ADD CONSTRAINT "Key_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Osteopath" ADD CONSTRAINT "Osteopath_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_osteopathId_fkey" FOREIGN KEY ("osteopathId") REFERENCES "Osteopath"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
