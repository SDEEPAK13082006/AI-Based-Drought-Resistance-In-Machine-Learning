import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.schemas import LoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

SECRET_KEY = "drought-management-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 # 24 hours

security = HTTPBearer()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token credentials")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials/token expired")

import re

def validate_password_strength(password: str) -> bool:
    has_letter = re.search(r'[a-zA-Z]', password) is not None
    has_number = re.search(r'[0-9]', password) is not None
    has_special = re.search(r'[^a-zA-Z0-9\s]', password) is not None
    return has_letter and has_number and has_special

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    username = request.username.strip()
    password = request.password.strip()
    
    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")
        
    if not validate_password_strength(password):
        raise HTTPException(
            status_code=400, 
            detail="Password must contain a combination of letters, numbers, and special characters (e.g. @, #, $)."
        )
        
    access_token = create_access_token(data={"sub": username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": username
    }


