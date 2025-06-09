from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)


# Before
# model = joblib.load(r"E:\EELU-it L4\#Graduation Project\DiagnoTech\FlaskAPI\random_forest.joblib")

# After
model = joblib.load("random_forest.joblib")


df1 = pd.read_csv('Symptom-severity.csv')
df1['Symptom'] = df1['Symptom'].str.replace('_', ' ')
def load_disease_info():
    discrp = pd.read_csv("symptom_Description.csv")
    ektra7at = pd.read_csv("symptom_precaution.csv")
    discrp['disease_lower'] = discrp['Disease'].str.strip().str.lower()
    ektra7at['disease_lower'] = ektra7at['Disease'].str.strip().str.lower()
    description_dict = discrp.set_index('disease_lower')['Description'].to_dict()
    
    precaution_dict = {}
    for _, row in ektra7at.iterrows():
        disease_lower = row['disease_lower']
        precautions = row.iloc[1:-1].dropna().tolist()  
        precaution_dict[disease_lower] = precautions
    
    return description_dict, precaution_dict


description_dict, precaution_dict = load_disease_info()


def get_symptom_weights(symptoms):
    symptom_weights = []
    for user_symptom in symptoms:
        user_symptom_cleaned = user_symptom.lower().strip()
        try:
            weight = df1[df1['Symptom'].str.lower() == user_symptom_cleaned]['weight'].values[0]
            symptom_weights.append(weight)
        except IndexError:
            symptom_weights.append(0)  
    return symptom_weights


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    symptoms = data.get('symptoms', [])  
    
    
    symptom_weights = get_symptom_weights(symptoms)
    input_symptoms = symptom_weights + [0] * (17 - len(symptom_weights))
    
    
    probabilities = model.predict_proba([input_symptoms])[0]
    diseases = model.classes_
    
    
    disease_prob_df = pd.DataFrame({'Disease': diseases, 'Probability': probabilities})
    top5_diseases_df = disease_prob_df.sort_values(by='Probability', ascending=False).head(5)
    
    
    top5_diseases = []
    for _, row in top5_diseases_df.iterrows():
        disease_lower = row['Disease'].strip().lower()
        description = description_dict.get(disease_lower, "Description not available")
        precautions = precaution_dict.get(disease_lower, ["No precautions available"])
        probability_percent = round(row['Probability'] * 100, 2)  
        top5_diseases.append({
            "Disease": row['Disease'],
            "Probability (%)": probability_percent,
            "Description": description,
            "Precautions": precautions
        })
    
    return jsonify({'top5_diseases': top5_diseases})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=4000)