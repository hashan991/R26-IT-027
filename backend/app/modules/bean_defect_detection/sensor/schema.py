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