import BadRequestError from "../error/badrequestError";
import HttpCode from "../enum/httpCode";
import LeaseService from "../service/leaseService";
import ListingInterface from "../interface/listingInterface";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";
import PaymentRequiredError from "../error/paymentrequiredError";

/**
 * Creates a new lease listing in collection
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const createListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const key = req.headers["idempotency-key"] as string;

    const payload = req.body as object;

    const provider = {
      id: req.headers["provider-id"] as string,
      email: req.headers["provider-email"] as string,
    };

    Object.assign(payload, { provider: provider });

    await LeaseService.Create().save(key, payload);

    return res.status(HttpCode.CREATED).json({ data: null });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves collection of listings for lease
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = req.query;

    const listings = await LeaseService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves collection of listings for lease based on search query
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const search = req.query.search as string;

    if (!search) throw new BadRequestError(`Kindly enter a text to search`);

    const searchQuery = { $text: { $search: search } };

    const listings = await LeaseService.Create().findAll(searchQuery);

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves collection of listings for lease near user's current location
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveNearme = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = req.query;

    const listings = await LeaseService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves listing for lease based on a particular provider
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveByProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const providerId = req.params.providerId as string;

    const queryString = { provider: { id: providerId } };

    const listings = await LeaseService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves listings for lease based on type: economy | premium | luxury
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveByType = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const type = req.params.type as string;

    const queryString = { type: type };

    const listings = await LeaseService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves listings for lease based on category: residential | commercial | mixed
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const category = req.params.category as string;

    const queryString = { category: category };

    const listings = await LeaseService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves a listing for lease by its slug
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const listing = req.listing as ListingInterface;

    return res.status(HttpCode.OK).json({ data: listing });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves a listing for lease by its id
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const listing = req.listing as ListingInterface;

    return res.status(HttpCode.OK).json({ data: listing });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Finds and modifies a listing for lease using its id
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const updateListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;

    const key = req.headers["idempotency-key"] as string;

    const body = req.body as object;

    const listing = await LeaseService.Create().update(id, key, body);

    if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

    return res.status(HttpCode.MODIFIED).json({ data: null });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Finds and removes a listing for lease using its id
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const deleteListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;

    const listing = await LeaseService.Create().delete(id);

    if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

    return res.status(HttpCode.MODIFIED).json({ data: null });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Modifies the status of a listing for lease
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const changeStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;

    const key = req.headers["idempotency-key"] as string;

    const status = req.body as boolean;

    const data = { verify: { status: status } };

    const listing = await LeaseService.Create().update(id, key, data);

    if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

    return res.status(HttpCode.MODIFIED).json({ data: null });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Verifies a lease listing status
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const verifyStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const listing = req.listing as ListingInterface;

    if (!listing.verify.status)
      throw new PaymentRequiredError(
        `${listing.name.toUpperCase()} has not been verified for listing. Kindly pay the listing fee to verify your listing`
      );

    return res.status(HttpCode.OK).json({
      data: `${listing.name.toUpperCase()} has been been verified for listing. Kindly proceed to create offerings and promotions for your listing`,
    });
  } catch (err: any) {
    return next(err);
  }
};

const fetchOfferings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const listing = req.listing as ListingInterface;

    const offerings = listing.fetchOfferings();

    return res.status(HttpCode.OK).json({ data: offerings });
  } catch (err: any) {
    return next(err);
  }
};

const createOffering = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const key = req.headers["idempotency-key"] as string;

    const data = req.body as object;

    const listing = req.listing as ListingInterface;

    const lease = req.service as LeaseService;

    if (listing) {
      const offering = await lease.createOffering(key, data);

      await listing?.addOffering(offering._id);
    }

    return res.status(HttpCode.CREATED).json({ data: null });
  } catch (err: any) {
    return next(err);
  }
};

const updateOffering = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const offeringId = req.params.offeringId as string;

    const key = req.headers["idempotency-key"] as string;

    const data = req.body as object;

    const listing = req.listing as ListingInterface;

    const lease = req.service as LeaseService;

    if (listing) await lease.updateOffering(offeringId, key, data);

    return res.status(HttpCode.MODIFIED).json({ data: null });
  } catch (err: any) {
    return next(err);
  }
};

const deleteOffering = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const offeringId = req.params.offeringId as string;

    const listing = req.listing as ListingInterface;

    const lease = req.service as LeaseService;

    if (listing) {
      const offering = await lease.deleteOffering(offeringId);

      await listing.removeOffering(offering._id);
    }

    return res.status(HttpCode.MODIFIED).json({ data: null });
  } catch (err: any) {
    return next(err);
  }
};

export default {
  Listing: {
    createListing,
    retrieveListings,
    retrieveSearch,
    retrieveNearme,
    retrieveByProvider,
    retrieveByType,
    retrieveByCategory,
    retrieveBySlug,
    retrieveById,
    updateListing,
    deleteListing,
    changeStatus,
    verifyStatus,
  },
  Offering: {
    fetchOfferings,
    createOffering,
    updateOffering,
    deleteOffering,
  },
};
