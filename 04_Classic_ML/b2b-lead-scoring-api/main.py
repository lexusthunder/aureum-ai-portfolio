"""
B2B Lead Scoring Neural Network
Rețea neurală pentru scoring lead-uri B2B (probabilitate conversie).

Input features (exemplu):
  - company_size: 0-1 (normalizat)
  - budget: 0-1 (normalizat)
  - engagement_score: 0-1
  - industry_match: 0 sau 1
  - decision_maker_contact: 0 sau 1

Output: probabilitate conversie (0-1)
"""

import numpy as np


class B2BLeadScoringModel:
    """
    Rețea neurală cu 2 straturi pentru scoring lead-uri B2B.
    Arhitectură: input → ReLU hidden → Sigmoid output
    """

    def __init__(self, input_size: int, hidden_size: int, output_size: int = 1):
        # He initialization pentru ReLU (mai stabilă decât * 0.01)
        self.W1 = np.random.randn(input_size, hidden_size) * np.sqrt(2.0 / input_size)
        self.b1 = np.zeros((1, hidden_size))
        self.W2 = np.random.randn(hidden_size, output_size) * np.sqrt(2.0 / hidden_size)
        self.b2 = np.zeros((1, output_size))

    def forward(self, X: np.ndarray) -> np.ndarray:
        """Forward pass: returnează probabilitate conversie."""
        self.z1 = np.dot(X, self.W1) + self.b1
        self.a1 = np.maximum(0, self.z1)  # ReLU

        self.z2 = np.dot(self.a1, self.W2) + self.b2
        self.a2 = 1 / (1 + np.exp(-np.clip(self.z2, -500, 500)))  # Sigmoid cu clip overflow
        return self.a2

    def backward(self, X: np.ndarray, y: np.ndarray, learning_rate: float) -> None:
        """Backpropagation cu gradient descent."""
        m = X.shape[0]

        dz2 = self.a2 - y
        dW2 = (1 / m) * np.dot(self.a1.T, dz2)
        db2 = (1 / m) * np.sum(dz2, axis=0, keepdims=True)

        dz1 = np.dot(dz2, self.W2.T) * (self.z1 > 0)  # ReLU derivative
        dW1 = (1 / m) * np.dot(X.T, dz1)
        db1 = (1 / m) * np.sum(dz1, axis=0, keepdims=True)

        self.W1 -= learning_rate * dW1
        self.b1 -= learning_rate * db1
        self.W2 -= learning_rate * dW2
        self.b2 -= learning_rate * db2

    def compute_loss(self, predictions: np.ndarray, y: np.ndarray) -> float:
        """Binary cross-entropy cu epsilon clipping pentru stabilitate numerică."""
        eps = 1e-7
        predictions = np.clip(predictions, eps, 1 - eps)
        return float(-np.mean(y * np.log(predictions) + (1 - y) * np.log(1 - predictions)))

    def train(
        self,
        X: np.ndarray,
        y: np.ndarray,
        epochs: int = 1000,
        learning_rate: float = 0.01,
        verbose: bool = True,
    ) -> list[float]:
        """
        Antrenează modelul și returnează istoricul loss-ului.
        """
        if X.ndim != 2:
            raise ValueError(f"X trebuie să fie 2D, primit: {X.ndim}D")
        if y.ndim != 2:
            raise ValueError(f"y trebuie să fie 2D (shape Nx1), primit: {y.ndim}D")
        if not (0 <= y.min() and y.max() <= 1):
            raise ValueError("y trebuie să conțină valori în [0, 1]")

        loss_history = []
        for epoch in range(epochs):
            predictions = self.forward(X)
            loss = self.compute_loss(predictions, y)
            loss_history.append(loss)
            self.backward(X, y, learning_rate)
            if verbose and epoch % 100 == 0:
                print(f"Epoch {epoch:4d} | Loss: {loss:.4f}")

        return loss_history

    def predict(self, X: np.ndarray, threshold: float = 0.5) -> np.ndarray:
        """
        Returnează etichete binare (0/1) pe baza threshold-ului.
        Folosește pentru scoring final al lead-urilor.
        """
        probabilities = self.forward(X)
        return (probabilities >= threshold).astype(int)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Returnează probabilitățile raw (0-1) pentru fiecare lead."""
        return self.forward(X)

    def accuracy(self, X: np.ndarray, y: np.ndarray, threshold: float = 0.5) -> float:
        """Calculează acuratețea pe set de date."""
        predictions = self.predict(X, threshold)
        return float(np.mean(predictions == y))


# --- Demo / smoke test ---
if __name__ == "__main__":
    np.random.seed(42)

    # Date sintetice: 5 features B2B per lead, 200 exemple
    n_samples = 200
    n_features = 5

    X = np.random.rand(n_samples, n_features)
    # Target: lead convertit dacă suma primelor 3 features > 1.5
    y = ((X[:, 0] + X[:, 1] + X[:, 2]) > 1.5).astype(float).reshape(-1, 1)

    # Split train/test 80/20
    split = int(0.8 * n_samples)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    model = B2BLeadScoringModel(input_size=n_features, hidden_size=16)
    print("=== Antrenament B2B Lead Scoring Model ===")
    model.train(X_train, y_train, epochs=500, learning_rate=0.1)

    test_acc = model.accuracy(X_test, y_test)
    print(f"\nAccuracy test: {test_acc:.2%}")

    # Exemplu scoring un lead nou
    lead = np.array([[0.9, 0.8, 0.7, 1.0, 0.5]])
    score = model.predict_proba(lead)[0][0]
    print(f"Score lead nou: {score:.2%} probabilitate de conversie")
