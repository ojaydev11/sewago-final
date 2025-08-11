from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    user_type = db.Column(db.String(20), nullable=False)  # 'customer' or 'service_provider'
    location = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    service_provider_profile = db.relationship('ServiceProvider', backref='user', uselist=False)
    bookings_as_customer = db.relationship('Booking', foreign_keys='Booking.customer_id', backref='customer')
    bookings_as_provider = db.relationship('Booking', foreign_keys='Booking.provider_id', backref='provider')
    reviews_given = db.relationship('Review', foreign_keys='Review.customer_id', backref='reviewer')
    reviews_received = db.relationship('Review', foreign_keys='Review.provider_id', backref='reviewed_provider')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'user_type': self.user_type,
            'location': self.location,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active
        }

class ServiceProvider(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    skills = db.Column(db.Text, nullable=False)  # JSON string of skills array
    hourly_rate = db.Column(db.Float, nullable=False)
    experience_years = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=True)
    availability = db.Column(db.Text, nullable=True)  # JSON string of availability
    rating = db.Column(db.Float, default=0.0)
    total_reviews = db.Column(db.Integer, default=0)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'skills': self.skills,
            'hourly_rate': self.hourly_rate,
            'experience_years': self.experience_years,
            'description': self.description,
            'availability': self.availability,
            'rating': self.rating,
            'total_reviews': self.total_reviews,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user': self.user.to_dict() if self.user else None
        }

class ServiceCategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    icon = db.Column(db.String(50), nullable=True)
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'is_active': self.is_active
        }

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    service_category_id = db.Column(db.Integer, db.ForeignKey('service_category.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    scheduled_date = db.Column(db.DateTime, nullable=False)
    estimated_hours = db.Column(db.Float, nullable=True)
    total_amount = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, in_progress, completed, cancelled
    customer_location = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    service_category = db.relationship('ServiceCategory', backref='bookings')

    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'provider_id': self.provider_id,
            'service_category_id': self.service_category_id,
            'title': self.title,
            'description': self.description,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'estimated_hours': self.estimated_hours,
            'total_amount': self.total_amount,
            'status': self.status,
            'customer_location': self.customer_location,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'customer': self.customer.to_dict() if self.customer else None,
            'provider': self.provider.to_dict() if self.provider else None,
            'service_category': self.service_category.to_dict() if self.service_category else None
        }

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    booking = db.relationship('Booking', backref='review')

    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'provider_id': self.provider_id,
            'booking_id': self.booking_id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'customer': self.reviewer.to_dict() if self.reviewer else None,
            'booking': self.booking.to_dict() if self.booking else None
        }
