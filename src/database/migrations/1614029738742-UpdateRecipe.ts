import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateRecipe1614029738742 implements MigrationInterface {
    name = 'UpdateRecipe1614029738742'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "UserRating" ("id" SERIAL NOT NULL, "rating" numeric NOT NULL, "user_id" uuid, "recipe_id" integer, CONSTRAINT "UQ_2cd5cb55addeb444099e35b35c9" UNIQUE ("user_id", "recipe_id"), CONSTRAINT "PK_06d16da2b094ec0b5e30b7ea3b2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "User" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(40) NOT NULL, "email" character varying(40) NOT NULL, "profile_image_url" character varying, "password_hash" character varying(100) NOT NULL, CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Recipe" ("id" SERIAL NOT NULL, "name" character varying(40) NOT NULL, "recipe_image_url" character varying, "description" character varying(200) NOT NULL, "ingredients" character varying(400) NOT NULL, "steps" character varying NOT NULL, "preparation_time" integer NOT NULL, "serves" integer NOT NULL, "rating" numeric NOT NULL, "created_at" date NOT NULL, "user_id" uuid, CONSTRAINT "UQ_3fe67de1b57e28c330f2d01a4bd" UNIQUE ("name", "user_id"), CONSTRAINT "PK_9505617a985aaf82e5189cbaa78" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "UserRating" ADD CONSTRAINT "FK_e3faeee4183727947893d07d8ab" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "UserRating" ADD CONSTRAINT "FK_80809620fa48b0356bf04500195" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Recipe" ADD CONSTRAINT "FK_d8288e7cca05ed5e1c400f54a95" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Recipe" DROP CONSTRAINT "FK_d8288e7cca05ed5e1c400f54a95"`);
        await queryRunner.query(`ALTER TABLE "UserRating" DROP CONSTRAINT "FK_80809620fa48b0356bf04500195"`);
        await queryRunner.query(`ALTER TABLE "UserRating" DROP CONSTRAINT "FK_e3faeee4183727947893d07d8ab"`);
        await queryRunner.query(`DROP TABLE "Recipe"`);
        await queryRunner.query(`DROP TABLE "User"`);
        await queryRunner.query(`DROP TABLE "UserRating"`);
    }

}
