// import type { NextRequest } from 'next/server';
// import { NextResponse } from 'next/server';

// import connectDB from '@/lib/mongodb';
// import Event, { IEvent } from '@/database/event.model';

// // Shape of the dynamic route parameters for this handler
// interface RouteParams {
// 	params: {
// 		slug?: string;
// 	};
// }

// // Successful response payload when an event is found
// interface EventSuccessResponse {
// 	message: string;
// 	event: IEvent;
// }

// // Error response payload used for all error cases
// interface ErrorResponse {
// 	message: string;
// 	error?: string;
// }

// // Basic validation for event slug (lowercase, alphanumeric, hyphen-separated)
// const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// export async function GET(
// 	_req: NextRequest,
// 	{ params }: RouteParams
// ): Promise<NextResponse<EventSuccessResponse | ErrorResponse>> {
// 	try {
// 		const { slug } = params;

// 		console.log(slug);

// 		// Validate presence of slug
// 		if (!slug) {
// 			return NextResponse.json<ErrorResponse>(
// 				{ message: 'Slug parameter is required' },
// 				{ status: 400 }
// 			);
// 		}

// 		// Validate slug format to catch obviously invalid values early
// 		if (!SLUG_REGEX.test(slug)) {
// 			return NextResponse.json<ErrorResponse>(
// 				{
// 					message: 'Invalid slug format',
// 					error:
// 						'Slug must be lowercase, alphanumeric, and may include single hyphens between words',
// 				},
// 				{ status: 400 }
// 			);
// 		}

// 		await connectDB();

// 		// Find a single event by its unique slug
// 		const event = await Event.findOne({ slug }).exec();

// 		if (!event) {
// 			return NextResponse.json<ErrorResponse>(
// 				{ message: 'Event not found' },
// 				{ status: 404 }
// 			);
// 		}

// 		console.log(event);

// 		return NextResponse.json<EventSuccessResponse>(
// 			{
// 				message: 'Event fetched successfully',
// 				event,
// 			},
// 			{ status: 200 }
// 		);
// 	} catch (error: unknown) {
// 		console.error('Error fetching event by slug:', error);

// 		return NextResponse.json<ErrorResponse>(
// 			{
// 				message: 'Failed to fetch event',
// 				error: error instanceof Error ? error.message : 'Unknown error',
// 			},
// 			{ status: 500 }
// 		);
// 	}
// }

import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Event, { IEvent } from '@/database/event.model';

// Define route params type for type safety
type RouteParams = {
	params: Promise<{
		slug: string;
	}>;
};

/**
 * GET /api/events/[slug]
 * Fetches a single events by its slug
 */
export async function GET(
	req: NextRequest,
	{ params }: RouteParams
): Promise<NextResponse> {
	try {
		// Connect to database
		await connectDB();

		// Await and extract slug from params
		const { slug } = await params;

		// Validate slug parameter
		if (!slug || typeof slug !== 'string' || slug.trim() === '') {
			return NextResponse.json(
				{ message: 'Invalid or missing slug parameter' },
				{ status: 400 }
			);
		}

		// Sanitize slug (remove any potential malicious input)
		const sanitizedSlug = slug.trim().toLowerCase();

		// Query events by slug
		const event = await Event.findOne({ slug: sanitizedSlug }).lean();

		// Handle events not found
		if (!event) {
			return NextResponse.json(
				{ message: `Event with slug '${sanitizedSlug}' not found` },
				{ status: 404 }
			);
		}

		// Return successful response with events data
		return NextResponse.json(
			{ message: 'Event fetched successfully', event },
			{ status: 200 }
		);
	} catch (error) {
		// Log error for debugging (only in development)
		if (process.env.NODE_ENV === 'development') {
			console.error('Error fetching events by slug:', error);
		}

		// Handle specific error types
		if (error instanceof Error) {
			// Handle database connection errors
			if (error.message.includes('MONGODB_URI')) {
				return NextResponse.json(
					{ message: 'Database configuration error' },
					{ status: 500 }
				);
			}

			// Return generic error with error message
			return NextResponse.json(
				{ message: 'Failed to fetch events', error: error.message },
				{ status: 500 }
			);
		}

		// Handle unknown errors
		return NextResponse.json(
			{ message: 'An unexpected error occurred' },
			{ status: 500 }
		);
	}
}
