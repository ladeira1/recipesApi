import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateRecipeTable21613788599846 implements MigrationInterface {
    name = 'UpdateRecipeTable21613788599846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "User" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar(40) NOT NULL, "email" varchar(40) NOT NULL, "profile_image_url" varchar, "password_hash" varchar(100) NOT NULL, CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "Step" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" varchar NOT NULL, "recipe" integer)`);
        await queryRunner.query(`CREATE TABLE "Recipe" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(40) NOT NULL, "recipe_image_url" varchar, "description" varchar(200) NOT NULL, "ingredients" varchar(300) NOT NULL, "preparation_time" integer NOT NULL, "serves" integer NOT NULL, "rating" numeric NOT NULL, "created_at" date NOT NULL, "user_id" varchar, CONSTRAINT "UQ_3fe67de1b57e28c330f2d01a4bd" UNIQUE ("name", "user_id"))`);
        await queryRunner.query(`CREATE TABLE "temporary_Step" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" varchar NOT NULL, "recipe" integer, CONSTRAINT "FK_a23daf089de94ff42a3a2eb17f6" FOREIGN KEY ("recipe") REFERENCES "Recipe" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_Step"("id", "content", "recipe") SELECT "id", "content", "recipe" FROM "Step"`);
        await queryRunner.query(`DROP TABLE "Step"`);
        await queryRunner.query(`ALTER TABLE "temporary_Step" RENAME TO "Step"`);
        await queryRunner.query(`CREATE TABLE "temporary_Recipe" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(40) NOT NULL, "recipe_image_url" varchar, "description" varchar(200) NOT NULL, "ingredients" varchar(300) NOT NULL, "preparation_time" integer NOT NULL, "serves" integer NOT NULL, "rating" numeric NOT NULL, "created_at" date NOT NULL, "user_id" varchar, CONSTRAINT "UQ_3fe67de1b57e28c330f2d01a4bd" UNIQUE ("name", "user_id"), CONSTRAINT "FK_d8288e7cca05ed5e1c400f54a95" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_Recipe"("id", "name", "recipe_image_url", "description", "ingredients", "preparation_time", "serves", "rating", "created_at", "user_id") SELECT "id", "name", "recipe_image_url", "description", "ingredients", "preparation_time", "serves", "rating", "created_at", "user_id" FROM "Recipe"`);
        await queryRunner.query(`DROP TABLE "Recipe"`);
        await queryRunner.query(`ALTER TABLE "temporary_Recipe" RENAME TO "Recipe"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Recipe" RENAME TO "temporary_Recipe"`);
        await queryRunner.query(`CREATE TABLE "Recipe" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(40) NOT NULL, "recipe_image_url" varchar, "description" varchar(200) NOT NULL, "ingredients" varchar(300) NOT NULL, "preparation_time" integer NOT NULL, "serves" integer NOT NULL, "rating" numeric NOT NULL, "created_at" date NOT NULL, "user_id" varchar, CONSTRAINT "UQ_3fe67de1b57e28c330f2d01a4bd" UNIQUE ("name", "user_id"))`);
        await queryRunner.query(`INSERT INTO "Recipe"("id", "name", "recipe_image_url", "description", "ingredients", "preparation_time", "serves", "rating", "created_at", "user_id") SELECT "id", "name", "recipe_image_url", "description", "ingredients", "preparation_time", "serves", "rating", "created_at", "user_id" FROM "temporary_Recipe"`);
        await queryRunner.query(`DROP TABLE "temporary_Recipe"`);
        await queryRunner.query(`ALTER TABLE "Step" RENAME TO "temporary_Step"`);
        await queryRunner.query(`CREATE TABLE "Step" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" varchar NOT NULL, "recipe" integer)`);
        await queryRunner.query(`INSERT INTO "Step"("id", "content", "recipe") SELECT "id", "content", "recipe" FROM "temporary_Step"`);
        await queryRunner.query(`DROP TABLE "temporary_Step"`);
        await queryRunner.query(`DROP TABLE "Recipe"`);
        await queryRunner.query(`DROP TABLE "Step"`);
        await queryRunner.query(`DROP TABLE "User"`);
    }

}
