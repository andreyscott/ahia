import ListingController from "../controller/listingController";
import { NextFunction, Request, Response } from "express";
import ListingInterface from "../interface/listingInterface";
import ListingService from "../service/listingService";

/**
 * Attaches the resolved document to the request object
 * @param paramName - The name of the route parameter (e.g., 'id' or 'slug')
 * @param serviceName - The name of the service to resolve the listing
 * @returns a promise that resolves to void
 */
const DocumentMiddleware = (paramName: string, serviceName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramValue = req.params[paramName] as string;

      const document = await ListingController.getDocument(
        paramValue,
        serviceName
      );

      req.listing = document.listing as ListingInterface;

      req.service = document.service as ListingService;

      next();
    } catch (err: any) {
      next(err);
    }
  };
};

export default DocumentMiddleware;
