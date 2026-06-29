import os
import json
import pickle
import re
import difflib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="RateIQ Prediction Service", version="1.0.0")

# Input features and responses schemas matching the front-end interface
class AppFeatures(BaseModel):
    app_name: Optional[str] = "Extracted Store App"
    category: str = "GAME"
    installs: int = 10000
    size: float = 24.5
    app_type: str = "Free"
    content_rating: str = "Everyone"
    reviews: int = 250
    last_updated_days: int = 30
    contains_ads: str = "Yes"
    price: float = 0.0

class PredictionResponse(BaseModel):
    rating: float
    confidence: float
    source: str

# Define standard categories matching the application
CATEGORIES = [
    "ART_AND_DESIGN", "AUTO_AND_VEHICLES", "BEAUTY", "BOOKS_AND_REFERENCE", "BUSINESS", 
    "COMICS", "COMMUNICATION", "DATING", "EDUCATION", "ENTERTAINMENT", "EVENTS", "FINANCE", 
    "FOOD_AND_DRINK", "HEALTH_AND_FITNESS", "HOUSE_AND_HOME", "LIBRARIES_AND_DEMO", "LIFESTYLE", 
    "GAME", "FAMILY", "MEDICAL", "SOCIAL", "SHOPPING", "PHOTOGRAPHY", "TOOLS", "PERSONALIZATION", 
    "PRODUCTIVITY", "PARENTING", "WEATHER", "VIDEO_PLAYERS", "NEWS_AND_MAGAZINES", "MAPS_AND_NAVIGATION"
]
category_to_idx = {cat: idx for idx, cat in enumerate(CATEGORIES)}

# Helper functions for dataset cleaning (for the dynamic lookup)
def clean_installs_val(val):
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

def clean_reviews_val(val):
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

def clean_type_val(val):
    if pd.isna(val):
        return 0.0
    val = str(val).strip().capitalize()
    if val == "Paid":
        return 1.0
    return 0.0

def clean_category_val(val):
    if pd.isna(val):
        return -1.0
    val = str(val).strip().upper().replace(' ', '_')
    return float(category_to_idx.get(val, -1.0))

def normalize_string(s: str) -> str:
    if pd.isna(s):
        return ""
    s = str(s).lower().strip()
    # Remove special characters, keep only lowercase letters, numbers, and spaces
    s = re.sub(r'[^a-z0-9\s]', '', s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

# Pre-declare the Predictor class so pickle can find and deserialize it perfectly
class RateIQPredictor:
    def __init__(self, model, scaler):
        self.model = model
        self.scaler = scaler
        
    def preprocess_features(self, category_str, installs_val, reviews_val, type_str):
        cat_idx = clean_category_val(category_str)
        t_val = clean_type_val(type_str)
        
        inst_num = float(installs_val)
        rev_num = float(reviews_val)
        
        log_inst = np.log1p(inst_num)
        log_rev = np.log1p(rev_num)
        
        ratio = rev_num / inst_num if inst_num > 0 else 0.0
        scaled = self.scaler.transform([[log_inst, log_rev, ratio]])[0]
        
        return np.array([[scaled[0], scaled[1], scaled[2], cat_idx, t_val]])

    def predict(self, category_str, installs_val, reviews_val, type_str):
        features = self.preprocess_features(category_str, installs_val, reviews_val, type_str)
        pred = self.model.predict(features)
        if hasattr(pred, "__iter__"):
            rating = float(pred[0])
        else:
            rating = float(pred)
        return round(min(max(rating, 1.0), 5.0), 2)

# Global variables for model and dataset lookup
model = None
dataset_df = None
category_stats = {}

# Load the trained model artifacts
model_path = os.getenv("MODEL_PATH", "backend/models/model_artifacts.pkl")
if os.path.exists(model_path):
    try:
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        print(f"Successfully loaded trained ML model from {model_path}")
    except Exception as e:
        print(f"Error loading model from {model_path}: {e}")
else:
    print(f"No trained ML model found at {model_path} yet.")

# Load dataset for app-name lookup and statistics computation
apps_list = []

# 1. Load from CSV
csv_path = "public/googleplay.csv"
if os.path.exists(csv_path):
    try:
        df_csv = pd.read_csv(csv_path, sep='\t', encoding='utf-8-sig')
        raw_row_count = len(df_csv)
        print(f"DEBUG: CSV file loaded successfully. Raw row count: {raw_row_count}")
        for _, row in df_csv.iterrows():
            app_name = str(row.get('App', '')).strip()
            if not app_name or app_name.lower() == 'nan':
                continue
            apps_list.append({
                "App": app_name,
                "Category": str(row.get('Category', 'FAMILY')).strip().upper().replace(' ', '_'),
                "Installs": row.get('Installs', 0.0),
                "Reviews": row.get('Reviews', 0.0),
                "Type": str(row.get('Type', 'Free')).strip().capitalize()
            })
        print(f"DEBUG: Parsed {len(apps_list)} valid non-empty apps from raw CSV rows.")
    except Exception as e:
        print(f"Error loading {csv_path}: {e}")

if apps_list:
    df_unified = pd.DataFrame(apps_list)
    df_unified = df_unified.drop_duplicates(subset=['App'])
    
    df_unified['App_lower'] = df_unified['App'].str.lower()
    df_unified['App_normalized'] = df_unified['App'].apply(normalize_string)
    df_unified['Installs_numeric'] = df_unified['Installs'].apply(clean_installs_val)
    df_unified['Reviews_numeric'] = df_unified['Reviews'].apply(clean_reviews_val)
    
    # Pre-calculate category-wise statistics for fallback estimation
    cat_groups = df_unified.groupby('Category')
    for cat, group in cat_groups:
        category_stats[cat] = {
            "avg_installs": group['Installs_numeric'].mean(),
            "avg_reviews": group['Reviews_numeric'].mean(),
            "common_type": group['Type'].mode()[0] if not group['Type'].empty else "Free"
        }
        
    dataset_df = df_unified
    print(f"DEBUG: Unified dataset successfully loaded and processed with {len(dataset_df)} unique apps.")
else:
    print("Warning: No apps loaded for prediction lookup!")

# Fuzzy Match Finder with multi-tier scoring
def find_best_match(query: str, df: pd.DataFrame):
    if df is None or df.empty:
        return None, 0.0
    
    q_norm = normalize_string(query)
    if not q_norm:
        return None, 0.0
    
    # 1. Exact match (case-insensitive & normalized)
    clean_name = query.strip().lower()
    exact_matches = df[df['App_lower'] == clean_name]
    if not exact_matches.empty:
        return exact_matches.iloc[0], 1.0
        
    exact_matches = df[df['App_normalized'] == q_norm]
    if not exact_matches.empty:
        return exact_matches.iloc[0], 1.0
        
    # 2. Match based on substring containment and keyword overlap
    best_row = None
    best_score = 0.0
    q_words = set(q_norm.split())
    
    for idx, row in df.iterrows():
        cand_norm = row['App_normalized']
        if not cand_norm:
            continue
        
        score = 0.0
        if q_norm in cand_norm:
            score = 0.85 + 0.14 * (len(q_norm) / len(cand_norm))
        elif cand_norm in q_norm:
            score = 0.80 + 0.19 * (len(cand_norm) / len(q_norm))
        else:
            cand_words = set(cand_norm.split())
            common_words = q_words.intersection(cand_words)
            if common_words:
                # Word-based overlap ratio
                score = len(common_words) / max(len(q_words), len(cand_words))
                score = score * 0.75  # Cap word overlap score slightly
            else:
                continue
                
        if score > best_score:
            best_score = score
            best_row = row
            
    # 3. Fallback to global difflib close matching (excellent for typos)
    if best_score < 0.5:
        all_normalized_names = df['App_normalized'].tolist()
        close_matches = difflib.get_close_matches(q_norm, all_normalized_names, n=1, cutoff=0.3)
        if close_matches:
            matched_name = close_matches[0]
            matched_rows = df[df['App_normalized'] == matched_name]
            if not matched_rows.empty:
                score = difflib.SequenceMatcher(None, q_norm, matched_name).ratio()
                if score > best_score:
                    best_score = score
                    best_row = matched_rows.iloc[0]
                    
    return best_row, best_score

# Helper for finding the closest category from the input text
def detect_category_from_text(query: str) -> Optional[str]:
    query_upper = query.upper().replace(' ', '_')
    for cat in CATEGORIES:
        if cat in query_upper:
            return cat
            
    # Keywords to category mappings
    category_keywords = {
        "GAME": ["GAME", "PLAY", "ARCADE", "PUZZLE", "SHOOTER", "RACING", "ACTION", "RPG", "BOARD", "CHESS", "SOLITAIRE"],
        "EDUCATION": ["LEARN", "SCHOOL", "STUDY", "TEACH", "KID", "CHILD", "CLASS", "MATH", "ALPHABET", "TUTOR"],
        "FINANCE": ["MONEY", "BANK", "PAY", "INVEST", "STOCK", "WALLET", "BUDGET", "CRYPTO", "CREDIT"],
        "HEALTH_AND_FITNESS": ["HEALTH", "FIT", "RUN", "WORKOUT", "DIET", "EXERCISE", "YOGA", "CALORIE", "WEIGHT"],
        "SOCIAL": ["SOCIAL", "CHAT", "MEET", "FRIEND", "SHARE", "TALK", "COMMUNITY", "MESSAGE", "FORUM"],
        "PHOTOGRAPHY": ["PHOTO", "CAMERA", "EDIT", "FILTER", "PIC", "IMAGE", "VIDEO", "COLLAGE", "SNAP"],
        "PRODUCTIVITY": ["TASK", "TODO", "NOTE", "CALENDAR", "OFFICE", "DOC", "SHEET", "PDF", "PRODUCTIVITY", "MEMO"],
        "BUSINESS": ["BUSINESS", "WORK", "JOB", "COMPANY", "MEET", "TEAM", "HIRE", "RESUME"],
        "TRAVEL_AND_LOCAL": ["TRAVEL", "MAP", "GPS", "NAVIGATE", "TRIP", "FLIGHT", "HOTEL", "LOCAL", "GUIDE"],
        "BOOKS_AND_REFERENCE": ["BOOK", "READ", "DICTIONARY", "LIBRARY", "WIKI", "BIBLE", "NOVEL", "READER"],
        "MEDICAL": ["DOCTOR", "MED", "DRUG", "CLINIC", "PATIENT", "HEALTHY", "CLINICAL"],
        "NEWS_AND_MAGAZINES": ["NEWS", "PAPER", "MAGAZINE", "JOURNAL", "ARTICLE", "FEED", "PRESS"],
        "SHOPPING": ["SHOP", "BUY", "STORE", "DEAL", "COUPON", "CART", "MALL", "SALE"],
        "WEATHER": ["WEATHER", "RAIN", "SNOW", "TEMP", "FORECAST", "WIND", "RADAR"]
    }
    for cat, keywords in category_keywords.items():
        for kw in keywords:
            if kw in query_upper:
                return cat
    return None

@app.get("/health")
def health():
    return {
        "status": "ok", 
        "model_loaded": model is not None,
        "dataset_loaded": dataset_df is not None
    }

@app.post("/predict", response_model=PredictionResponse)
def predict(payload: AppFeatures):
    app_name = payload.app_name
    category = payload.category
    installs = payload.installs
    reviews = payload.reviews
    app_type = payload.app_type
    
    matched_row = None
    best_score = 0.0
    
    # 1. Fuzzy matching lookup
    if app_name and dataset_df is not None:
        matched_row, best_score = find_best_match(app_name, dataset_df)
        
    # Check match status and confidence mapping
    if matched_row is not None and best_score >= 0.5:
        # Match found! Get reference values
        ds_installs = int(matched_row['Installs_numeric'])
        ds_reviews = int(matched_row['Reviews_numeric'])
        ds_category = str(matched_row['Category']).strip().upper()
        ds_type = str(matched_row['Type']).strip().capitalize()
        
        # Detect simulation overrides
        is_what_if = (
            (int(installs) != ds_installs and installs != 10000) or 
            (int(reviews) != ds_reviews and reviews != 250) or
            (str(category).strip().upper() != ds_category) or
            (str(app_type).strip().capitalize() != ds_type)
        )
        
        if is_what_if:
            # Custom simulation/sandbox mode: predict using overridden payload values
            source = "ML Model (Live - Simulation)"
            confidence = 92.0
        else:
            # Standard prediction: predict using reference values from the dataset
            category = ds_category
            installs = ds_installs
            reviews = ds_reviews
            app_type = ds_type
            
            if best_score == 1.0:
                confidence = 98.0
                source = f"ML Model (Live - Exact: {matched_row['App']})"
            else:
                # Continuous mapping for fuzzy match: [0.5, 1.0] -> [70.0, 95.0]
                confidence = round(70.0 + (best_score - 0.5) * 50.0, 1)
                source = f"ML Model (Live - Fuzzy: {matched_row['App']})"
    else:
        # 2. Fallback logic: No strong match found in dataset
        detected_cat = None
        if app_name:
            detected_cat = detect_category_from_text(app_name)
            
        if detected_cat:
            category = detected_cat
            source = f"ML Model (Live - Fallback Category: {category})"
        else:
            category = str(category).strip().upper()
            source = f"ML Model (Live - Fallback Category: {category})"
            
        # Use average feature values from that category
        stats = category_stats.get(category)
        if stats:
            installs = int(stats["avg_installs"])
            reviews = int(stats["avg_reviews"])
            app_type = stats["common_type"]
        else:
            # Absolute default values if stats are missing
            installs = 10000
            reviews = 250
            app_type = "Free"
            
        # Continuous mapping for fallback estimation: [0.0, 0.5] -> [50.0, 69.0]
        confidence = round(50.0 + best_score * 38.0, 1)

    # 3. Model Prediction (Inference using the LightGBM/RandomForest predictor)
    rating = None
    if model is not None:
        try:
            rating = model.predict(category, installs, reviews, app_type)
        except Exception as ex:
            print(f"ML Model Inference failed: {ex}")
            
    # Heuristic fallback if inference failed
    if rating is None:
        base_value = 4.15
        ratio = reviews / installs if installs > 0 else 0.0
        shap_engagement = 0.4 if ratio > 0.1 else (0.2 if ratio > 0.02 else -0.15)
        shap_type_price = 0.15 if app_type == "Paid" else 0.0
        shap_category = 0.05 if category in ["EDUCATION", "ART_AND_DESIGN", "BOOKS_AND_REFERENCE", "PRODUCTIVITY"] else (-0.05 if category in ["DATING", "LIFESTYLE", "SOCIAL"] else 0.0)
        
        rating = round(min(max(base_value + shap_engagement + shap_type_price + shap_category, 1.0), 5.0), 2)
        if "Fallback" not in source:
            source = "Heuristic Fallback Engine"

    return PredictionResponse(
        rating=rating,
        confidence=confidence,
        source=source
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
