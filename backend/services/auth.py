# backend/services/auth.py

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import bcrypt
# Passlib/Bcrypt 4.0+ compatibility patch
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type('About', (object,), {'__version__': getattr(bcrypt, '__version__', '4.0.0')})

from database.models import User

# ── Password Hashing ─────────────────────────────────────────────
try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
except ImportError:
    print("WARNING: passlib not installed. Install with: pip install passlib bcrypt")
    pwd_context = None


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    if not pwd_context:
        raise Exception("passlib not installed")
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    if not pwd_context:
        return False
    return pwd_context.verify(plain_password, hashed_password)


# ── JWT Token Management ────────────────────────────────────────
try:
    from jose import JWTError, jwt
except ImportError:
    print("WARNING: python-jose not installed. Install with: pip install python-jose")
    jwt = None

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def create_token(data: dict, expires_delta: timedelta = None) -> str:
    """Create a JWT token."""
    if not jwt:
        raise Exception("python-jose not installed")
    
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decode a JWT token."""
    if not jwt:
        return None
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# ── User Management ─────────────────────────────────────────────
def create_user(db: Session, name: str, email: str, password: str) -> User:
    """Create a new user."""
    try:
        hashed_pwd = hash_password(password)
        user = User(
            name=name,
            email=email,
            password=hashed_pwd,
            plan="free",
            analyses_used=0
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        print(f"Error creating user: {e}")
        raise


def authenticate_user(db: Session, email: str, password: str) -> User:
    """Authenticate a user by email and password."""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user


def get_user_by_email(db: Session, email: str) -> User:
    """Get a user by email."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User:
    """Get a user by ID."""
    return db.query(User).filter(User.id == user_id).first()


# ── Usage Limits ─────────────────────────────────────────────────
PLAN_LIMITS = {
    "free": 50,
    "pro": 100,
    "enterprise": 1000
}


def check_usage_limit(user: User) -> dict:
    """Check if user has remaining analyses in their plan."""
    limit = PLAN_LIMITS.get(user.plan, 5)
    used = user.analyses_used
    remaining = max(0, limit - used)
    allowed = remaining > 0
    
    return {
        "limit": limit,
        "used": used,
        "remaining": remaining,
        "allowed": allowed
    }


def reset_monthly_usage(db: Session):
    """Reset monthly usage for all users (call this via a scheduled task)."""
    users = db.query(User).all()
    for user in users:
        user.analyses_used = 0
    db.commit()