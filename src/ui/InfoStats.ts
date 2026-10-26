export class InfoStats {
  private element: HTMLSpanElement;

  constructor(id: string) {
    const element = document.getElementById(id);
    this.element = element as HTMLSpanElement;
  }

  public update(count: number, area: number) {
    this.element.textContent = `Shapes: ${count} Area: ${Math.round(area)}px²`;
  }
}
