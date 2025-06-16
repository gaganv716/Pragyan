import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import requests
from io import BytesIO
import traceback

# Load model and processor only once
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Use GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Define classes and toxic labels
CLASSES = ['drawings', 'hentai', 'neutral', 'porn', 'sexy', 'aggression', 'blood', 'intense gore']
TOXIC_LABELS = ['porn', 'sexy', 'hentai', 'aggression', 'blood', 'intense gore']


def load_image_from_url(image_url):
    """Download and load image from a URL."""
    try:
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()  # Raise error if HTTP request failed
        return Image.open(BytesIO(response.content)).convert("RGB")
    except Exception as e:
        raise ValueError(f"Failed to load image from URL: {e}")


def classify_image_from_url(image_url):
    """
    Classify an image from a URL using CLIP and return JSON-friendly result.

    Args:
        image_url (str): URL to the image file.

    Returns:
        dict: JSON-friendly result with class probabilities and toxicity.
    """
    try:
        image = load_image_from_url(image_url)

        # Preprocess inputs
        inputs = processor(text=CLASSES, images=image, return_tensors="pt", padding=True)
        inputs = {k: v.to(device) for k, v in inputs.items()}

        # Inference
        with torch.no_grad():
            outputs = model(**inputs)

        probs = outputs.logits_per_image.softmax(dim=1)
        scores = {label: float(score) for label, score in zip(CLASSES, probs[0])}

        top_class_idx = probs.argmax().item()
        top_class = CLASSES[top_class_idx]
        top_score = probs[0][top_class_idx].item()

        classification = "NON-TOXIC"

        # New condition: classify as toxic if "aggression" is the top class and score > 0.6
        if top_class == "aggression":
            if top_score > 0.6:
                classification = "TOXIC"
            else:
                classification = "NON-TOXIC"
        else:
            classification = "TOXIC" if top_class in TOXIC_LABELS and top_score > 0.3 else "NON-TOXIC"

        return {
            "scores": scores,
            "top_class": top_class,
            "confidence": float(top_score),
            "classification": classification
        }

    except Exception as e:
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }
