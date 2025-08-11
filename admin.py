from flask import Blueprint, jsonify, request
from src.models.user import db, User, ServiceProvider, ServiceCategory, Booking
from functools import wraps

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to require admin access"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # For demo purposes, we'll allow any authenticated user to access admin
        # In production, you'd check for admin role
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    """Get platform statistics"""
    try:
        total_users = User.query.count()
        total_providers = ServiceProvider.query.count()
        total_bookings = Booking.query.count() if hasattr(Booking, 'query') else 0
        total_categories = ServiceCategory.query.count()
        
        stats = {
            'totalUsers': total_users,
            'totalProviders': total_providers,
            'totalBookings': total_bookings,
            'totalCategories': total_categories
        }
        
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all users for admin management"""
    try:
        users = User.query.all()
        users_data = []
        
        for user in users:
            users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'phone': user.phone,
                'user_type': user.user_type,
                'location': user.location,
                'is_active': user.is_active,
                'created_at': user.created_at.isoformat()
            })
        
        return jsonify(users_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['POST'])
@admin_required
def toggle_user_status(user_id):
    """Toggle user active status"""
    try:
        user = User.query.get_or_404(user_id)
        user.is_active = not user.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'User status updated to {"active" if user.is_active else "inactive"}',
            'is_active': user.is_active
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/providers/<int:provider_id>/toggle-verification', methods=['POST'])
@admin_required
def toggle_provider_verification(provider_id):
    """Toggle service provider verification status"""
    try:
        provider = ServiceProvider.query.get_or_404(provider_id)
        provider.is_verified = not provider.is_verified
        db.session.commit()
        
        return jsonify({
            'message': f'Provider verification updated to {"verified" if provider.is_verified else "unverified"}',
            'is_verified': provider.is_verified
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/providers', methods=['GET'])
@admin_required
def get_all_providers_admin():
    """Get all service providers for admin management"""
    try:
        providers = ServiceProvider.query.join(User).all()
        providers_data = []
        
        for provider in providers:
            providers_data.append({
                'id': provider.id,
                'user_id': provider.user_id,
                'skills': provider.skills,
                'hourly_rate': provider.hourly_rate,
                'experience_years': provider.experience_years,
                'description': provider.description,
                'rating': provider.rating,
                'total_reviews': provider.total_reviews,
                'is_verified': provider.is_verified,
                'created_at': provider.created_at.isoformat(),
                'user': {
                    'id': provider.user.id,
                    'username': provider.user.username,
                    'email': provider.user.email,
                    'full_name': provider.user.full_name,
                    'phone': provider.user.phone,
                    'location': provider.user.location,
                    'is_active': provider.user.is_active
                }
            })
        
        return jsonify(providers_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

