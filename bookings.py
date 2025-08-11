from flask import Blueprint, jsonify, request, session
from src.models.user import User, Booking, ServiceCategory, db
from datetime import datetime

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/', methods=['GET'])
def get_bookings():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        user = User.query.get(user_id)
        
        # Get query parameters
        status = request.args.get('status')
        role = request.args.get('role')  # 'customer' or 'provider'
        
        # Base query based on user role
        if role == 'provider' or (not role and user.user_type == 'service_provider'):
            query = Booking.query.filter_by(provider_id=user_id)
        else:
            query = Booking.query.filter_by(customer_id=user_id)
        
        # Apply status filter
        if status:
            query = query.filter_by(status=status)
        
        bookings = query.order_by(Booking.created_at.desc()).all()
        return jsonify([booking.to_dict() for booking in bookings])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/', methods=['POST'])
def create_booking():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        data = request.json
        customer_id = session['user_id']
        
        # Validate customer is not booking themselves
        if customer_id == data['provider_id']:
            return jsonify({'error': 'Cannot book yourself'}), 400
        
        # Validate provider exists and is a service provider
        provider = User.query.get(data['provider_id'])
        if not provider or provider.user_type != 'service_provider':
            return jsonify({'error': 'Invalid service provider'}), 400
        
        # Validate service category exists
        category = ServiceCategory.query.get(data['service_category_id'])
        if not category:
            return jsonify({'error': 'Invalid service category'}), 400
        
        # Parse scheduled date
        scheduled_date = datetime.fromisoformat(data['scheduled_date'].replace('Z', '+00:00'))
        
        # Create booking
        booking = Booking(
            customer_id=customer_id,
            provider_id=data['provider_id'],
            service_category_id=data['service_category_id'],
            title=data['title'],
            description=data['description'],
            scheduled_date=scheduled_date,
            estimated_hours=data.get('estimated_hours'),
            customer_location=data['customer_location']
        )
        
        # Calculate total amount if hourly rate and estimated hours are provided
        if booking.estimated_hours and provider.service_provider_profile:
            booking.total_amount = booking.estimated_hours * provider.service_provider_profile.hourly_rate
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify(booking.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user_id = session['user_id']
    booking = Booking.query.get_or_404(booking_id)
    
    # Check if user is involved in this booking
    if booking.customer_id != user_id and booking.provider_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(booking.to_dict())

@bookings_bp.route('/<int:booking_id>/status', methods=['PUT'])
def update_booking_status():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        data = request.json
        user_id = session['user_id']
        booking_id = data.get('booking_id')
        new_status = data.get('status')
        
        booking = Booking.query.get_or_404(booking_id)
        
        # Check permissions based on status change
        if new_status == 'confirmed' and booking.provider_id != user_id:
            return jsonify({'error': 'Only provider can confirm booking'}), 403
        elif new_status == 'cancelled' and booking.customer_id != user_id and booking.provider_id != user_id:
            return jsonify({'error': 'Only customer or provider can cancel booking'}), 403
        elif new_status == 'in_progress' and booking.provider_id != user_id:
            return jsonify({'error': 'Only provider can start work'}), 403
        elif new_status == 'completed' and booking.provider_id != user_id:
            return jsonify({'error': 'Only provider can mark as completed'}), 403
        
        # Validate status transition
        valid_transitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['in_progress', 'cancelled'],
            'in_progress': ['completed', 'cancelled'],
            'completed': [],
            'cancelled': []
        }
        
        if new_status not in valid_transitions.get(booking.status, []):
            return jsonify({'error': f'Invalid status transition from {booking.status} to {new_status}'}), 400
        
        booking.status = new_status
        booking.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(booking.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/<int:booking_id>', methods=['PUT'])
def update_booking(booking_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        data = request.json
        user_id = session['user_id']
        booking = Booking.query.get_or_404(booking_id)
        
        # Only customer can update booking details, and only if pending
        if booking.customer_id != user_id:
            return jsonify({'error': 'Only customer can update booking'}), 403
        
        if booking.status != 'pending':
            return jsonify({'error': 'Can only update pending bookings'}), 400
        
        # Update allowed fields
        if 'title' in data:
            booking.title = data['title']
        if 'description' in data:
            booking.description = data['description']
        if 'scheduled_date' in data:
            booking.scheduled_date = datetime.fromisoformat(data['scheduled_date'].replace('Z', '+00:00'))
        if 'estimated_hours' in data:
            booking.estimated_hours = data['estimated_hours']
            # Recalculate total amount
            provider = User.query.get(booking.provider_id)
            if provider.service_provider_profile:
                booking.total_amount = booking.estimated_hours * provider.service_provider_profile.hourly_rate
        if 'customer_location' in data:
            booking.customer_location = data['customer_location']
        
        booking.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(booking.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/<int:booking_id>', methods=['DELETE'])
def delete_booking(booking_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        booking = Booking.query.get_or_404(booking_id)
        
        # Only customer can delete booking, and only if pending
        if booking.customer_id != user_id:
            return jsonify({'error': 'Only customer can delete booking'}), 403
        
        if booking.status != 'pending':
            return jsonify({'error': 'Can only delete pending bookings'}), 400
        
        db.session.delete(booking)
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

