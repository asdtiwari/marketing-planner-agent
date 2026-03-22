import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # MySQL Connection String (e.g., mysql+pymysql://root:password@localhost:3306/marketing_agent)
    DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@localhost/marketing_db")
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

settings = Settings()