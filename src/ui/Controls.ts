export type ControlOptions = {
  initial: number;
  min: number;
  max: number;
  step: number;
};

export class Controls {
  private options: ControlOptions;
  private onChange: (value: number) => void;
  private decreaseBtn: HTMLButtonElement;
  private increaseBtn: HTMLButtonElement;
  private valueLabel: HTMLSpanElement;
  private value: number;

  constructor(
    id: string,
    options: ControlOptions,
    onChange: (value: number) => void,
  ) {
    this.options = options;
    this.onChange = onChange;
    this.decreaseBtn = document.getElementById(
      `${id}-decrease`,
    ) as HTMLButtonElement;
    this.increaseBtn = document.getElementById(
      `${id}-increase`,
    ) as HTMLButtonElement;
    this.valueLabel = document.getElementById(`${id}-value`) as HTMLSpanElement;
    this.value = options.initial;

    this.decreaseBtn.addEventListener("click", () =>
      this.setValue(this.value - this.options.step),
    );
    this.increaseBtn.addEventListener("click", () =>
      this.setValue(this.value + this.options.step),
    );

    this.render();
  }

  private setValue(next: number) {
    this.value = Math.min(this.options.max, Math.max(this.options.min, next));
    this.render();
  }

  private render() {
    this.valueLabel.textContent = String(this.value);
    this.decreaseBtn.disabled = this.value <= this.options.min;
    this.increaseBtn.disabled = this.value >= this.options.max;
    this.onChange(this.value);
  }
}
