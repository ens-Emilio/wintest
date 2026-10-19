from __future__ import annotations
from enum import Enum

class LocatorStrategy(str, Enum):
    automation_id = "AutomationId"
    name = "Name"
    class_name = "ClassName"
    xpath = "XPath"
    image = "Image"

class Locator:
    def __init__(self, strategy: LocatorStrategy, value: str, extra: str | None = None, threshold: float = 0.95):
        self.strategy = strategy
        self.value = value
        self.extra = extra
        self.threshold = threshold

    @classmethod
    def by_automation_id(cls, id: str) -> "Locator": return cls(LocatorStrategy.automation_id, id)
    @classmethod
    def by_name(cls, name: str) -> "Locator": return cls(LocatorStrategy.name, name)
    @classmethod
    def by_class_name(cls, class_name: str, control_type: str | None = None) -> "Locator": return cls(LocatorStrategy.class_name, class_name, control_type)
    @classmethod
    def by_xpath(cls, xpath: str) -> "Locator": return cls(LocatorStrategy.xpath, xpath)
    @classmethod
    def by_image(cls, image_path: str, threshold: float = 0.95) -> "Locator": return cls(LocatorStrategy.image, image_path, threshold=threshold)

    def __repr__(self) -> str:
        if self.extra: return f"{self.strategy.value}='{self.value}' Extra='{self.extra}'"
        return f"{self.strategy.value}='{self.value}'"
    __str__ = __repr__
