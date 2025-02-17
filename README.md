# 🦠 Leptospirosis-Predictor
A Python, Javascript, HTML and CSS based web-application that predicts and performs risk analysis across various european nations based on various factors such as temperature, dew point humidity etc. The project uses **Scikit-Learn** and **Joblib** along with NumPy, Pandas modules of python for the training of the model and the predictions along with ... for the web-application.

---

## 📚 Features
- Description of features in the Application will be added here

### Prerequisites:

- Python 3.x
- HTML
- JavaScript
- CSS

- Required Libraries:
    - `Scikit-Learn`  (Python)
    - `Joblib` (Python)
    - Add the ones for front-end if any




---

###  🔧 How to run
1. **Clone the Repository**:

```bash
git clone https://github.com/Your_Username/Leptospirosis-Predictor.git
cd Leptospirosis-Predictor
```

2. **Run the Script**:
    - Go to the model folder and run Lepto.py
    - Verify if the model named 'trained_random_forest_model.pkl' has been created or not
    - Once done, run the Predict.py file

3. **Access the Website**:

---

## 🔄 Application Workflow
Our application follows a structured pipeline, ensuring seamless data processing, model training, and deployment.

### 📌 Step 1: Data Collection
Health-related data was sourced from the European Centre for Disease Prevention and Control (ECDC).
Weather data corresponding to the health records was collected from ERA5 Monthly, a climate reanalysis dataset by ECMWF.
### 🛠️ Step 2: Data Processing
The collected datasets were merged and preprocessed to create a unified dataset for analysis.
A final combined processed file was generated for training the model.
### 🧠 Step 3: Model Training
A machine learning model was trained using the processed dataset.
The trained model was saved as Trainedmodel.pkl for future predictions.
### 🌐 Step 4: Web Application Development
A web-based interface was built to allow users to interact with the model effortlessly.
The website loads the trained model and provides predictions based on user inputs.
This structured workflow ensures efficiency and accuracy, making the application user-friendly and data-driven. 🚀
