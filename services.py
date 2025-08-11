from flask import Blueprint, jsonify, request, session
from src.models.user import User, ServiceProvider, ServiceCategory, db
import json

services_bp = Blueprint('services', __name__)

# Service Categories
@services_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = ServiceCategory.query.filter_by(is_active=True).all()
    return jsonify([category.to_dict() for category in categories])

@services_bp.route('/categories', methods=['POST'])
def create_category():
    # Admin only - for now, allow any authenticated user
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        data = request.json
        category = ServiceCategory(
            name=data['name'],
            description=data.get('description'),
            icon=data.get('icon')
        )
        db.session.add(category)
        db.session.commit()
        
        return jsonify(category.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Service Providers
@services_bp.route('/providers', methods=['GET'])
def get_providers():
    try:
        # Get query parameters for filtering
        category = request.args.get('category')
        location = request.args.get('location')
        min_rating = request.args.get('min_rating', type=float)
        max_rate = request.args.get('max_rate', type=float)
        search = request.args.get('search')
        
        # Base query
        query = ServiceProvider.query.join(User).filter(User.is_active == True)
        
        # Apply filters
        if category:
            # Filter by skills containing the category
            query = query.filter(ServiceProvider.skills.contains(category))
        
        if location:
            query = query.filter(User.location.contains(location))
        
        if min_rating:
            query = query.filter(ServiceProvider.rating >= min_rating)
        
        if max_rate:
            query = query.filter(ServiceProvider.hourly_rate <= max_rate)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    User.full_name.contains(search_term),
                    ServiceProvider.description.contains(search_term),
                    ServiceProvider.skills.contains(search_term)
                )
            )
        
        providers = query.all()
        return jsonify([provider.to_dict() for provider in providers])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@services_bp.route('/providers/<int:provider_id>', methods=['GET'])
def get_provider(provider_id):
    provider = ServiceProvider.query.get_or_404(provider_id)
    return jsonify(provider.to_dict())

@services_bp.route('/providers/profile', methods=['GET'])
def get_my_provider_profile():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(session['user_id'])
    if user.user_type != 'service_provider':
        return jsonify({'error': 'Not a service provider'}), 403
    
    if not user.service_provider_profile:
        return jsonify({'error': 'Provider profile not found'}), 404
    
    return jsonify(user.service_provider_profile.to_dict())

@services_bp.route('/providers/profile', methods=['PUT'])
def update_provider_profile():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        user = User.query.get(session['user_id'])
        if user.user_type != 'service_provider':
            return jsonify({'error': 'Not a service provider'}), 403
        
        data = request.json
        provider = user.service_provider_profile
        
        if not provider:
            # Create new provider profile
            provider = ServiceProvider(user_id=user.id)
            db.session.add(provider)
        
        # Update provider fields
        if 'skills' in data:
            provider.skills = json.dumps(data['skills'])
        if 'hourly_rate' in data:
            provider.hourly_rate = data['hourly_rate']
        if 'experience_years' in data:
            provider.experience_years = data['experience_years']
        if 'description' in data:
            provider.description = data['description']
        if 'availability' in data:
            provider.availability = json.dumps(data['availability'])
        
        db.session.commit()
        return jsonify(provider.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@services_bp.route('/providers/<int:provider_id>/reviews', methods=['GET'])
def get_provider_reviews(provider_id):
    from src.models.user import Review
    
    provider = ServiceProvider.query.get_or_404(provider_id)
    reviews = Review.query.filter_by(provider_id=provider.user_id).order_by(Review.created_at.desc()).all()
    
    return jsonify([review.to_dict() for review in reviews])

# Initialize default service categories
@services_bp.route('/init-categories', methods=['POST'])
def init_categories():
    try:
        default_categories = [
            {'name': 'Plumber', 'description': 'Water pipe repairs, installations, and maintenance', 'icon': 'wrench'},
            {'name': 'Electrician', 'description': 'Electrical repairs, wiring, and installations', 'icon': 'zap'},
            {'name': 'Cleaner', 'description': 'House cleaning and maintenance services', 'icon': 'sparkles'},
            {'name': 'Tutor', 'description': 'Educational tutoring and teaching services', 'icon': 'book'},
            {'name': 'Mechanic', 'description': 'Vehicle repairs and maintenance', 'icon': 'settings'},
            {'name': 'Handyman', 'description': 'General repairs and maintenance work', 'icon': 'hammer'}
        ]
        
        for cat_data in default_categories:
            existing = ServiceCategory.query.filter_by(name=cat_data['name']).first()
            if not existing:
                category = ServiceCategory(**cat_data)
                db.session.add(category)
        
        db.session.commit()
        return jsonify({'message': 'Categories initialized successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

