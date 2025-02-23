# 🦠 Leptospirosis-Predictor
A Python, Javascript, HTML and CSS based web-application that predicts and performs risk analysis across various european nations based on various factors such as temperature, dew point humidity etc. The project uses **Scikit-Learn** and **Joblib** along with NumPy, Pandas modules of python for the training of the model and the predictions along with ... for the web-application.

---

## 📚 Features
- Description of features in the Application will be added here

### ⚙️Prerequisites:

- Python 3.x
- HTML
- JavaScript
- CSS

- Required Libraries:
    - `Scikit-Learn`  (Python)
    - `Joblib` (Python)
    - Add the ones for front-end if any




---

##  🔧 How to run
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
A web-based interface using React for frontend and node.js for backend was built to allow users to interact with the model effortlessly.
The website loads the predicted data using postgresql and displays it.
This structured workflow ensures efficiency and accuracy, making the application user-friendly and data-driven. 🚀

## 📸 Project Screenshots
### Home Page  
![Screenshot 2025-02-23 194539](https://github.com/user-attachments/assets/bfede5c2-40c1-4863-958b-c8b71fbca0b1)

### Data Table  
![Screenshot 2025-02-23 194548](https://github.com/user-attachments/assets/98459818-9987-4448-bc00-d8ed1fab658a)
![Screenshot 2025-02-23 194554](https://github.com/user-attachments/assets/240689fb-7c8c-43cc-9e2f-e7aafbd3032f)
![Screenshot 2025-02-23 194559](https://github.com/user-attachments/assets/02a24673-3bc1-4d80-b8fb-0d8445ee4db1)

### Map View  
![Screenshot 2025-02-23 194611](https://github.com/user-attachments/assets/b9ec9be1-e6b1-48cf-8696-97fb4425c668)
![Screenshot 2025-02-23 194616](https://github.com/user-attachments/assets/14deacf1-52d7-4b78-993a-a6bf840aa0a6)

### Line Graph
![Screenshot 2025-02-23 194621](https://github.com/user-attachments/assets/5eab2e22-aaec-4580-9ef0-746a3fa14001)

### Predictive Analysis
![Screenshot 2025-02-23 194637](https://github.com/user-attachments/assets/ec71e5da-bb64-4f3a-b1e8-52ebf6eeb5d3)
![Screenshot 2025-02-23 194709](https://github.com/user-attachments/assets/c77a62ed-cdd4-4be7-a0d0-ca26e0a61c21)
![Screenshot 2025-02-23 194741](https://github.com/user-attachments/assets/ab5d6696-4d1a-45b8-abda-ed730913be71)


