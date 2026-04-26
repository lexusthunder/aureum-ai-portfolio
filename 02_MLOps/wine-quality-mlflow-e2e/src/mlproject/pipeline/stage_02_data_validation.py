from src.mlproject.components import logger
from src.mlproject.components.data_validation import DataValidation
from src.mlproject.config import ConfigurationManager

STAGE_NAME = "Data Validation"


class DataValidationTrainingPipeline:
    def run(self):
        config = ConfigurationManager()
        data_validation = DataValidation(config.get_data_validation_config())
        data_validation.initiate_data_validation()


if __name__ == "__main__":
    try:
        logger.info(">>>>>> stage %s started <<<<<<", STAGE_NAME)
        DataValidationTrainingPipeline().run()
        logger.info(">>>>>> stage %s completed <<<<<<\n\nx==========x", STAGE_NAME)
    except Exception as e:
        logger.exception(e)
        raise
