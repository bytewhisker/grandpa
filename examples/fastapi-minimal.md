# Example 14: Minimal Python FastAPI Pattern

### The Bloated Approach
Introducing massive heavyweight ORM configurations, multiple nested service layers, and external dependency injection containers for simple CRUD tasks.

### The Grandpa Native Approach
```python
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
import sqlite3
from typing import List

app = FastAPI(title="Zero-Bloat Service")

class ItemCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field("", max_length=500)

def get_db():
    conn = sqlite3.connect("app.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.post("/items", status_code=status.HTTP_201_CREATED)
def create_item(payload: ItemCreate):
    with get_db() as db:
        cur = db.cursor()
        cur.execute(
            "INSERT INTO items (title, description) VALUES (?, ?)",
            (payload.title, payload.description)
        )
        db.commit()
        return {"id": cur.lastrowid, "title": payload.title}
```

### Savings
- **Eliminated**: Heavy ORM scaffolding when simple SQL queries suffice.
- **Reliability**: Uses Python's built-in standard library `sqlite3`.
