from src.mlproject.components import logger
from src.mlproject.components.model_trainer import ModelTrainer
from src.mlproject.config import ConfigurationManager

STAGE_NAME = "Model Trainer"


class ModelTrainerTrainingPipeline:
    def run(self):
        config = ConfigurationManager()
        model_trainer = ModelTrainer(config.get_model_trainer_config())
        model_trainer.initiate_model_training()


if __name__ == "__main__":
    try:
        logger.info(">>>>>> stage %s started <<<<<<", STAGE_NAME)
        ModelTrainerTrainingPipeline().run()
        logger.info(">>>>>> stage %s completed <<<<<<\n\nx==========x", STAGE_NAME)
    except Exception as e:
        logger.exception(e)
        raise
