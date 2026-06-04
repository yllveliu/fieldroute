from fastapi import FastAPI

app = FastAPI(title="fieldroute-api")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "fieldroute-api"}
