import logging
import sys
from logging.handlers import RotatingFileHandler


def setup_logging(log_level: str = "INFO") -> None:
    """Configure structured logging to stdout and matml.log file."""
    level = getattr(logging, log_level.upper(), logging.INFO)

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Stdout handler
    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setLevel(level)
    stdout_handler.setFormatter(formatter)

    # Rotating file handler (5 MB, 3 backups)
    file_handler = RotatingFileHandler(
        "matml.log", maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
    )
    file_handler.setLevel(level)
    file_handler.setFormatter(formatter)

    # Clear existing handlers, attach ours
    root_logger.handlers.clear()
    root_logger.addHandler(stdout_handler)
    root_logger.addHandler(file_handler)

    # Silence noisy third-party loggers
    for noisy in ("uvicorn.access", "httpx", "httpcore"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
