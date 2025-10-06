from typing import Annotated, Optional
from fastapi import Depends
from sqlmodel import Field, Session, SQLModel, create_engine
import os

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Render provides DATABASE_URL with "postgres://"
    if DATABASE_URL.startswith("postgres://"):
        # Use psycopg2 for best compatibility
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
else:
    sqlite_file_name = "database.db"
    sqlite_url = f"sqlite:///{sqlite_file_name}"
    connect_args = {"check_same_thread": False}
    engine = create_engine(sqlite_url, connect_args=connect_args)

class Tasks(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    task: str | None = Field(index=True)
    pic: Optional[str] = None
    date: Optional[str] = None
    is_done: bool = False

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session() -> Session:
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]