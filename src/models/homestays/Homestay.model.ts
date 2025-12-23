/**
 * Homestay Model
 *
 * Defines the Homestay entity structure using Mongoose ODM.
 * Homestays represent accommodation listings available for booking.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Property type options for homestays.
 * - entire: Entire property rental
 * - private: Private room within a property
 * - shared: Shared space
 */
export type PropertyType = 'entire' | 'private' | 'shared';

/**
 * Homestay listing status.
 * - active: Available for booking
 * - inactive: Temporarily unavailable
 * - pending: Awaiting approval
 */
export type HomestayStatus = 'active' | 'inactive' | 'pending';

/**
 * Pricing structure for homestays.
 */
export interface HomestayPricing {
	basePrice: number;
	cleaningFee?: number;
	weekendPrice?: number;
}

/**
 * Capacity details for a homestay.
 */
export interface HomestayCapacity {
	guests: number;
	bedrooms: number;
	beds: number;
	bathrooms: number;
}

/**
 * Location structure for homestays.
 */
export interface HomestayLocation {
	address: string;
	district: string;
	state: string;
	coordinates?: {
		lat: number;
		lng: number;
	};
}

/**
 * Complete Homestay entity interface.
 */
export interface IHomestay {
	title: string;
	description: string;
	propertyType: PropertyType;
	location: HomestayLocation;
	pricing: HomestayPricing;
	capacity: HomestayCapacity;
	amenities: string[];
	houseRules?: string[];
	images: string[];
	status: HomestayStatus;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Homestay document type (includes Mongoose Document properties).
 */
export interface IHomestayDocument extends IHomestay, Document {}

/**
 * Input type for creating a new homestay.
 * Excludes auto-generated fields.
 */
export type CreateHomestayInput = Omit<IHomestay, 'status' | 'createdAt' | 'updatedAt'>;

/**
 * Input type for updating a homestay.
 * All fields are optional.
 */
export type UpdateHomestayInput = Partial<Omit<IHomestay, 'createdAt' | 'updatedAt'>>;

// ============================================================================
// Mongoose Schemas
// ============================================================================

/**
 * Coordinates subdocument schema.
 */
const coordinatesSchema = new Schema({
	lat: { type: Number, required: true },
	lng: { type: Number, required: true }
}, { _id: false });

/**
 * Location subdocument schema.
 */
const locationSchema = new Schema({
	address: { type: String, required: true },
	district: { type: String, required: true },
	state: { type: String, required: true, default: 'Jharkhand' },
	coordinates: { type: coordinatesSchema, required: false }
}, { _id: false });

/**
 * Pricing subdocument schema.
 */
const pricingSchema = new Schema({
	basePrice: { type: Number, required: true, min: 100 },
	cleaningFee: { type: Number, required: false },
	weekendPrice: { type: Number, required: false }
}, { _id: false });

/**
 * Capacity subdocument schema.
 */
const capacitySchema = new Schema({
	guests: { type: Number, required: true, min: 1 },
	bedrooms: { type: Number, required: true, min: 0 },
	beds: { type: Number, required: true, min: 1 },
	bathrooms: { type: Number, required: true, min: 0 }
}, { _id: false });

/**
 * Main Homestay schema.
 */
const homestaySchema = new Schema<IHomestayDocument>({
	title: {
		type: String,
		required: [true, 'Title is required'],
		trim: true,
		maxlength: 200
	},
	description: {
		type: String,
		required: [true, 'Description is required'],
		trim: true
	},
	propertyType: {
		type: String,
		enum: ['entire', 'private', 'shared'],
		required: true,
		default: 'entire'
	},
	location: {
		type: locationSchema,
		required: true
	},
	pricing: {
		type: pricingSchema,
		required: true
	},
	capacity: {
		type: capacitySchema,
		required: true
	},
	amenities: {
		type: [String],
		default: []
	},
	houseRules: {
		type: [String],
		required: false
	},
	images: {
		type: [String],
		default: []
	},
	status: {
		type: String,
		enum: ['active', 'inactive', 'pending'],
		default: 'active'
	}
}, {
	timestamps: true, // Automatically manages createdAt and updatedAt
	collection: 'homestays'
});

// ============================================================================
// Indexes
// ============================================================================

homestaySchema.index({ 'location.district': 1 });
homestaySchema.index({ 'pricing.basePrice': 1 });
homestaySchema.index({ status: 1 });
homestaySchema.index({ title: 'text', description: 'text' }); // Text search index

// ============================================================================
// Model Export
// ============================================================================

/**
 * Homestay Mongoose model.
 */
export const HomestayModel: Model<IHomestayDocument> = mongoose.model<IHomestayDocument>('Homestay', homestaySchema);
