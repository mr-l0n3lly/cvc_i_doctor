from PIL import Image
import torchvision.transforms as transforms
from torchvision import models
import io
import json
import torch
from torch import nn as nn
import os
from flask import Flask, flash, request, redirect, url_for, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}


app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


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
model.load_state_dict(torch.load(
    './models/covid19/covid19.pt', map_location='cpu'))

model.eval()

anemiaModel = models.resnet18(pretrained=False)
num_ftrs = anemiaModel.fc.in_features
anemiaModel.fc = nn.Linear(num_ftrs, 2)
anemiaModel.load_state_dict(torch.load(
    './models/anemia/anaemia.pt', map_location='cpu'))

anemiaModel.eval()

brainModel = models.resnet50(pretrained=False)
num_ftrs = brainModel.fc.in_features
brainModel.fc = nn.Sequential(
    nn.BatchNorm1d(num_ftrs),
    nn.Linear(num_ftrs, 16),
    nn.ReLU(),
    nn.BatchNorm1d(16),
    nn.Linear(16, 4)
)
brainModel.load_state_dict(torch.load(
    './models/brain-tumor/brain_tumor.pt', map_location='cpu'))

brainModel.eval()


def get_prediction(image_bytes, model1):
    tensor = transform_image(image_bytes=image_bytes)
    outputs = model1.forward(tensor)
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
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    return my_transforms(image).unsqueeze(0)


@app.route('/')
def hello():

    return 'Hello World!'


def mapResponse(predicted, category):
    if category == 'covid':
        if predicted == 0:
            return "Covid"
        elif predicted == 1:
            return "Pneumonia"
    elif category == 'brain':
        if predicted == 0:
            return "Brain Tumor"
    elif category == 'anemia':
        if predicted == 0:
            return "Anemia"

    return "Sanatos"


@app.route('/api/predict')
def apiPredict():
    category = request.args.get('category')
    filename = request.args.get('filename')
    print(category, filename)

    model1 = model

    if category == 'anemia':
        model1 = anemiaModel

    if category == 'brain':
        model1 = brainModel

    with open("./uploads/{}".format(filename), 'rb') as f:
        image_bytes = f.read()

        predicted = get_prediction(image_bytes=image_bytes, model1=model1)
        message = "Sanatos tun"

        message = mapResponse(predicted, category)

        return jsonify({
            "number": predicted,
            "response": message
        })


@app.route('/api/image/upload', methods=['POST'])
def uploadImage():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        print('file a venit')
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            print(filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return jsonify({
        "status": "Success",
        "data": {
            "filename": filename
        }
    })


@app.route('/predict', methods=['POST'])
def predict():
    return jsonify({'class_id': 'IMAGE_NET_XXX', 'class_name': 'Cat'})
