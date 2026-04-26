from src.mlproject.components import logger
from src.mlproject.components.model_evaluation import ModelEvaluation
from src.mlproject.config import ConfigurationManager

STAGE_NAME = "Model Evaluation"


class ModelEvaluationPipeline:
    def run(self):
        config = ConfigurationManager()
        model_evaluation = ModelEvaluation(config.get_model_evaluation_config())
        model_evaluation.initiate_model_evaluation()


if __name__ == "__main__":
    try:
        logger.info(">>>>>> stage %s started <<<<<<", STAGE_NAME)
        ModelEvaluationPipeline().run()
        logger.info(">>>>>> stage %s completed <<<<<<\n\nx==========x", STAGE_NAME)
    except Exception as e:
        logger.exception(e)
        raise
