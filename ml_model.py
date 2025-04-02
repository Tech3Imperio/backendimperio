import sys
import json
import pandas as pd
import pickle
from sklearn.preprocessing import LabelEncoder, StandardScaler

# Load the pre-trained model and other necessary objects
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('label_encoders.pkl', 'rb') as f:
    label_encoders = pickle.load(f)

with open('scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

def recommend_for_user(user_input):
    # Encode the user input
    new_input_encoded = []
    for column, value in user_input.items():
        try:
            new_input_encoded.append(label_encoders[column].transform([value])[0])
        except KeyError:
            print(f"Error: '{value}' is not a valid option for {column}.")
            return None

    # Scale the input
    new_input_encoded = scaler.transform([new_input_encoded])

    # Make a prediction
    recommendation = model.predict(new_input_encoded)[0]

    # Decode the recommendations
    decoded_recommendation = {}
    for i, column in enumerate(['Material', 'Height (inches)', 'Spacing (inches)']):
        if column in label_encoders:  # Decode only if the column was encoded
            decoded_recommendation[column] = label_encoders[column].inverse_transform([int(recommendation[i])])[0]
        else:  # For numerical columns, directly use the prediction
            decoded_recommendation[column] = round(recommendation[i])

    # Add additional recommendations based on user input
    decoded_recommendation['Additional Recommendations'] = get_additional_recommendations(user_input, decoded_recommendation)

    return decoded_recommendation

def get_additional_recommendations(user_input, base_recommendation):
    recommendations = []

    if user_input['Installation Area'] == 'Outdoor':
        recommendations.append("Consider weather-resistant materials for outdoor installation.")

    if user_input['Use Case'] == 'Staircase':
        recommendations.append("Ensure the railing is continuous for the entire length of the staircase.")

    if user_input['Safety Features'] == 'Yes (Shatter-resistant)':
        recommendations.append("Incorporate shatter-resistant glass panels for added safety.")

    if user_input['Budget'] == 'Low':
        recommendations.append("Consider cost-effective materials like aluminum or vinyl.")
    elif user_input['Budget'] == 'High':
        recommendations.append("Premium materials like stainless steel or custom designs are within your budget.")

    if float(user_input['Avg Adult Height Range'].split('-')[0]) > 6:
        recommendations.append(f"Consider a slightly taller railing height of {base_recommendation['Height (inches)'] + 2} inches for taller individuals.")

    if user_input['Privacy Level'] == 'High':
        recommendations.append("Consider adding frosted glass panels or closely spaced balusters for increased privacy.")

    if user_input['Exposed to Corrosion?'] == 'Yes':
        recommendations.append("Use corrosion-resistant materials like stainless steel or powder-coated aluminum.")

    return recommendations

if __name__ == "__main__":
    # Read input from command line argument
    user_input = json.loads(sys.argv[1])
    
    # Get recommendation
    recommendation = recommend_for_user(user_input)
    
    # Print the result as JSON
    print(json.dumps(recommendation))

