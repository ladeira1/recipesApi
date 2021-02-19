/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecipeTable1613693457098 implements MigrationInterface {
  name = 'CreateRecipeTable1613693457098';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Recipe" ("id" SERIAL NOT NULL, "name" character varying(40) NOT NULL, "recipe_image_url" character varying, "description" character varying(200) NOT NULL, "ingredients" character varying(300) NOT NULL, "preparation_time" integer NOT NULL, "serves" integer NOT NULL, "rating" numeric NOT NULL, "created_at" date NOT NULL, "userId" uuid, CONSTRAINT "PK_9505617a985aaf82e5189cbaa78" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" DROP COLUMN "profile_image_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ADD "profile_image_url" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "Recipe" ADD CONSTRAINT "FK_a7657e73c65475630f10a8eefb9" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Recipe" DROP CONSTRAINT "FK_a7657e73c65475630f10a8eefb9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" DROP COLUMN "profile_image_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ADD "profile_image_url" character varying(200)`,
    );
    await queryRunner.query(`DROP TABLE "Recipe"`);
  }
}
