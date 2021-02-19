/* eslint-disable class-methods-use-this */
import { MigrationInterface, QueryRunner } from 'typeorm';

// eslint-disable-next-line import/prefer-default-export
export class CreateRecipeTable1613772178595 implements MigrationInterface {
  name = 'CreateRecipeTable1613772178595';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Recipe" ("id" SERIAL NOT NULL, "user_id" character varying NOT NULL, "name" character varying(40) NOT NULL, "recipe_image_url" character varying, "description" character varying(200) NOT NULL, "ingredients" character varying(300) NOT NULL, "preparation_time" integer NOT NULL, "serves" integer NOT NULL, "rating" numeric NOT NULL, "created_at" date NOT NULL, "userId" uuid, CONSTRAINT "PK_9505617a985aaf82e5189cbaa78" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "Recipe" ADD CONSTRAINT "FK_a7657e73c65475630f10a8eefb9" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Recipe" DROP CONSTRAINT "FK_a7657e73c65475630f10a8eefb9"`,
    );
    await queryRunner.query(`DROP TABLE "Recipe"`);
  }
}
