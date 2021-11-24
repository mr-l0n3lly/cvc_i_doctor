from flask import Flask, jsonify
import io
import json
import torch
from torch import nn as nn


from torchvision import models

import torchvision.transforms as transforms
from PIL import Image

app = Flask(__name__)


model = models.resnet50(pretrained=False)
num_ftrs = model.fc.in_features
model.fc = nn.Sequential(
    nn.BatchNorm1d(num_ftrs),
    nn.Linear(num_ftrs, 32),
    nn.ReLU(),
    nn.BatchNorm1d(32),
    nn.Linear(32, 3),
    nn.LogSoftmax()
)
model.load_state_dict(torch.load('./covid19.pt', map_location='cpu'))

model.eval()


def get_prediction(image_bytes):
    tensor = transform_image(image_bytes=image_bytes)
    outputs = model.forward(tensor)
    _, y_hat = outputs.max(1)
    return str(y_hat.item())


def transform_image(image_bytes):
    my_transforms = transforms.Compose([
        transforms.Resize(size=256),
        transforms.CenterCrop(size=224),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    image = Image.open(io.BytesIO(image_bytes))
    return my_transforms(image).unsqueeze(0)


@app.route('/')
def hello():
    with open("./images/image3.jpg", 'rb') as f:
        image_bytes = f.read()
        print(get_prediction(image_bytes=image_bytes))

    return 'Hello World!'


@app.route('/predict', methods=['POST'])
def predict():
    return jsonify({'class_id': 'IMAGE_NET_XXX', 'class_name': 'Cat'})
