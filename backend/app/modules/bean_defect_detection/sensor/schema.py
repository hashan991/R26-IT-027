from typing import Optional

from pydantic import BaseModel


class SensorReading(BaseModel):
    mq2: int
    mq135: int
    mq3: int
    moisture: int
    temperature: Optional[float] = None
    humidity: Optional[float] = None


class SensorDeviceStatus(BaseModel):
    connected: bool
    port: str
    baud_rate: int
    device: str
    weight_zeroed: Optional[bool] = False


class WeightReading(BaseModel):
    connected: bool
    load_cell_ready: Optional[bool] = None
    zeroed: bool = False

    current_raw: Optional[int] = None
    tray_raw: Optional[int] = None
    raw_difference: Optional[int] = None

    weight_grams: Optional[float] = None
    raw_per_gram: Optional[float] = None

    unit: str = "g"
    message: Optional[str] = None