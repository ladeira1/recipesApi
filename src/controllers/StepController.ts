import { getRepository } from 'typeorm';

import Recipe from '../entities/Recipe';
import Step from '../entities/Step';
import StepsView from '../views/StepsView';

type StepsResponse = { id: number; content: string }[] | { error: string };

export default class StepController {
  static async createSteps(
    steps: string[],
    recipe: Recipe,
  ): Promise<StepsResponse> {
    try {
      const stepsRepository = getRepository(Step);
      const createdSteps = await Promise.all(
        steps.map(async step => {
          const createdStep = stepsRepository.create({
            content: step,
            recipe,
          });

          await stepsRepository.save(createdStep);
          return createdStep;
        }),
      );

      return StepsView.renderMany(createdSteps);
    } catch (err) {
      return { error: err.message };
    }
  }
}
