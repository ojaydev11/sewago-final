from flask import Blueprint, jsonify, request, session
from src.models.user import User, ServiceProvider, db
import json

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            full_name=data['full_name'],
            phone=data.get('phone'),
            user_type=data['user_type'],
            location=data.get('location')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # If user is a service provider, create service provider profile
        if data['user_type'] == 'service_provider':
            provider_data = data.get('provider_profile', {})
            service_provider = ServiceProvider(
                user_id=user.id,
                skills=json.dumps(provider_data.get('skills', [])),
                hourly_rate=provider_data.get('hourly_rate', 0),
                experience_years=provider_data.get('experience_years'),
                description=provider_data.get('description'),
                availability=json.dumps(provider_data.get('availability', {}))
            )
            db.session.add(service_provider)
            db.session.commit()
        
        # Store user in session
        session['user_id'] = user.id
        session['user_type'] = user.user_type
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        user = User.query.filter_by(email=data['email']).first()
        
        if user and user.check_password(data['password']):
            if not user.is_active:
                return jsonify({'error': 'Account is deactivated'}), 403
            
            # Store user in session
            session['user_id'] = user.id
            session['user_type'] = user.user_type
            
            return jsonify({
                'message': 'Login successful',
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = user.to_dict()
    
    # Include service provider profile if applicable
    if user.user_type == 'service_provider' and user.service_provider_profile:
        user_data['provider_profile'] = user.service_provider_profile.to_dict()
    
    return jsonify({'user': user_data}), 200

@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        data = request.json
        user = User.query.get(session['user_id'])
        
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

