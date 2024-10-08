import mongoose, { ObjectId } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IdempotencyManager from "../utils/idempotencyManager";
import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";
import Listing from "../model/listingModel";
import Offering from "../model/offeringModel";

/**
 * Listing Service
 * @abstract findAll
 * @abstract findById
 * @abstract findBySlug
 * @abstract save
 * @abstract update
 * @abstract delete
 * @method findListingsByOffering
 * @method findOfferingById
 * @method findOfferingBySlug
 * @method saveOffering
 * @method updateOffering
 * @method deleteOffering
 */
export default abstract class ListingService {
  /** Retrieves a collection of listings
   * @public
   * @param queryString query filter object
   * @returns Promise<IListing[]>
   */
  abstract findAll(queryString?: Record<string, any>): Promise<IListing[]>;

  /** Retrieves a listing record using its id
   * @public
   * @param id the ObjectId of the document to find
   * @returns Promise<IListing | null>
   */
  abstract findById(id: string): Promise<IListing | null>;

  /** Retrieves a listing record using its slug
   * @public
   * @param slug the slug of the document to find
   * @returns Promise<IListing | null>
   */
  abstract findBySlug(slug: string): Promise<IListing | null>;

  /**
   * Creates a new listing record in collection
   * @public
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<void>
   */
  abstract save(key: string, data: Partial<IListing>): Promise<void>;

  /**
   * Updates a listing record using its id
   * @public
   * @param id the ObjectId of the document to update
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<any>
   */
  abstract update(
    id: string,
    key: string,
    data?: Partial<IListing | any>
  ): Promise<any>;

  /**
   * Deletes a listing record using its id
   * @public
   * @param id the ObjectId of the document to delete
   * @returns Promise<any>
   */
  abstract delete(id: string): Promise<any>;

  /** Retrieves a collection of listings based on offerings
   * that match search filter/criteria
   * @public
   * @param searchFilter query filter object
   * @returns Promise<IListing[]>
   */
  public async findListingsByOffering(searchFilter: {
    minArea?: number;
    maxArea?: number;
    name?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<IListing[]> {
    const { minArea, maxArea, name, minPrice, maxPrice } = searchFilter;

    //Build the query for offerings
    const query: Record<string, any> = {};

    // Filtering by name using a case-insensitive regex
    if (name !== undefined) {
      query.offeringType = { $regex: name, $options: "i" };
    }

    // Filtering by area size
    if (minArea !== undefined || maxArea !== undefined) {
      query["area.size"] = {};

      if (minArea !== undefined) query["area.size"].$gte = minArea;

      if (maxArea !== undefined) query["area.size"].$lte = maxArea;
    }

    // Filtering by price amount
    if (minPrice !== undefined || maxPrice !== undefined) {
      query["price.amount"] = {};

      if (minPrice !== undefined) query["price.amount"].$gte = minPrice;

      if (maxPrice !== undefined) query["price.amount"].$lte = maxPrice;
    }

    // Projection to retrieve only offering IDs
    const projection = { _id: 1 };

    const operation = async () => {
      // Find offering IDs based on the criteria
      const offerings = await Offering.find(query, projection).exec();

      const offeringIds = offerings.map((offering) => offering._id);

      if (!Array.isArray(offeringIds) || offeringIds.length === 0) {
        return []; // Defaults to an empty array if no matching offerings are found
      }

      // Find listings that contain these offering IDs
      const listings = await this.findAll({ offerings: { $in: offeringIds } });
      return listings;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a listing offering using its id
   * @public
   * @param id the ObjectId of the document to find
   * @returns Promise<IOffering | null>
   */
  async findOfferingById(id: string): Promise<IOffering | null> {
    const projection = { createdAt: 0, updatedAt: 0, __v: 0 };

    const operation = async () => {
      const offering = await Offering.findOne({ _id: id }, projection);

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a listing offering using its slug
   * @public
   * @param slug the slug of the document to find
   * @returns Promise<IOffering | null>
   */
  async findOfferingBySlug(slug: string): Promise<IOffering | null> {
    const projection = { createdAt: 0, updatedAt: 0, __v: 0 };

    const operation = async () => {
      const offering = await Offering.findOne({ slug: slug }, projection);

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /**
   * Creates a new offering on a listing
   * @public
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @param listingId listing id
   * @returns Promise<void>
   */
  public async saveOffering(
    key: string,
    payload: Partial<IOffering>,
    listingId: Partial<IListing> | any
  ): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const offering = await Offering.create([payload], { session: session });

      await IdempotencyManager.Create(key, session);

      await Listing.findOneAndUpdate(
        { _id: listingId },
        { $addToSet: { offerings: (offering as any)._id as ObjectId } },
        { new: true, session }
      );
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Updates a listing offering
   * @public
   * @param id the ObjectId of the document to update
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<void>
   */
  public async updateOffering(
    id: string,
    key: string,
    data: Partial<IOffering>
  ): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Offering.findByIdAndUpdate({ _id: id }, data, { session });

      await IdempotencyManager.Create(key, session);
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes a listing offering
   * @public
   * @param offeringId the ObjectId of the document to delete
   * @param listingId the ObjectId of the document to delete
   * @returns Promise<void>
   */
  public async deleteOffering(
    offeringId: string,
    listingId: string
  ): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const offering = (await Offering.findByIdAndDelete(
        { _id: offeringId },
        session
      )) as IOffering;

      await Listing.findOneAndUpdate(
        { _id: listingId },
        { $pull: { offerings: offering._id } },
        { session }
      );
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }
}
