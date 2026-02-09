# Rate Limiting Configuration

## Overview

Rate limiting has been implemented for the backend image endpoints to protect against abuse, prevent resource exhaustion, and ensure fair usage across all clients.

## Global Rate Limiter

A global rate limiter is applied to all API routes in `server.js`:
- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Key**: IP address

## Image Route Rate Limiters

Three separate rate limiters have been configured for different image endpoint categories:

### 1. Public Image Limiter
**Purpose**: Limits public image requests (gallery, slideshow)
- **Window**: 5 minutes
- **Max Requests**: 30 per window
- **Rate Limited By**: IP address
- **Applied to**:
  - `GET /api/images/public` - Get public images
  - `GET /api/images/gallery` - Get gallery images
  - `GET /api/images/slideshow` - Get slideshow images

### 2. Authenticated Image Limiter
**Purpose**: Limits authenticated image read operations
- **Window**: 5 minutes
- **Max Requests**: 50 per window
- **Rate Limited By**: User ID (authenticated user)
- **Applied to**:
  - `GET /api/images/my-images` - Get user's images
  - `GET /api/images/admin-gallery` - Get admin gallery
  - `GET /api/images/admin-gallery-all` - Get all images from ImageKit
  - `GET /api/images/:id` - Get specific image

### 3. Image Mutation Limiter
**Purpose**: Limits image write operations (create, update, delete)
- **Window**: 15 minutes
- **Max Requests**: 20 per window
- **Rate Limited By**: User ID (authenticated user)
- **Applied to**:
  - `POST /api/images` - Create new image
  - `PUT /api/images/:id/public` - Update public status
  - `PUT /api/images/:id/slideshow` - Update slideshow status
  - `PUT /api/images/reorder` - Reorder images
  - `DELETE /api/images/:id` - Delete image

## How It Works

### Rate Limiting Keys

- **Public Endpoints**: Limited by IP address to prevent abuse from external sources
- **Authenticated Endpoints**: Limited by User ID to allow fair usage per user while allowing different users to access simultaneously

### Response Headers

When rate limited is active, responses include standard rate limiting headers:
- `RateLimit-Limit`: Total requests allowed in the window
- `RateLimit-Remaining`: Requests remaining in current window
- `RateLimit-Reset`: Unix timestamp when the limit resets

### Rate Limit Errors

When a client exceeds the rate limit, they receive:
- **HTTP Status**: 429 (Too Many Requests)
- **Response Body**: Error message indicating too many requests

Example:
```json
{
  "message": "Too many image requests, please try again later"
}
```

## Configuration Example

```javascript
// Public image rate limiter
const publicImageLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,      // 5 minute window
  max: 30,                        // 30 requests per window
  message: 'Too many image requests, please try again later',
  standardHeaders: true,          // Include RateLimit headers
  legacyHeaders: false,           // Disable X-RateLimit headers
  keyGenerator: (req, res) => {
    return req.ip || req.connection.remoteAddress;
  }
});

// Usage in route
router.get('/gallery', publicImageLimiter, catchAsync(async (req, res) => {
  // Route handler
}));
```

## Adjusting Rate Limits

To modify rate limiting, edit the limiter configuration in [routes/images.js](../routes/images.js):

1. **publicImageLimiter**: For public endpoints
2. **authImageLimiter**: For authenticated read operations
3. **imageMutationLimiter**: For create/update/delete operations

Key parameters to adjust:
- `windowMs`: Time window in milliseconds
- `max`: Maximum requests allowed in the window
- `message`: Error message shown to users

## Security Considerations

1. **IP-based limiting for public endpoints**: Prevents external DoS attacks
2. **User-based limiting for authenticated endpoints**: Allows fair usage while preventing individual user abuse
3. **Stricter limits for mutations**: Write operations consume more resources
4. **Includes standard headers**: Clients can check when they can retry

## Monitoring

To monitor rate limiting in production:
1. Check response headers for rate limit information
2. Monitor 429 responses in your logging/monitoring system
3. Adjust limits based on observed usage patterns

## Future Enhancements

- Implement distributed rate limiting for multi-instance deployments
- Add different limits for premium users
- Create dynamic limits based on server load
- Add whitelist for trusted IPs (CDN, internal services)
