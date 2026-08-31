from typing import Dict, List

from pydantic import BaseModel, Field


# =========================================================
# SENSOR DEFECT FLAGS
# =========================================================

class SensorDefectFlags(BaseModel):
    mq2_abnormal: bool = False
    mq3_abnormal: bool = False
    mq135_abnormal: bool = False
    moisture_defect: bool = False
    temperature_abnormal: bool = False
    humidity_abnormal: bool = False


# =========================================================
# INSPECTION COMPLETENESS
# =========================================================

class InspectionCompleteness(BaseModel):
    sensor_complete: bool = True
    physical_complete: bool = True


# =========================================================
# PHYSICAL DEFECT COUNTS
# Modules 1,2,3,4,6,7
# =========================================================

class RecommendationPhysicalDefects(BaseModel):
    broken: int = Field(default=0, ge=0)
    black: int = Field(default=0, ge=0)


# =========================================================
# MODULE 5 - USABLE YIELD COUNTS
# =========================================================

class YieldPhysicalCounts(BaseModel):
    good: int = Field(default=0, ge=0)
    broken: int = Field(default=0, ge=0)
    black: int = Field(default=0, ge=0)
    black_and_broken: int = Field(default=0, ge=0)
    total_beans: int = Field(default=0, ge=0)


# =========================================================
# NORMALIZED DEFECT PROFILE
# =========================================================

class DefectProfile(BaseModel):
    sensor: SensorDefectFlags

    inspection: InspectionCompleteness

    # Modules 1,2,3,4,6,7
    physical: RecommendationPhysicalDefects

    # Module 5
    yield_counts: YieldPhysicalCounts

    active_defects: List[str] = Field(default_factory=list)

    active_defect_count: int = 0


# =========================================================
# BUILD DEFECT PROFILE
# =========================================================

def build_defect_profile(
    *,
    sensor_defects: Dict[str, bool],
    counts: Dict[str, int],
    sensor_complete: bool = True,
    physical_complete: bool = True,
) -> DefectProfile:

    # =====================================================
    # SENSOR FLAGS
    # =====================================================

    sensor = SensorDefectFlags(
        mq2_abnormal=bool(
            sensor_defects.get("mq2_abnormal", False)
        ),
        mq3_abnormal=bool(
            sensor_defects.get("mq3_abnormal", False)
        ),
        mq135_abnormal=bool(
            sensor_defects.get("mq135_abnormal", False)
        ),
        moisture_defect=bool(
            sensor_defects.get("moisture_defect", False)
        ),
        temperature_abnormal=bool(
            sensor_defects.get("temperature_abnormal", False)
        ),
        humidity_abnormal=bool(
            sensor_defects.get("humidity_abnormal", False)
        ),
    )

    # =====================================================
    # SAFE PHYSICAL COUNTS
    # =====================================================

    def safe_count(key: str) -> int:
        try:
            return max(
                int(counts.get(key, 0) or 0),
                0,
            )
        except (TypeError, ValueError):
            return 0

    good = safe_count("good")
    broken = safe_count("broken")
    black = safe_count("black")
    black_and_broken = safe_count("black_and_broken")

    provided_total = safe_count("total_beans")

    calculated_known_total = (
        good
        + broken
        + black
        + black_and_broken
    )

    total_beans = (
        provided_total
        if provided_total > 0
        else calculated_known_total
    )

    # =====================================================
    # MODULES 1,2,3,4,6,7 NORMALIZED PHYSICAL DEFECTS
    # =====================================================
    #
    # black_and_broken represents both properties.
    #
    # Example:
    # broken = 4
    # black = 95
    # black_and_broken = 9
    #
    # Processing:
    # broken = 4 + 9 = 13
    # black = 95 + 9 = 104
    #
    # =====================================================

    recommendation_physical = (
        RecommendationPhysicalDefects(
            broken=(
                broken
                + black_and_broken
            ),
            black=(
                black
                + black_and_broken
            ),
        )
    )

    # =====================================================
    # MODULE 5 ORIGINAL CATEGORIES
    # =====================================================

    yield_counts = YieldPhysicalCounts(
        good=good,
        broken=broken,
        black=black,
        black_and_broken=black_and_broken,
        total_beans=total_beans,
    )

    # =====================================================
    # INSPECTION COMPLETENESS
    # =====================================================

    inspection = InspectionCompleteness(
        sensor_complete=bool(
            sensor_complete
        ),
        physical_complete=(
            bool(physical_complete)
            and total_beans > 0
        ),
    )

    # =====================================================
    # ACTIVE DEFECTS
    # =====================================================

    active_defects: List[str] = []

    if sensor.mq2_abnormal:
        active_defects.append(
            "MQ2_ABNORMAL"
        )

    if sensor.mq3_abnormal:
        active_defects.append(
            "MQ3_ABNORMAL"
        )

    if sensor.mq135_abnormal:
        active_defects.append(
            "MQ135_ABNORMAL"
        )

    if sensor.moisture_defect:
        active_defects.append(
            "MOISTURE_DEFECT"
        )

    if sensor.temperature_abnormal:
        active_defects.append(
            "TEMPERATURE_ABNORMAL"
        )

    if sensor.humidity_abnormal:
        active_defects.append(
            "HUMIDITY_ABNORMAL"
        )

    if recommendation_physical.broken > 0:
        active_defects.append(
            "BROKEN_BEANS"
        )

    if recommendation_physical.black > 0:
        active_defects.append(
            "BLACK_BEANS"
        )

    # =====================================================
    # FINAL PROFILE
    # =====================================================

    return DefectProfile(
        sensor=sensor,
        inspection=inspection,
        physical=recommendation_physical,
        yield_counts=yield_counts,
        active_defects=active_defects,
        active_defect_count=len(
            active_defects
        ),
    )