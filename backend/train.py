import os
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor

# Define standard categories matching the application
CATEGORIES = [
    "ART_AND_DESIGN", "AUTO_AND_VEHICLES", "BEAUTY", "BOOKS_AND_REFERENCE", "BUSINESS", 
    "COMICS", "COMMUNICATION", "DATING", "EDUCATION", "ENTERTAINMENT", "EVENTS", "FINANCE", 
    "FOOD_AND_DRINK", "HEALTH_AND_FITNESS", "HOUSE_AND_HOME", "LIBRARIES_AND_DEMO", "LIFESTYLE", 
    "GAME", "FAMILY", "MEDICAL", "SOCIAL", "SHOPPING", "PHOTOGRAPHY", "TOOLS", "PERSONALIZATION", 
    "PRODUCTIVITY", "PARENTING", "WEATHER", "VIDEO_PLAYERS", "NEWS_AND_MAGAZINES", "MAPS_AND_NAVIGATION"
]
category_to_idx = {cat: idx for idx, cat in enumerate(CATEGORIES)}

def clean_installs(val):
    if pd.isna(val):
        return 0.0
    val = str(val).strip().upper()
    val = val.replace(',', '').replace('+', '')
    if 'M' in val:
        try:
            return float(val.replace('M', '')) * 1_000_000.0
        except ValueError:
            pass
    if 'K' in val:
        try:
            return float(val.replace('K', '')) * 1_000.0
        except ValueError:
            pass
    try:
        return float(val)
    except ValueError:
        return 0.0

def clean_reviews(val):
    if pd.isna(val):
        return 0.0
    val = str(val).strip().upper()
    val = val.replace(',', '').replace('+', '')
    if 'M' in val:
        try:
            return float(val.replace('M', '')) * 1_000_000.0
        except ValueError:
            pass
    if 'K' in val:
        try:
            return float(val.replace('K', '')) * 1_000.0
        except ValueError:
            pass
    try:
        return float(val)
    except ValueError:
        return 0.0

def clean_type(val):
    if pd.isna(val):
        return 0.0
    val = str(val).strip().capitalize()
    if val == "Paid":
        return 1.0
    return 0.0

def clean_category(val):
    if pd.isna(val):
        return -1.0
    val = str(val).strip().upper().replace(' ', '_')
    return float(category_to_idx.get(val, -1.0))

# Model artifacts wrapper to bundle everything
class RateIQPredictor:
    def __init__(self, model, scaler):
        self.model = model
        self.scaler = scaler
        
    def preprocess_features(self, category_str, installs_val, reviews_val, type_str):
        # Convert category and type
        cat_idx = clean_category(category_str)
        t_val = clean_type(type_str)
        
        # Float conversions
        inst_num = float(installs_val)
        rev_num = float(reviews_val)
        
        # Log transforms
        log_inst = np.log1p(inst_num)
        log_rev = np.log1p(rev_num)
        
        # Ratio
        ratio = rev_num / inst_num if inst_num > 0 else 0.0
        
        # Scale numeric features
        scaled = self.scaler.transform([[log_inst, log_rev, ratio]])[0]
        
        # Combine [scaled_log_inst, scaled_log_rev, scaled_ratio, category_idx, type_val]
        return np.array([[scaled[0], scaled[1], scaled[2], cat_idx, t_val]])

    def predict(self, category_str, installs_val, reviews_val, type_str):
        features = self.preprocess_features(category_str, installs_val, reviews_val, type_str)
        pred = self.model.predict(features)
        if hasattr(pred, "__iter__"):
            rating = float(pred[0])
        else:
            rating = float(pred)
        # Cap rating between 1.0 and 5.0
        return round(min(max(rating, 1.0), 5.0), 2)

def main():
    print("Starting ML Model training...")
    
    # 1. Load Data
    csv_path = os.path.join("public", "googleplay.csv")
    
    apps_data = []
    
    # Load from googleplay.csv
    if os.path.exists(csv_path):
        try:
            df_csv = pd.read_csv(csv_path, sep='\t', encoding='utf-8-sig')
            raw_row_count = len(df_csv)
            print(f"DEBUG: Loaded {raw_row_count} raw rows from {csv_path}")
            for _, row in df_csv.iterrows():
                app_name = str(row.get('App', '')).strip()
                if not app_name or app_name.lower() == 'nan':
                    continue
                rating = row.get('Rating')
                category = str(row.get('Category', ''))
                reviews = row.get('Reviews')
                installs = row.get('Installs')
                app_type = row.get('Type')
                
                # Check rating validity
                try:
                    rating = float(rating)
                    if pd.isna(rating) or rating < 1.0 or rating > 5.0:
                        continue
                except (ValueError, TypeError):
                    continue
                
                apps_data.append({
                    "App": app_name,
                    "Category": category,
                    "Rating": rating,
                    "Reviews": clean_reviews(reviews),
                    "Installs": clean_installs(installs),
                    "Type": app_type
                })
            print(f"DEBUG: Parsed {len(apps_data)} valid rows with valid ratings from CSV.")
        except Exception as e:
            print(f"Error parsing {csv_path}: {e}")
            
    if not apps_data:
        print("Error: No valid training data found!")
        return
        
    df = pd.DataFrame(apps_data)
    
    # Drop duplicates
    initial_len = len(df)
    df = df.drop_duplicates(subset=['App'])
    print(f"DEBUG: Combined dataset contains {initial_len} records before duplicate removal.")
    print(f"DEBUG: Combined dataset contains {len(df)} unique app records after duplicate removal.")
    print(f"After dropping duplicates: {len(df)} apps.")
    
    # 2. Extract input features & target
    y = df['Rating'].values
    
    # Log transforms for highly skewed variables
    df['Log_Installs'] = np.log1p(df['Installs'])
    df['Log_Reviews'] = np.log1p(df['Reviews'])
    df['Rev_Inst_Ratio'] = df['Reviews'] / (df['Installs'] + 1e-5)
    
    # Fit StandardScaler on numeric components
    scaler = StandardScaler()
    scaled_numeric = scaler.fit_transform(df[['Log_Installs', 'Log_Reviews', 'Rev_Inst_Ratio']].values)
    
    df['Category_Encoded'] = df['Category'].apply(clean_category)
    df['Type_Encoded'] = df['Type'].apply(clean_type)
    
    # Final feature array: [scaled_log_inst, scaled_log_rev, scaled_ratio, category_idx, type_val]
    X = np.hstack([
        scaled_numeric,
        df[['Category_Encoded', 'Type_Encoded']].values
    ])
    
    # 3. Model Training (Try LightGBM first, fallback to RandomForest)
    model = None
    try:
        import lightgbm as lgb
        print("Attempting to train LightGBM Regressor...")
        model = lgb.LGBMRegressor(
            n_estimators=150,
            learning_rate=0.05,
            max_depth=6,
            num_leaves=31,
            random_state=42,
            verbose=-1
        )
        model.fit(X, y)
        print("LightGBM Regressor successfully trained!")
    except Exception as lgb_err:
        print(f"LightGBM training failed ({lgb_err}). Falling back to RandomForestRegressor.")
        
    if model is None:
        try:
            model = RandomForestRegressor(
                n_estimators=100,
                max_depth=8,
                random_state=42,
                n_jobs=-1
            )
            model.fit(X, y)
            print("RandomForestRegressor successfully trained!")
        except Exception as rf_err:
            print(f"RandomForest training failed: {rf_err}")
            return
            
    # Save RateIQPredictor artifact
    predictor = RateIQPredictor(model, scaler)
    
    # Create target directory
    os.makedirs(os.path.join("backend", "models"), exist_ok=True)
    model_path = os.path.join("backend", "models", "model_artifacts.pkl")
    
    with open(model_path, "wb") as f:
        pickle.dump(predictor, f)
        
    print(f"Model artifact successfully saved to {model_path}!")

if __name__ == "__main__":
    main()
