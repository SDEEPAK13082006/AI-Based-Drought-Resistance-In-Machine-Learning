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

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    username = request.username.strip().lower()
    password = request.password.strip()
    
    # Case-insensitive username and trimmed whitespace check
    if username == "admin" and password == "password123":
        access_token = create_access_token(data={"sub": request.username})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "username": request.username
        }
    raise HTTPException(status_code=401, detail="Invalid username or password")

