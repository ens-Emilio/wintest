export enum LocatorStrategy { AutomationId = "AutomationId", Name = "Name", ClassName = "ClassName", XPath = "XPath", Image = "Image" }

export class Locator {
  constructor(
    public readonly strategy: LocatorStrategy,
    public readonly value: string,
    public readonly extra?: string,
    public readonly threshold = 0.95,
  ) {}

  static byAutomationId(id: string): Locator { return new Locator(LocatorStrategy.AutomationId, id); }
  static byName(name: string): Locator { return new Locator(LocatorStrategy.Name, name); }
  static byClassName(className: string, controlType?: string): Locator { return new Locator(LocatorStrategy.ClassName, className, controlType); }
  static byXPath(xpath: string): Locator { return new Locator(LocatorStrategy.XPath, xpath); }
  static byImage(imagePath: string, threshold = 0.95): Locator { return new Locator(LocatorStrategy.Image, imagePath, undefined, threshold); }

  toString(): string {
    if (this.extra) return `${this.strategy}='${this.value}' Extra='${this.extra}'`;
    return `${this.strategy}='${this.value}'`;
  }
}
