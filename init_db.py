#!/usr/bin/env python3
"""
Database initialization script for Sajilo Sewa
Creates sample data for testing the application
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.user import db, User, ServiceProvider, ServiceCategory
from src.main import app
import json

def init_database():
    """Initialize database with sample data"""
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if data already exists
        if ServiceCategory.query.first():
            print("Database already initialized!")
            return
        
        print("Initializing database with sample data...")
        
        # Create service categories
        categories = [
            {'name': 'Plumber', 'description': 'Water pipe repairs, installations, and maintenance', 'icon': 'wrench'},
            {'name': 'Electrician', 'description': 'Electrical repairs, wiring, and installations', 'icon': 'zap'},
            {'name': 'Cleaner', 'description': 'House cleaning and maintenance services', 'icon': 'sparkles'},
            {'name': 'Tutor', 'description': 'Educational tutoring and teaching services', 'icon': 'book'},
            {'name': 'Mechanic', 'description': 'Vehicle repairs and maintenance', 'icon': 'settings'},
            {'name': 'Handyman', 'description': 'General repairs and maintenance work', 'icon': 'hammer'}
        ]
        
        for cat_data in categories:
            category = ServiceCategory(**cat_data)
            db.session.add(category)
        
        # Create demo customer
        customer = User(
            username='customer_demo',
            email='customer@demo.com',
            full_name='John Customer',
            phone='+977-9841234567',
            user_type='customer',
            location='Thamel, Kathmandu'
        )
        customer.set_password('password123')
        db.session.add(customer)
        
        # Create demo service provider
        provider_user = User(
            username='provider_demo',
            email='provider@demo.com',
            full_name='Ram Bahadur',
            phone='+977-9851234567',
            user_type='service_provider',
            location='Lalitpur, Kathmandu'
        )
        provider_user.set_password('password123')
        db.session.add(provider_user)
        
        # Commit users first to get IDs
        db.session.commit()
        
        # Create service provider profile
        provider_profile = ServiceProvider(
            user_id=provider_user.id,
            skills=json.dumps(['Plumbing', 'Electrical work']),
            hourly_rate=800.0,
            experience_years=5,
            description='Experienced plumber and electrician with 5+ years in Kathmandu. Available for all types of home repairs.',
            availability=json.dumps({
                'monday': '9:00-17:00',
                'tuesday': '9:00-17:00',
                'wednesday': '9:00-17:00',
                'thursday': '9:00-17:00',
                'friday': '9:00-17:00',
                'saturday': '9:00-15:00'
            }),
            rating=4.5,
            total_reviews=12,
            is_verified=True
        )
        db.session.add(provider_profile)
        
        # Create another service provider
        provider_user2 = User(
            username='cleaner_demo',
            email='cleaner@demo.com',
            full_name='Sita Sharma',
            phone='+977-9861234567',
            user_type='service_provider',
            location='Baneshwor, Kathmandu'
        )
        provider_user2.set_password('password123')
        db.session.add(provider_user2)
        
        # Commit to get ID
        db.session.commit()
        
        provider_profile2 = ServiceProvider(
            user_id=provider_user2.id,
            skills=json.dumps(['House Cleaning', 'Office Cleaning']),
            hourly_rate=500.0,
            experience_years=3,
            description='Professional cleaning service for homes and offices. Reliable and thorough cleaning with eco-friendly products.',
            availability=json.dumps({
                'monday': '8:00-16:00',
                'tuesday': '8:00-16:00',
                'wednesday': '8:00-16:00',
                'thursday': '8:00-16:00',
                'friday': '8:00-16:00',
                'saturday': '8:00-14:00'
            }),
            rating=4.8,
            total_reviews=25,
            is_verified=True
        )
        db.session.add(provider_profile2)
        
        # Commit all changes
        db.session.commit()
        
        print("Database initialized successfully!")
        print("\nDemo accounts created:")
        print("Customer: customer@demo.com / password123")
        print("Provider 1: provider@demo.com / password123")
        print("Provider 2: cleaner@demo.com / password123")

if __name__ == '__main__':
    init_database()

