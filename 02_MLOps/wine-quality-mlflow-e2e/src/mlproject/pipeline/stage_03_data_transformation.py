from src.mlproject.components import logger
from src.mlproject.components.data_transformation import DataTransformation
from src.mlproject.config import ConfigurationManager

STAGE_NAME = "Data Transformation"


class DataTransformationTrainingPipeline:
    def run(self):
        config = ConfigurationManager()
        data_transformation = DataTransformation(config.get_data_transformation_config())
        data_transformation.initiate_data_transformation()


if __name__ == "__main__":
    try:
        logger.info(">>>>>> stage %s started <<<<<<", STAGE_NAME)
        DataTransformationTrainingPipeline().run()
        logger.info(">>>>>> stage %s completed <<<<<<\n\nx==========x", STAGE_NAME)
    except Exception as e:
        logger.exception(e)
        raise
