import urllib.request
from pathlib import Path
from urllib.error import URLError
import zipfile

from src.mlproject.components import logger
from src.mlproject.entity import DataIngestionConfig
from src.mlproject.utils.common import create_directories


class DataIngestion:
    """Handles downloading and optional extraction of the raw dataset."""

    def __init__(self, config: DataIngestionConfig):
        self.config = config
        create_directories([self.config.root_dir])

    def _download_file(self) -> Path:
        target_path = self.config.local_data_file
        if target_path.exists():
            logger.info(f"Data already present at: {target_path}")
            return target_path

        logger.info(
            "Starting download from %s to %s",
            self.config.source_URL,
            target_path,
        )
        try:
            urllib.request.urlretrieve(self.config.source_URL, str(target_path))
        except URLError as err:
            logger.exception(
                "Failed to download data from %s",
                self.config.source_URL,
            )
            raise err

        logger.info(f"Download completed: {target_path}")
        return target_path

    def _extract_zip(self, file_path: Path):
        if file_path.suffix != ".zip":
            logger.info("Downloaded file is not a ZIP archive. Skipping extraction.")
            return

        create_directories([self.config.unzip_dir])
        with zipfile.ZipFile(file_path, "r") as zip_ref:
            zip_ref.extractall(self.config.unzip_dir)
        logger.info(f"Extracted ZIP archive to: {self.config.unzip_dir}")

    def initiate_data_ingestion(self) -> Path:
        """Execute the complete data ingestion workflow."""
        downloaded_file = self._download_file()
        self._extract_zip(downloaded_file)
        return downloaded_file
