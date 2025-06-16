# audio_test.py

import os
import requests
from pydub import AudioSegment
import speech_recognition as sr

def download_audio_from_url(audio_url, download_path="downloaded_audio"):
    file_extension = audio_url.split('.')[-1]  # Example: m4a, mp3, wav
    filename = f"{download_path}.{file_extension}"

    response = requests.get(audio_url)
    with open(filename, 'wb') as f:
        f.write(response.content)

    return filename

def convert_to_wav(input_path):
    file_ext = os.path.splitext(input_path)[1].lower()
    if file_ext == ".wav":
        return input_path

    audio = AudioSegment.from_file(input_path)
    wav_path = input_path.rsplit('.', 1)[0] + ".wav"
    audio.export(wav_path, format="wav")
    return wav_path

def transcribe_audio_from_url(audio_url):
    downloaded_audio = download_audio_from_url(audio_url)
    wav_audio = convert_to_wav(downloaded_audio)

    recognizer = sr.Recognizer()
    with sr.AudioFile(wav_audio) as source:
        audio = recognizer.record(source)

    try:
        text = recognizer.recognize_google(audio)
        return text
    except sr.UnknownValueError:
        return None
    except sr.RequestError as e:
        raise Exception(f"Google API error: {e}")
