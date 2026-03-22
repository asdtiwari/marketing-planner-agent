from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError # Import this for safe error handling
from app.core.database import get_db
from app.models.user import User
from app.models.organization import Organization
from app.schemas.user_schema import UserCreate, UserLogin, Token
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_org = db.query(Organization).filter(Organization.name == user_data.org_name).first()
    if existing_org:
        raise HTTPException(status_code=400, detail="Organization name already taken. Please choose another.")

    try:
        # 1. Stage the Organization
        new_org = Organization(name=user_data.org_name)
        db.add(new_org)
        
        # db.flush() assigns the new_org.id without permanently committing to the database
        db.flush() 

        # 2. Stage the User
        hashed_pw = get_password_hash(user_data.password)
        new_user = User(email=user_data.email, hashed_password=hashed_pw, organization_id=new_org.id)
        db.add(new_user)
        
        # 3. ATOMIC COMMIT: Save both Organization and User at the exact same time
        db.commit()
        db.refresh(new_user)
        db.refresh(new_org)
        
    except Exception as e:
        # If ANYTHING goes wrong (like a bcrypt error), cancel the entire transaction
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal Server Error during registration.")

    # 4. Generate JWT
    access_token = create_access_token(data={"sub": new_user.email, "org_id": new_org.id})
    return {"access_token": access_token, "token_type": "bearer"}

# ... (Keep your login_user endpoint the same below)
@router.post("/login", response_model=Token)
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate JWT upon successful login
    access_token = create_access_token(data={"sub": user.email, "org_id": user.organization_id})
    return {"access_token": access_token, "token_type": "bearer"}