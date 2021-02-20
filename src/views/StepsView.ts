import Step from '../entities/Step';

interface StepResponse {
  id: number;
  content: string;
}

export default class StepView {
  static render(step: Step): StepResponse {
    return {
      id: step.id,
      content: step.content,
    };
  }

  static renderMany(steps: Step[]): StepResponse[] {
    return steps.map(step => this.render(step));
  }
}
