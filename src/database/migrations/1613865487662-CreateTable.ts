import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateTable1613865487662 implements MigrationInterface {
    name = 'CreateTable1613865487662'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "User" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(40) NOT NULL, "email" character varying(40) NOT NULL, "profile_image_url" character varying, "password_hash" character varying(100) NOT NULL, CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Step" ("id" SERIAL NOT NULL, "content" character varying NOT NULL, "created_at" date NOT NULL, "recipe" integer, CONSTRAINT "PK_4a9e0127d5947245f1a5112edad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Recipe" ("id" SERIAL NOT NULL, "name" character varying(40) NOT NULL, "recipe_image_url" character varying, "description" character varying(200) NOT NULL, "ingredients" character varying(300) NOT NULL, "preparation_time" integer NOT NULL, "serves" integer NOT NULL, "rating" numeric NOT NULL, "created_at" date NOT NULL, "user_id" uuid, CONSTRAINT "UQ_3fe67de1b57e28c330f2d01a4bd" UNIQUE ("name", "user_id"), CONSTRAINT "PK_9505617a985aaf82e5189cbaa78" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Step" ADD CONSTRAINT "FK_a23daf089de94ff42a3a2eb17f6" FOREIGN KEY ("recipe") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Recipe" ADD CONSTRAINT "FK_d8288e7cca05ed5e1c400f54a95" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Recipe" DROP CONSTRAINT "FK_d8288e7cca05ed5e1c400f54a95"`);
        await queryRunner.query(`ALTER TABLE "Step" DROP CONSTRAINT "FK_a23daf089de94ff42a3a2eb17f6"`);
        await queryRunner.query(`DROP TABLE "Recipe"`);
        await queryRunner.query(`DROP TABLE "Step"`);
        await queryRunner.query(`DROP TABLE "User"`);
    }

}
