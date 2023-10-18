"""
Models for user data structures
"""

from typing import Optional

from pydantic import BaseModel  # pylint: disable=no-name-in-module

from app.models.punishment import PunishmentOut
from app.models.punishment_type import PunishmentTypeRead
from app.types import OWUserId, UserId


class UserBase(BaseModel):
    ow_user_id: OWUserId
    first_name: str
    last_name: str
    email: Optional[str]


class CreatedUserBase(UserBase):
    user_id: UserId


class User(CreatedUserBase):
    pass


class UserCreate(UserBase):
    pass


class UserUpdate(CreatedUserBase):
    pass


class LeaderboardPunishmentOut(PunishmentOut):
    punishment_type: PunishmentTypeRead


class LeaderboardUser(User):
    punishments: list[LeaderboardPunishmentOut]
    total_value: int
