"""
PROJECT 10: AutoML System with Neural Architecture Search
Tech Stack: Optuna, PyTorch, Scikit-learn, Pandas
CV Value: AutoML & hyperparameter optimization - senior-level skill
"""

import optuna
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import pandas as pd
import numpy as np
from sklearn.datasets import fetch_california_housing, load_iris
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, r2_score, mean_squared_error
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import Ridge
import json
import logging
from typing import Dict, Any, Callable, Optional
from dataclasses import dataclass, field
from pathlib import Path
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
optuna.logging.set_verbosity(optuna.logging.WARNING)


@dataclass
class AutoMLConfig:
    task: str = "classification"       # 'classification' or 'regression'
    n_trials: int = 50                 # Optuna trials per model
    cv_folds: int = 5                  # Cross-validation folds
    timeout: int = 300                 # Seconds per model search
    metric: str = "accuracy"           # Optimization metric
    direction: str = "maximize"
    device: str = "auto"
    output_dir: str = "./automl_results"


class DynamicNet(nn.Module):
    """Neural network with architecture defined by hyperparameters."""
    
    def __init__(self, input_size: int, config: Dict):
        super().__init__()
        layers = []
        in_size = input_size
        
        for i in range(config["n_layers"]):
            out_size = config[f"layer_{i}_units"]
            layers.extend([
                nn.Linear(in_size, out_size),
                nn.BatchNorm1d(out_size),
                getattr(nn, config["activation"])(),
                nn.Dropout(config[f"layer_{i}_dropout"])
            ])
            in_size = out_size
        
        layers.append(nn.Linear(in_size, config["output_size"]))
        self.net = nn.Sequential(*layers)
    
    def forward(self, x):
        return self.net(x)


class NeuralAutoML:
    """Neural Architecture Search using Optuna."""
    
    def __init__(self, config: AutoMLConfig):
        self.config = config
        self.device = self._get_device()
        self.best_model = None
        self.best_params = None
        self.best_score = -np.inf if config.direction == "maximize" else np.inf
    
    def _get_device(self):
        if self.config.device == "auto":
            return torch.device("cuda" if torch.cuda.is_available() else "cpu")
        return torch.device(self.config.device)
    
    def _suggest_architecture(self, trial: optuna.Trial, input_size: int, output_size: int) -> Dict:
        """Let Optuna choose neural network architecture."""
        n_layers = trial.suggest_int("n_layers", 1, 4)
        activation = trial.suggest_categorical("activation", ["ReLU", "GELU", "SiLU", "Tanh"])
        lr = trial.suggest_float("lr", 1e-5, 1e-2, log=True)
        weight_decay = trial.suggest_float("weight_decay", 1e-6, 1e-3, log=True)
        batch_size = trial.suggest_categorical("batch_size", [16, 32, 64, 128])
        
        layer_config = {
            "n_layers": n_layers,
            "activation": activation,
            "output_size": output_size,
            "lr": lr,
            "weight_decay": weight_decay,
            "batch_size": batch_size
        }
        
        for i in range(n_layers):
            layer_config[f"layer_{i}_units"] = trial.suggest_categorical(
                f"layer_{i}_units", [32, 64, 128, 256, 512]
            )
            layer_config[f"layer_{i}_dropout"] = trial.suggest_float(
                f"layer_{i}_dropout", 0.0, 0.5
            )
        
        return layer_config
    
    def _train_and_eval(self, model, X_train, y_train, X_val, y_val, config: Dict, epochs: int = 30) -> float:
        """Train model and return validation score."""
        model = model.to(self.device)
        optimizer = torch.optim.AdamW(model.parameters(), lr=config["lr"], weight_decay=config["weight_decay"])
        
        if self.config.task == "classification":
            criterion = nn.CrossEntropyLoss()
        else:
            criterion = nn.MSELoss()
        
        X_t = torch.FloatTensor(X_train).to(self.device)
        y_t = torch.LongTensor(y_train).to(self.device) if self.config.task == "classification" else torch.FloatTensor(y_train).unsqueeze(1).to(self.device)
        
        dataset = TensorDataset(X_t, y_t)
        loader = DataLoader(dataset, batch_size=config["batch_size"], shuffle=True)
        
        for epoch in range(epochs):
            model.train()
            for X_batch, y_batch in loader:
                optimizer.zero_grad()
                out = model(X_batch)
                loss = criterion(out, y_batch)
                loss.backward()
                nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                optimizer.step()
        
        # Evaluate
        model.eval()
        X_v = torch.FloatTensor(X_val).to(self.device)
        with torch.no_grad():
            out = model(X_v)
            if self.config.task == "classification":
                preds = out.argmax(dim=1).cpu().numpy()
                return accuracy_score(y_val, preds)
            else:
                preds = out.squeeze().cpu().numpy()
                return r2_score(y_val, preds)
    
    def search(self, X_train, y_train, X_val, y_val) -> Dict:
        """Run Neural Architecture Search."""
        input_size = X_train.shape[1]
        output_size = len(np.unique(y_train)) if self.config.task == "classification" else 1
        
        def objective(trial):
            arch = self._suggest_architecture(trial, input_size, output_size)
            model = DynamicNet(input_size, arch)
            score = self._train_and_eval(model, X_train, y_train, X_val, y_val, arch)
            
            if (self.config.direction == "maximize" and score > self.best_score) or \
               (self.config.direction == "minimize" and score < self.best_score):
                self.best_score = score
                self.best_params = arch
                self.best_model = model
            
            return score
        
        study = optuna.create_study(
            direction=self.config.direction,
            sampler=optuna.samplers.TPESampler(seed=42),
            pruner=optuna.pruners.MedianPruner()
        )
        study.optimize(objective, n_trials=self.config.n_trials, timeout=self.config.timeout, show_progress_bar=True)
        
        return {
            "best_score": study.best_value,
            "best_params": study.best_params,
            "n_trials": len(study.trials)
        }


class SklearnAutoML:
    """AutoML for sklearn models with Optuna hyperparameter optimization."""
    
    def __init__(self, config: AutoMLConfig):
        self.config = config
        self.best_model = None
        self.results = {}
    
    def _get_search_space(self, model_name: str, trial: optuna.Trial):
        """Define hyperparameter search spaces per model."""
        if model_name == "RandomForest":
            return {
                "n_estimators": trial.suggest_int("n_estimators", 50, 500),
                "max_depth": trial.suggest_int("max_depth", 3, 20),
                "min_samples_split": trial.suggest_int("min_samples_split", 2, 20),
                "max_features": trial.suggest_categorical("max_features", ["sqrt", "log2", None])
            }
        elif model_name == "GradientBoosting":
            return {
                "n_estimators": trial.suggest_int("n_estimators", 50, 300),
                "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
                "max_depth": trial.suggest_int("max_depth", 2, 8),
                "subsample": trial.suggest_float("subsample", 0.6, 1.0)
            }
    
    def optimize_model(self, model_name: str, X, y) -> Dict:
        """Optimize a single model's hyperparameters."""
        skf = StratifiedKFold(n_splits=self.config.cv_folds, shuffle=True, random_state=42)
        
        def objective(trial):
            params = self._get_search_space(model_name, trial)
            
            if model_name == "RandomForest":
                model = RandomForestClassifier(**params, random_state=42, n_jobs=-1)
            elif model_name == "GradientBoosting":
                model = GradientBoostingClassifier(**params, random_state=42)
            
            scores = []
            for train_idx, val_idx in skf.split(X, y):
                model.fit(X[train_idx], y[train_idx])
                pred = model.predict(X[val_idx])
                scores.append(accuracy_score(y[val_idx], pred))
            
            return np.mean(scores)
        
        study = optuna.create_study(direction="maximize", sampler=optuna.samplers.TPESampler(seed=42))
        study.optimize(objective, n_trials=self.config.n_trials, timeout=self.config.timeout)
        
        return {"model": model_name, "best_score": study.best_value, "best_params": study.best_params}


class AutoMLPipeline:
    """Complete AutoML pipeline combining neural and sklearn search."""
    
    def __init__(self, config: Optional[AutoMLConfig] = None):
        self.config = config or AutoMLConfig()
        self.scaler = StandardScaler()
        self.results = {}
    
    def fit(self, X, y, test_size: float = 0.2) -> Dict:
        """Run full AutoML search and return best configuration."""
        Path(self.config.output_dir).mkdir(exist_ok=True)
        
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=test_size, random_state=42,
            stratify=y if self.config.task == "classification" else None
        )
        
        X_train_sc = self.scaler.fit_transform(X_train)
        X_val_sc = self.scaler.transform(X_val)
        
        logger.info(f"🔍 AutoML Search | Task: {self.config.task} | Trials: {self.config.n_trials}")
        logger.info(f"   Train: {X_train.shape} | Val: {X_val.shape}")
        
        # Sklearn models
        sklearn_automl = SklearnAutoML(self.config)
        for model_name in ["RandomForest", "GradientBoosting"]:
            logger.info(f"\n🤖 Optimizing {model_name}...")
            result = sklearn_automl.optimize_model(model_name, X_train_sc, y_train)
            self.results[model_name] = result
            logger.info(f"   Best CV Score: {result['best_score']:.4f}")
        
        # Neural architecture search
        logger.info(f"\n🧠 Neural Architecture Search...")
        neural_automl = NeuralAutoML(self.config)
        nas_result = neural_automl.search(X_train_sc, y_train, X_val_sc, y_val)
        self.results["NeuralNet"] = {"model": "NeuralNet", "best_score": nas_result["best_score"], **nas_result}
        logger.info(f"   Best NAS Score: {nas_result['best_score']:.4f}")
        
        # Find overall best
        best_model_name = max(self.results, key=lambda k: self.results[k]["best_score"])
        
        summary = {
            "best_model": best_model_name,
            "best_score": self.results[best_model_name]["best_score"],
            "all_results": {k: {"score": v["best_score"]} for k, v in self.results.items()}
        }
        
        with open(f"{self.config.output_dir}/automl_results.json", "w") as f:
            json.dump(summary, f, indent=2)
        
        self._print_leaderboard()
        return summary
    
    def _print_leaderboard(self):
        """Print sorted results."""
        sorted_results = sorted(self.results.items(), key=lambda x: x[1]["best_score"], reverse=True)
        
        print("\n" + "="*50)
        print("🏆 AutoML Leaderboard")
        print("="*50)
        for i, (name, result) in enumerate(sorted_results, 1):
            marker = " 🥇" if i == 1 else (" 🥈" if i == 2 else " 🥉")
            print(f"{i}. {name+marker:<25} Score: {result['best_score']:.4f}")
        print("="*50)


if __name__ == "__main__":
    logger.info("🤖 AutoML Pipeline Demo")
    
    data = load_iris()
    X, y = data.data, data.target
    
    config = AutoMLConfig(
        task="classification",
        n_trials=10,          # Small for demo, use 50-100 in production
        cv_folds=3,
        timeout=60
    )
    
    pipeline = AutoMLPipeline(config)
    results = pipeline.fit(X, y)
    
    print(f"\n✅ Best Model: {results['best_model']}")
    print(f"   Best Score: {results['best_score']:.4f}")
    print(f"\n📊 Full results saved to: {config.output_dir}/automl_results.json")
