from fastapi import FastAPI, HTTPException, Body, UploadFile, File
from pydantic import BaseModel
from typing import Optional

from setting_db import create_db_and_tables, Tasks, SessionDep
from sqlmodel import select

import cloudinary.uploader
from cloudinary_config import cloudinary

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/tasks")
def readTasks(session: SessionDep) -> list[Tasks]:
    tasks = session.exec(select(Tasks)).all()
    return tasks

@app.post("/tasks")
def create_task(task: Tasks, session: SessionDep):
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@app.get("/tasks/{task_id}", response_model=Tasks)
def readTaskByID(task_id: int, session: SessionDep):
    task = session.get(Tasks, task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return task

@app.delete("/tasks/{task_id}")
def deleteTask(task_id: int, session: SessionDep):
    task = session.get(Tasks, task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    session.delete(task)
    session.commit()
    return {"msg": f"'{task.task}' has been deleted."}

@app.put("/tasks/{task_id}", response_model=Tasks)
def updateTask(task_id: int, session: SessionDep, task_update: dict = Body(...)):
    task = session.get(Tasks, task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    
    if "task" in task_update:
        task.task = task_update["task"]
    if "is_done" in task_update:
        task.is_done = task_update["is_done"]
    if "pic" in task_update:
        task.pic = task_update["pic"]

    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Upload file directly to Cloudinary
        result = cloudinary.uploader.upload(file.file, folder="my_todo_app")
        return {"url": result["secure_url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))