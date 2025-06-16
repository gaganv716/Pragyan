import cv2
import torch
import requests
from PIL import Image
from transformers import CLIPProcessor, CLIPModel


# Load CLIP model and processor
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Custom content labels
CLASSES = ['drawings', 'hentai', 'neutral', 'porn', 'sexy', 'aggression', 'blood', 'intense gore']
VIOLENT_LABELS = ['aggression', 'blood', 'intense gore']
NSFW_LABELS = ['porn', 'sexy', 'hentai']


# Function to download video from URL and save in current folder
def download_video_from_url(url, filename="downloaded_video.mp4"):
    response = requests.get(url, stream=True)
    if response.status_code != 200:
        raise Exception(f"Failed to download video: {response.status_code}")

    with open(filename, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)

    print(f"Video downloaded to: {filename}")
    return filename


# Function to analyze the video and return an object with classification
def analyze_video(video_url, filename="downloaded_video.mp4"):
    # Download the video
    video_path = download_video_from_url(video_url, filename)

    # Load video
    cap = cv2.VideoCapture(video_path)

    frame_count = 0
    frame_skip = 5  # Analyze every 5th frame

    flagged_frames = []  # List to store flagged frames

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % frame_skip != 0:
            continue

        # Convert frame to PIL image
        image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

        # Preprocess for CLIP
        inputs = processor(text=CLASSES, images=image, return_tensors="pt", padding=True)
        inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = model(**inputs)

        probs = outputs.logits_per_image.softmax(dim=1)[0]
        scores = {label: float(score) for label, score in zip(CLASSES, probs)}

        top_class_idx = probs.argmax().item()
        top_class = CLASSES[top_class_idx]
        top_score = probs[top_class_idx].item()

        label = "SAFE"
        reason = None

        if top_score > 0.6:
            if top_class in NSFW_LABELS:
                label = "NSFW"
                reason = "NSFW content detected"
            elif top_class in VIOLENT_LABELS:
                label = "VIOLENT"
                reason = "Violent content detected"

        # If flagged, store the frame with relevant details
        if label != "SAFE":
            flagged_frame_info = {
                'frame': frame_count,
                'label': label,
                'reason': reason,
                'classification': 'Toxic',
                'top_class': top_class,
                'score': top_score
            }
            flagged_frames.append(flagged_frame_info)

        # Display the frame with label
        cv2.putText(frame, f"{label} - {top_class} ({top_score:.2f})", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255) if label != "SAFE" else (0, 255, 0), 2)

        cv2.imshow("Video", frame)

        # If flagged, break and return flagged frames
        if label != "SAFE":
            cv2.imshow("Flagged Frame", frame)
            cv2.waitKey(1)
            break

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    # Return the flagged frames information if any
    if flagged_frames:
        return flagged_frames
    else:
        return [{"classification": "Non-Toxic", "message": "Video content is safe."}]
