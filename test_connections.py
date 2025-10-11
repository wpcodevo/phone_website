#!/usr/bin/env python3
"""
Test script to diagnose connection issues
"""
import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient
import smtplib
import requests
from email.mime.text import MIMEText

load_dotenv()

def test_mongodb():
    """Test MongoDB connection"""
    print("🔍 Testing MongoDB connection...")
    try:
        MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
        MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'phonestoredb')
        
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
        # Test the connection
        client.admin.command('ping')
        db = client.get_database(MONGO_DB_NAME)
        
        # Test collections
        collections = db.list_collection_names()
        print(f"✅ MongoDB connected successfully!")
        print(f"   Database: {MONGO_DB_NAME}")
        print(f"   Collections: {collections}")
        
        # Test basic operations
        users_count = db.users.estimated_document_count()
        products_count = db.products.estimated_document_count()
        print(f"   Users: {users_count}, Products: {products_count}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("💡 Solutions:")
        print("   1. Make sure MongoDB is running: mongod --dbpath=<path>")
        print("   2. Check if MongoDB service is started")
        print("   3. Verify MONGO_URI in .env file")
        return False

def test_smtp():
    """Test SMTP connection"""
    print("\\n🔍 Testing SMTP connection...")
    try:
        SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        SMTP_PORT = int(os.getenv('SMTP_PORT', '465'))
        FROM_EMAIL = os.getenv('SMTP_FROM_EMAIL')
        FROM_PASSWORD = os.getenv('SMTP_FROM_PASSWORD')
        
        if not FROM_EMAIL or not FROM_PASSWORD:
            print("⚠️  SMTP credentials not configured")
            print("   FROM_EMAIL and FROM_PASSWORD needed in .env")
            return False
            
        # Test connection with timeout
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, timeout=10) as server:
            server.login(FROM_EMAIL, FROM_PASSWORD)
            print(f"✅ SMTP connected successfully!")
            print(f"   Server: {SMTP_SERVER}:{SMTP_PORT}")
            print(f"   Email: {FROM_EMAIL}")
            
        return True
        
    except smtplib.SMTPAuthenticationError:
        print("❌ SMTP Authentication failed")
        print("💡 Solutions:")
        print("   1. Check email and password in .env")
        print("   2. Enable 2FA and use App Password for Gmail")
        print("   3. Allow less secure apps (not recommended)")
        return False
    except Exception as e:
        print(f"❌ SMTP connection failed: {e}")
        print("💡 Solutions:")
        print("   1. Check internet connection")
        print("   2. Verify SMTP server and port")
        print("   3. Check firewall settings")
        return False

def test_gemini_api():
    """Test Gemini API connection"""
    print("\\n🔍 Testing Gemini API connection...")
    try:
        api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        
        if not api_key:
            print("⚠️  Gemini API key not configured")
            print("   GEMINI_API_KEY needed in .env")
            return False
            
        # Test API with a simple request (timeout in 10 seconds)
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            print("✅ Gemini API connected successfully!")
            print(f"   API Key: {api_key[:10]}...{api_key[-4:]}")
            return True
        else:
            print(f"❌ Gemini API error: {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Gemini API timeout")
        print("💡 Check internet connection")
        return False
    except Exception as e:
        print(f"❌ Gemini API connection failed: {e}")
        return False

def test_network():
    """Test general network connectivity"""
    print("\\n🔍 Testing network connectivity...")
    try:
        # Test basic internet connectivity
        response = requests.get("https://www.google.com", timeout=5)
        if response.status_code == 200:
            print("✅ Internet connection working")
            return True
        else:
            print("❌ Internet connection issues")
            return False
    except Exception as e:
        print(f"❌ Network test failed: {e}")
        return False

def main():
    print("🔧 Connection Diagnostics Tool")
    print("=" * 40)
    
    # Test all connections
    results = {
        'network': test_network(),
        'mongodb': test_mongodb(), 
        'smtp': test_smtp(),
        'gemini': test_gemini_api()
    }
    
    print("\\n📊 Summary:")
    print("=" * 40)
    for service, status in results.items():
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {service.upper()}: {'OK' if status else 'FAILED'}")
    
    if not any(results.values()):
        print("\\n🚨 All connections failed - check network/firewall")
    elif results['network'] and not results['mongodb']:
        print("\\n💡 Start MongoDB: mongod --dbpath=C:/data/db")
    
    return results

if __name__ == "__main__":
    main()