from flask import Blueprint, jsonify, request, session
from src.models.user import User, Review, Booking, ServiceProvider, db
from sqlalchemy import func

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/', methods=['GET'])
def get_reviews():
    try:
        # Get query parameters
        provider_id = request.args.get('provider_id', type=int)
        customer_id = request.args.get('customer_id', type=int)
        booking_id = request.args.get('booking_id', type=int)
        
        query = Review.query
        
        if provider_id:
            query = query.filter_by(provider_id=provider_id)
        if customer_id:
            query = query.filter_by(customer_id=customer_id)
        if booking_id:
            query = query.filter_by(booking_id=booking_id)
        
        reviews = query.order_by(Review.created_at.desc()).all()
        return jsonify([review.to_dict() for review in reviews])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/', methods=['POST'])
def create_review():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        data = request.json
        customer_id = session['user_id']
        
        # Validate booking exists and is completed
        booking = Booking.query.get(data['booking_id'])
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        if booking.customer_id != customer_id:
            return jsonify({'error': 'You can only review your own bookings'}), 403
        
        if booking.status != 'completed':
            return jsonify({'error': 'Can only review completed bookings'}), 400
        
        # Check if review already exists
        existing_review = Review.query.filter_by(booking_id=booking.id).first()
        if existing_review:
            return jsonify({'error': 'Review already exists for this booking'}), 400
        
        # Validate rating
        rating = data['rating']
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        # Create review
        review = Review(
            customer_id=customer_id,
            provider_id=booking.provider_id,
            booking_id=booking.id,
            rating=rating,
            comment=data.get('comment', '')
        )
        
        db.session.add(review)
        
        # Update service provider's rating
        update_provider_rating(booking.provider_id)
        
        db.session.commit()
        
        return jsonify(review.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/<int:review_id>', methods=['GET'])
def get_review(review_id):
    review = Review.query.get_or_404(review_id)
    return jsonify(review.to_dict())

@reviews_bp.route('/<int:review_id>', methods=['PUT'])
def update_review(review_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        data = request.json
        user_id = session['user_id']
        review = Review.query.get_or_404(review_id)
        
        # Only the customer who wrote the review can update it
        if review.customer_id != user_id:
            return jsonify({'error': 'You can only update your own reviews'}), 403
        
        # Update review fields
        if 'rating' in data:
            rating = data['rating']
            if not isinstance(rating, int) or rating < 1 or rating > 5:
                return jsonify({'error': 'Rating must be between 1 and 5'}), 400
            review.rating = rating
        
        if 'comment' in data:
            review.comment = data['comment']
        
        # Update service provider's rating
        update_provider_rating(review.provider_id)
        
        db.session.commit()
        
        return jsonify(review.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
def delete_review(review_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        review = Review.query.get_or_404(review_id)
        
        # Only the customer who wrote the review can delete it
        if review.customer_id != user_id:
            return jsonify({'error': 'You can only delete your own reviews'}), 403
        
        provider_id = review.provider_id
        db.session.delete(review)
        
        # Update service provider's rating
        update_provider_rating(provider_id)
        
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/provider/<int:provider_id>/stats', methods=['GET'])
def get_provider_review_stats(provider_id):
    try:
        # Get rating distribution
        rating_stats = db.session.query(
            Review.rating,
            func.count(Review.id).label('count')
        ).filter_by(provider_id=provider_id).group_by(Review.rating).all()
        
        # Get average rating and total reviews
        avg_rating = db.session.query(func.avg(Review.rating)).filter_by(provider_id=provider_id).scalar()
        total_reviews = db.session.query(func.count(Review.id)).filter_by(provider_id=provider_id).scalar()
        
        # Format rating distribution
        rating_distribution = {str(i): 0 for i in range(1, 6)}
        for rating, count in rating_stats:
            rating_distribution[str(rating)] = count
        
        return jsonify({
            'provider_id': provider_id,
            'average_rating': round(avg_rating, 2) if avg_rating else 0,
            'total_reviews': total_reviews or 0,
            'rating_distribution': rating_distribution
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def update_provider_rating(provider_id):
    """Update the cached rating for a service provider"""
    try:
        # Calculate new average rating
        avg_rating = db.session.query(func.avg(Review.rating)).filter_by(provider_id=provider_id).scalar()
        total_reviews = db.session.query(func.count(Review.id)).filter_by(provider_id=provider_id).scalar()
        
        # Update service provider record
        provider = ServiceProvider.query.filter_by(user_id=provider_id).first()
        if provider:
            provider.rating = round(avg_rating, 2) if avg_rating else 0.0
            provider.total_reviews = total_reviews or 0
            
    except Exception as e:
        # Log error but don't raise to avoid breaking the main operation
        print(f"Error updating provider rating: {e}")

