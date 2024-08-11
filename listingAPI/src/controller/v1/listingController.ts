import mongoose from "mongoose";
import AsyncCatch from "../../utils/asyncCatch";
import Config from "../../../config";
import CryptoHash from "../../utils/cryptoHash";
import ConflictError from "../../error/conflictError";
import EnsureIdempotency from "../../utils/ensureIdempotency";
import Features from "../../utils/feature";
import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "../../enum/httpStatusCode";
import Listing from "../../model/listingModel";
import Mail from "../../utils/mail";
import Notify from "../../utils/notify";
import NotFoundError from "../../error/notfoundError";
import Retry from "../../utils/retry";
import VerifyIdempotency from "../../utils/verifyIdempotency";

/**
 * Creates a new listing resource in collection
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
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (await VerifyIdempotency(idempotencyKey)) {
    throw new ConflictError(
      HttpStatusCode.CONFLICT,
      "Duplicate request detected"
    );
  }

  const payload = req.body as object;

  const provider = {
    id: (req.headers["provider-id"] as string) || `provider-` + Math.random(),
    email:
      (req.headers["provider-email"] as string) ||
      `provider.` + Math.random() * 1000 + `@yahoo.com`,
  };

  Object.assign(payload, { provider: provider });

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    await Listing.create([payload], { session: session });

    await EnsureIdempotency(idempotencyKey, session);
  });

  // Send mail to provider confirming listing creation success with transaction reference and expiry date
  // await Mail();

  return res.status(HttpStatusCode.CREATED).json({ data: null });
};

/**
 * Retrieves collection of listings
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { data, pagination } = await Features(
    Listing,
    { status: { approved: true } },
    req
  );

  return res.status(HttpStatusCode.OK).json({
    data: data,
    page: pagination.page,
    limit: pagination.limit,
    totalItems: pagination.totalItems,
    totalPages: pagination.totalPages,
    links: pagination.links,
  });
};

/**
 * Retrieves collection of listings based on search
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getListingsSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const query = req.query.search as string;

  const listings = await Listing.find({ $text: { $search: query } });

  return res.status(HttpStatusCode.OK).json({ data: listings });
};

/**
 * Retrieves collection of top (10) listings based on provider
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getTop10Listings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { provider } = req.query;

  const listings = await Listing.find({
    status: { approved: true },
    provider: { id: provider },
  })
    .sort({ createdAt: -1 })
    .limit(10);

  return res.status(HttpStatusCode.OK).json({
    results: listings.length,
    data: {
      listings,
    },
  });
};

/**
 * Retrieves collection of listing offerings available for lease/rent based on location
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getAvailableLeases = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { location } = req.query;

  const listings = await Listing.find({
    status: { approved: true },
    purpose: "lease",
    location,
  })
    .sort({ createdAt: -1 })
    .limit(100);

  return res.status(HttpStatusCode.OK).json({
    results: listings.length,
    data: {
      listings,
    },
  });
};

/**
 * Retrieves collection of listing offerings available for sales based on location
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getAvailableSales = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { location } = req.query;

  const listings = await Listing.find({
    status: { approved: true },
    purpose: "sell",
    location,
  })
    .sort({ createdAt: -1 })
    .limit(100);

  return res.status(HttpStatusCode.OK).json({
    results: listings.length,
    data: {
      listings,
    },
  });
};

/**
 * Retrieves collection of listing offerings based on type and location
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getOnGoingListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { location } = req.query;

  const listings = await Listing.find({
    status: { approved: true },
    type: "on-going",
    location,
  })
    .sort({ createdAt: -1 })
    .limit(100);

  return res.status(HttpStatusCode.OK).json({
    results: listings.length,
    data: {
      listings,
    },
  });
};

/**
 * Retrieves collection of listing offerings based on type and location
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getNowSellingListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { location } = req.query;

  const listings = await Listing.find({
    status: { approved: true },
    type: "now-selling",
    location,
  })
    .sort({ createdAt: -1 })
    .limit(100);

  return res.status(HttpStatusCode.OK).json({
    results: listings.length,
    data: {
      listings,
    },
  });
};

/**
 * Retrieves collection of exclusive listing offerings based on category and location
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getExclusiveListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { category, location } = req.query;

  const listings = await Listing.find({
    status: { approved: true },
    category,
    location,
  })
    .sort({ createdAt: -1 })
    .limit(100);

  return res.status(HttpStatusCode.OK).json({
    results: listings.length,
    data: {
      listings,
    },
  });
};

/**
 * Retrieves a listing resource from collection
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const listing = await Listing.findById({ _id: id });

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No record found for listing: ${id}`
    );
  }

  return res.status(HttpStatusCode.OK).json({ data: listing });
};

/**
 * Modifies a listing resource in collection
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
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (await VerifyIdempotency(idempotencyKey)) {
    throw new ConflictError(
      HttpStatusCode.CONFLICT,
      "Duplicate request detected"
    );
  }

  const id = req.params.id as string;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const listing = await Listing.findByIdAndUpdate(
      { _id: id },
      req.body as object,
      {
        new: true,
        session,
      }
    );

    if (!listing) {
      throw new NotFoundError(
        HttpStatusCode.NOT_FOUND,
        `No record found for listing: ${id}`
      );
    }

    await EnsureIdempotency(idempotencyKey, session);
  });

  return res.status(HttpStatusCode.MODIFIED).json({ data: null });
};

/**
 * Removes a listing resource from collection
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
  const id = req.params.id as string;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const listing = await Listing.findByIdAndDelete({ _id: id }, { session });

    if (!listing) {
      throw new NotFoundError(
        HttpStatusCode.NOT_FOUND,
        `No record found for listing: ${id}`
      );
    }
  });

  return res.status(HttpStatusCode.MODIFIED).json({ data: null });
};

/**
 * Processes listing checkout to payment
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const checkoutListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const id = req.params.id as string;

  const listing = await Listing.findById({ _id: id });

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No record found for listing: ${id}`
    );
  }

  if (!listing.status.approved) {
    res.setHeader("service-name", Config.LISTING.SERVICE.NAME);

    res.setHeader(
      "service-secret",
      await CryptoHash(Config.LISTING.SERVICE.SECRET, Config.APP_SECRET)
    );

    res.setHeader(
      "payload",
      JSON.stringify({
        id: listing._id,
        name: listing.name,
        email: listing.provider.email,
      })
    );

    return res.redirect(301, Config.PAYMENT_SERVICE_URL);
  }

  return;
};

/**
 * Approves a listing status
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const approveListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { name } = req.query;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const listing = await Listing.findOne({ name: name }).session(session);

    if (!listing) {
      throw new NotFoundError(
        HttpStatusCode.NOT_FOUND,
        `No record found for listing: ${name}`
      );
    }

    listing.status.approved = true;

    await listing.save({ session });
  });

  // Send mail to provider confirming listing approval success
  // await Mail();

  return res.status(HttpStatusCode.OK).json({
    data: `Approval for listing ${name} successful.`,
  });
};

/**
 * Verifies a listing approval status
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const verifyListingApproval = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const listing = await Listing.findById({
    _id: id,
  });

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No record found for listing: ${id}`
    );
  }

  if (!listing.status.approved) {
    return res.status(HttpStatusCode.FORBIDDEN).json({
      data: `${listing.name.toUpperCase()} has not been been approved for listing. Kindly pay the listing fee to approve this listing`,
    });
  }

  return res.status(HttpStatusCode.OK).json({
    data: `${listing.name.toUpperCase()} have been been approved for listing. Kindly proceed to add attachments and create promotions for your listing`,
  });
};

/**
 * Create a new listing in collection
 */
const createListings = AsyncCatch(
  createListing,
  Retry.ExponentialJitterBackoff
);

/**
 * Retrieve collection of listings
 */
const retrieveListings = AsyncCatch(getListings, Retry.LinearJitterBackoff);

/**
 * Retrieve collection of listings based on search
 */
const retrieveListingsSearch = AsyncCatch(
  getListingsSearch,
  Retry.LinearJitterBackoff
);

/**
 * Retrieve top ten (10) listing offerings based on provider
 */
const top10Listings = AsyncCatch(getTop10Listings, Retry.LinearJitterBackoff);

/**
 * Retrieve available listings for lease based on location
 */
const availableLeases = AsyncCatch(
  getAvailableLeases,
  Retry.LinearJitterBackoff
);

/**
 * Retrieve available listings for sale based on location
 */
const availableSales = AsyncCatch(getAvailableSales, Retry.LinearJitterBackoff);

/**
 * Retrieve available listings based on type and location
 */
const onGoing = AsyncCatch(getOnGoingListings, Retry.LinearJitterBackoff);

/**
 * Retrieve available listings based on type and location
 */
const nowSelling = AsyncCatch(getNowSellingListings, Retry.LinearJitterBackoff);

/**
 * Retrieve exclusive listing based on category and location
 */
const exclusive = AsyncCatch(getExclusiveListings, Retry.LinearJitterBackoff);

/**
 * Retrieve a listing item using its :id
 */
const retrieveListingItem = AsyncCatch(getListing, Retry.LinearJitterBackoff);

/**
 * Updates a listing item using its :id.
 */
const updateListingItem = AsyncCatch(
  updateListing,
  Retry.ExponentialJitterBackoff
);

/**
 * Deletes a listing item using its :id
 */
const deleteListingItem = AsyncCatch(deleteListing, Retry.LinearBackoff);

/**
 * Handles interface with payment service for listing transactions
 */
const checkoutListingItem = AsyncCatch(checkoutListing);

/**
 * Approves a listing item status
 */
const approveListingItem = AsyncCatch(
  approveListing,
  Retry.LinearJitterBackoff
);

/**
 * Verifies a listing item approval status
 */
const verifyListingItemApproval = AsyncCatch(
  verifyListingApproval,
  Retry.LinearJitterBackoff
);

export default {
  createListings,
  retrieveListings,
  retrieveListingsSearch,
  retrieveListingItem,
  updateListingItem,
  deleteListingItem,
  checkoutListingItem,
  approveListingItem,
  verifyListingItemApproval,
  top10Listings,
  availableLeases,
  availableSales,
  onGoing,
  nowSelling,
  exclusive,
};
