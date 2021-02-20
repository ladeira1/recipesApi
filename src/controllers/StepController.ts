import { EntityManager, getRepository } from 'typeorm';

import Recipe from '../entities/Recipe';
import Step from '../entities/Step';
import StepsView from '../views/StepsView';

type StepsResponse = { id: number; content: string }[] | { error: string };

export default class StepController {
  static async createSteps(
    steps: string[],
    recipe: Recipe,
    entityManager: EntityManager,
  ): Promise<StepsResponse> {
    try {
      const createdSteps = await Promise.all(
        steps.map(async step => {
          const createdStep = entityManager.create(Step, {
            content: step,
            recipe,
          });

          await entityManager.save(createdStep);
          return createdStep;
        }),
      );

      return StepsView.renderMany(createdSteps);
    } catch (err) {
      return { error: err.message };
    }
  }

  static async getSteps(recipe: Recipe): Promise<StepsResponse> {
    try {
      const stepsRepository = getRepository(Step);
      const steps = await stepsRepository.find({ where: { recipe } });

      return StepsView.renderMany(steps);
    } catch (err) {
      return { error: err.message };
    }
  }
}
