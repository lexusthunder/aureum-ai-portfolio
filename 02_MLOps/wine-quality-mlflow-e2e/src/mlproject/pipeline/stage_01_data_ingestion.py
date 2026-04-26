from src.mlproject.components import logger
from src.mlproject.components.data_ingestion import DataIngestion
from src.mlproject.config import ConfigurationManager

STAGE_NAME = "Data Ingestion"


class DataIngestionTrainingPipeline:
    def run(self):
        config = ConfigurationManager()
        data_ingestion = DataIngestion(config.get_data_ingestion_config())
        data_ingestion.initiate_data_ingestion()


if __name__ == "__main__":
    try:
        logger.info(">>>>>> stage %s started <<<<<<", STAGE_NAME)
        DataIngestionTrainingPipeline().run()
        logger.info(">>>>>> stage %s completed <<<<<<\n\nx==========x", STAGE_NAME)
    except Exception as e:
        logger.exception(e)
        raise
