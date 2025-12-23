/**
 * Guide Model
 *
 * Defines the Guide entity structure using Mongoose ODM.
 * Guides are local experts who offer tours and experiences.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Guide availability status.
 * - available: Ready to accept bookings
 * - busy: Currently engaged
 * - unavailable: Not accepting bookings
 */
export type GuideAvailability = 'available' | 'busy' | 'unavailable';

/**
 * Pricing structure for guide services.
 */
export interface GuidePricing {
	halfDay: number;
	fullDay: number;
	multiDay?: number;
	workshop?: number;
}

/**
 * Location info for guides (simplified, no full address needed).
 */
export interface GuideLocation {
	district: string;
	state: string;
}

/**
 * Complete Guide entity interface.
 */
export interface IGuide {
	name: string;
	bio: string;
	specializations: string[];
	languages: string[];
	experience: string;
	location: GuideLocation;
	pricing: GuidePricing;
	certifications?: string[];
	availability: GuideAvailability;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Guide document type (includes Mongoose Document properties).
 */
export interface IGuideDocument extends IGuide, Document {}

/**
 * Input type for creating a new guide.
 * Excludes auto-generated fields.
 */
export type CreateGuideInput = Omit<IGuide, 'createdAt' | 'updatedAt'>;

/**
 * Input type for updating a guide.
 * All fields are optional.
 */
export type UpdateGuideInput = Partial<Omit<IGuide, 'createdAt' | 'updatedAt'>>;

// ============================================================================
// Mongoose Schemas
// ============================================================================

/**
 * Location subdocument schema.
 */
const locationSchema = new Schema({
	district: { type: String, required: true },
	state: { type: String, required: true, default: 'Jharkhand' }
}, { _id: false });

/**
 * Pricing subdocument schema.
 */
const pricingSchema = new Schema({
	halfDay: { type: Number, required: true, min: 0 },
	fullDay: { type: Number, required: true, min: 0 },
	multiDay: { type: Number, required: false },
	workshop: { type: Number, required: false }
}, { _id: false });

/**
 * Main Guide schema.
 */
const guideSchema = new Schema<IGuideDocument>({
	name: {
		type: String,
		required: [true, 'Name is required'],
		trim: true,
		maxlength: 100
	},
	bio: {
		type: String,
		required: [true, 'Bio is required'],
		trim: true
	},
	specializations: {
		type: [String],
		required: true,
		validate: {
			validator: (v: string[]) => v.length > 0,
			message: 'At least one specialization is required'
		}
	},
	languages: {
		type: [String],
		required: true,
		validate: {
			validator: (v: string[]) => v.length > 0,
			message: 'At least one language is required'
		}
	},
	experience: {
		type: String,
		required: true
	},
	location: {
		type: locationSchema,
		required: true
	},
	pricing: {
		type: pricingSchema,
		required: true
	},
	certifications: {
		type: [String],
		required: false
	},
	availability: {
		type: String,
		enum: ['available', 'busy', 'unavailable'],
		default: 'available'
	}
}, {
	timestamps: true,
	collection: 'guides'
});

// ============================================================================
// Indexes
// ============================================================================

guideSchema.index({ specializations: 1 });
guideSchema.index({ availability: 1 });
guideSchema.index({ 'location.district': 1 });
guideSchema.index({ name: 'text', bio: 'text' }); // Text search index

// ============================================================================
// Model Export
// ============================================================================

/**
 * Guide Mongoose model.
 */
export const GuideModel: Model<IGuideDocument> = mongoose.model<IGuideDocument>('Guide', guideSchema);
