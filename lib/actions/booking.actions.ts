'use server';

import { Booking } from '@/database';
import connectDB from '../mongodb';

export const CreateBooking = async ({
	eventId,
	slug,
	email,
}: {
	eventId: string;
	slug: string;
	email: string;
}) => {
	try {
		await connectDB();

		await Booking.create({ eventId, slug, email });

		return { success: true };
	} catch {
		console.error('Create booking failed');
		return { success: false };
	}
};
