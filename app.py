# app.py

from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import torch
from langdetect import detect, LangDetectException
from googletrans import Translator
from audio_test import transcribe_audio_from_url
from image_test import classify_image_from_url  # Import the image classification function
from video_test import analyze_video

# Model names
MODEL_NAME_SENTIMENT = "cardiffnlp/twitter-roberta-base-sentiment"
MODEL_NAME_ABUSIVE = "unitary/toxic-bert"

# Initialize Flask app
app = Flask(__name__)

# Load models and analyzers
tokenizer_sentiment = None
model_sentiment = None
tokenizer_abusive = None
model_abusive = None
sentiment_analyzer = None
abusive_analyzer = None

translator = Translator()

def load_models():
    global tokenizer_sentiment, model_sentiment, tokenizer_abusive, model_abusive
    tokenizer_sentiment = AutoTokenizer.from_pretrained(MODEL_NAME_SENTIMENT)
    model_sentiment = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME_SENTIMENT)
    tokenizer_abusive = AutoTokenizer.from_pretrained(MODEL_NAME_ABUSIVE)
    model_abusive = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME_ABUSIVE)


def load_analyzers():
    global sentiment_analyzer, abusive_analyzer
    if tokenizer_sentiment and model_sentiment:
        sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model=model_sentiment,
            tokenizer=tokenizer_sentiment,
            device=0 if torch.cuda.is_available() else -1
        )
    if tokenizer_abusive and model_abusive:
        abusive_analyzer = pipeline(
            "text-classification",
            model=model_abusive,
            tokenizer=tokenizer_abusive,
            device=0 if torch.cuda.is_available() else -1
        )


# Label mappings
sentiment_labels = {
    "LABEL_0": "Negative",
    "LABEL_1": "Neutral",
    "LABEL_2": "Positive"
}
abusive_labels = {
    "LABEL_0": "Non-Toxic",
    "LABEL_1": "Toxic"
}


def detect_and_translate(text):
    if not text or len(text.strip()) == 0:
        return None, None  # Return None if text is empty or invalid

    try:
        lang = detect(text)
        if lang != 'en':  # If not English, translate
            translated = translator.translate(text, src=lang, dest='en')
            if hasattr(translated, 'result'):
                translated = translated.result()
            return translated.text, lang
        else:
            return text, lang
    except LangDetectException:
        return None, None  # Handle language detection failure


@app.route('/')
def home():
    return "Server is running. Use /analyze or /analyze/audio for analysis."


@app.route('/analyze', methods=['POST'])
def analyze_sentiment_and_abuse():
    if not tokenizer_sentiment or not model_sentiment or not tokenizer_abusive or not model_abusive:
        load_models()
    if not sentiment_analyzer or not abusive_analyzer:
        load_analyzers()

    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'Please provide text for analysis.'}), 400

    text = data['text']

    # Detect language and translate if necessary
    processed_text, detected_lang = detect_and_translate(text)
    if not processed_text:
        return jsonify({'error': 'Unable to detect or translate the text.'}), 400

    # Perform sentiment analysis
    sentiment_result = sentiment_analyzer(processed_text)
    sentiment_label = sentiment_result[0]['label']
    sentiment_score = sentiment_result[0]['score']
    sentiment_mapped = sentiment_labels.get(sentiment_label, "Unknown")

    # Perform abusive content analysis
    abusive_result = abusive_analyzer(processed_text)
    if abusive_result and isinstance(abusive_result, list) and len(abusive_result) > 0:
        abusive_label = abusive_result[0]['label']
        abusive_score = abusive_result[0]['score']
        abusive_mapped = "Toxic" if abusive_score > 0.5 else "Non-Toxic"
    else:
        abusive_mapped = "Unknown"
        abusive_score = 0.0

    return jsonify({
        'original_language': detected_lang,
        'processed_text': processed_text,
        'sentiment': {
            'label': sentiment_mapped,
            'score': sentiment_score
        },
        'abusive': {
            'label': abusive_mapped,
            'score': abusive_score
        }
    }), 200


@app.route('/analyze/audio', methods=['POST'])
def analyze_audio_from_url():
    if not tokenizer_sentiment or not model_sentiment or not tokenizer_abusive or not model_abusive:
        load_models()
    if not sentiment_analyzer or not abusive_analyzer:
        load_analyzers()

    data = request.json
    if not data or 'audio_url' not in data:
        return jsonify({'error': 'Please provide an audio_url for analysis.'}), 400

    try:
        transcribed_text = transcribe_audio_from_url(data['audio_url'])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    if not transcribed_text:
        return jsonify({'error': 'Could not transcribe audio.'}), 400

    # Detect language and translate if necessary
    processed_text, detected_lang = detect_and_translate(transcribed_text)
    if not processed_text:
        return jsonify({'error': 'Unable to detect or translate the text.'}), 400

    # Perform sentiment analysis
    sentiment_result = sentiment_analyzer(processed_text)
    sentiment_label = sentiment_result[0]['label']
    sentiment_score = sentiment_result[0]['score']
    sentiment_mapped = sentiment_labels.get(sentiment_label, "Unknown")

    # Perform abusive content analysis
    abusive_result = abusive_analyzer(processed_text)
    if abusive_result and isinstance(abusive_result, list) and len(abusive_result) > 0:
        abusive_label = abusive_result[0]['label']
        abusive_score = abusive_result[0]['score']
        abusive_mapped = "Toxic" if abusive_score > 0.5 else "Non-Toxic"
    else:
        abusive_mapped = "Unknown"
        abusive_score = 0.0

    return jsonify({
        'original_language': detected_lang,
        'transcribed_text': transcribed_text,
        'processed_text': processed_text,
        'sentiment': {
            'label': sentiment_mapped,
            'score': sentiment_score
        },
        'abusive': {
            'label': abusive_mapped,
            'score': abusive_score
        }
    }), 200


@app.route('/analyze/image', methods=['POST'])
def analyze_image():
    data = request.json
    if not data or 'image_url' not in data:
        return jsonify({'error': 'Please provide an image_url for analysis.'}), 400

    try:
        image_analysis_result = classify_image_from_url(data['image_url'])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify(image_analysis_result), 200

@app.route('/analyze/video', methods=['POST'])
def analyze_video_endpoint():
    data = request.json
    if not data or 'video_url' not in data:
        return jsonify({'error': 'Please provide a video_url for analysis.'}), 400

    try:
        video_analysis_result = analyze_video(data['video_url'])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify(video_analysis_result), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
