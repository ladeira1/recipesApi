import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateCategory1615603210867 implements MigrationInterface {
    name = 'CreateCategory1615603210867'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "UserRating" ("id" SERIAL NOT NULL, "rating" numeric NOT NULL, "user_id" uuid, "recipe_id" integer, CONSTRAINT "UQ_2cd5cb55addeb444099e35b35c9" UNIQUE ("user_id", "recipe_id"), CONSTRAINT "PK_06d16da2b094ec0b5e30b7ea3b2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "review" ("id" SERIAL NOT NULL, "content" character varying NOT NULL, "created_at" date NOT NULL, "user_id" uuid, "recipe_id" integer, CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "User" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(40) NOT NULL, "email" character varying(40) NOT NULL, "profile_image_url" character varying, "password_hash" character varying(100) NOT NULL, "is_admin" boolean NOT NULL, CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "favorite" ("id" SERIAL NOT NULL, "created_at" date NOT NULL, "userId" uuid, "recipeId" integer, CONSTRAINT "PK_495675cec4fb09666704e4f610f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Recipe" ("id" SERIAL NOT NULL, "name" character varying(40) NOT NULL, "recipe_image_url" character varying, "description" character varying(200) NOT NULL, "ingredients" character varying(400) NOT NULL, "steps" character varying NOT NULL, "preparation_time" integer NOT NULL, "serves" integer NOT NULL, "rating" numeric NOT NULL, "created_at" date NOT NULL, "user_id" uuid, "categoryId" integer, CONSTRAINT "UQ_3fe67de1b57e28c330f2d01a4bd" UNIQUE ("name", "user_id"), CONSTRAINT "PK_9505617a985aaf82e5189cbaa78" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Category" ("id" SERIAL NOT NULL, "image_url" character varying NOT NULL, CONSTRAINT "PK_c2727780c5b9b0c564c29a4977c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "UserRating" ADD CONSTRAINT "FK_e3faeee4183727947893d07d8ab" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "UserRating" ADD CONSTRAINT "FK_80809620fa48b0356bf04500195" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_81446f2ee100305f42645d4d6c2" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_18ae36b989f9f259d4e3d34f1ca" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorite" ADD CONSTRAINT "FK_83b775fdebbe24c29b2b5831f2d" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorite" ADD CONSTRAINT "FK_dc4e12820d766dc3f5be3a5c34f" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Recipe" ADD CONSTRAINT "FK_d8288e7cca05ed5e1c400f54a95" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Recipe" ADD CONSTRAINT "FK_111f20ebadc999600cac3476756" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Recipe" DROP CONSTRAINT "FK_111f20ebadc999600cac3476756"`);
        await queryRunner.query(`ALTER TABLE "Recipe" DROP CONSTRAINT "FK_d8288e7cca05ed5e1c400f54a95"`);
        await queryRunner.query(`ALTER TABLE "favorite" DROP CONSTRAINT "FK_dc4e12820d766dc3f5be3a5c34f"`);
        await queryRunner.query(`ALTER TABLE "favorite" DROP CONSTRAINT "FK_83b775fdebbe24c29b2b5831f2d"`);
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_18ae36b989f9f259d4e3d34f1ca"`);
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_81446f2ee100305f42645d4d6c2"`);
        await queryRunner.query(`ALTER TABLE "UserRating" DROP CONSTRAINT "FK_80809620fa48b0356bf04500195"`);
        await queryRunner.query(`ALTER TABLE "UserRating" DROP CONSTRAINT "FK_e3faeee4183727947893d07d8ab"`);
        await queryRunner.query(`DROP TABLE "Category"`);
        await queryRunner.query(`DROP TABLE "Recipe"`);
        await queryRunner.query(`DROP TABLE "favorite"`);
        await queryRunner.query(`DROP TABLE "User"`);
        await queryRunner.query(`DROP TABLE "review"`);
        await queryRunner.query(`DROP TABLE "UserRating"`);
    }

}
