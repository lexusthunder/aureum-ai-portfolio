from src.mlproject.components import logger
from src.mlproject.pipeline.stage_01_data_ingestion import DataIngestionTrainingPipeline
from src.mlproject.pipeline.stage_02_data_validation import DataValidationTrainingPipeline
from src.mlproject.pipeline.stage_03_data_transformation import DataTransformationTrainingPipeline
from src.mlproject.pipeline.stage_04_model_trainer import ModelTrainerTrainingPipeline
from src.mlproject.pipeline.stage_05_model_evaluation import ModelEvaluationPipeline

STAGES = [
    ("Data Ingestion", DataIngestionTrainingPipeline),
    ("Data Validation", DataValidationTrainingPipeline),
    ("Data Transformation", DataTransformationTrainingPipeline),
    ("Model Trainer", ModelTrainerTrainingPipeline),
    ("Model Evaluation", ModelEvaluationPipeline),
]

if __name__ == "__main__":
    for stage_name, PipelineClass in STAGES:
        try:
            logger.info(">>>>>> stage %s started <<<<<<", stage_name)
            PipelineClass().run()
            logger.info(">>>>>> stage %s completed <<<<<<\n\nx==========x", stage_name)
        except Exception as e:
            logger.exception("Pipeline stage '%s' failed.", stage_name)
            raise e
