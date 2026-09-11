"""Serve built visual studies and catalog only; never expose repository files."""

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse

ROOT = Path(__file__).resolve().parents[1]


def create_app(client_path: Path | None = None) -> FastAPI:
    path = client_path if client_path is not None else ROOT / "dist" / "index.html"
    application = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

    @application.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "surface": "visual-study"}

    @application.get("/catalog", response_class=HTMLResponse)
    def catalog() -> HTMLResponse:
        try:
            html = path.read_text(encoding="utf-8")
        except FileNotFoundError as exc:
            raise HTTPException(status_code=503, detail="Build the client with make build") from exc
        return HTMLResponse(html, headers={"Cache-Control": "no-store"})

    @application.get("/", response_class=HTMLResponse)
    @application.get("/scene", response_class=HTMLResponse)
    def scene() -> HTMLResponse:
        try:
            html = (path.parent / "scene.html").read_text(encoding="utf-8")
        except FileNotFoundError as exc:
            raise HTTPException(status_code=503, detail="Build the client with make build") from exc
        return HTMLResponse(html, headers={"Cache-Control": "no-store"})

    return application


app = create_app()
