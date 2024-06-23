import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "../../enum/httpStatusCode";
import AsyncErrorWrapper from "../../utils/asyncErrorWrapper/asyncErrorWrapper";
import NotFoundError from "../../error/notfoundError";
import TourModel from "../../../src/model/tourModel";
import TourIdempotencyModel from "../../../src/model/tourIdempotencyModel";
import TourScheduleModel from "../../../src/model/tourScheduleModel";

/**
 * Retrieve collection of tours.
 */
const retrieveTourCollection = AsyncErrorWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<typeof Response | void> => {
    await TourModel.find()
      .then((tours) => {
        if (!tours) {
          throw new NotFoundError(
            HttpStatusCode.NOT_FOUND,
            `No tours found for query: ${req.query.q}`
          );
        }

        return res.status(HttpStatusCode.OK).json({
          count: tours.length,
          data: tours,
        });
      })
      .catch((err) => next(err));
  }
);

/**
 * Retrieve collection of tours based on search parameter.
 */
const retrieveTourSearch = AsyncErrorWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<typeof Response | void> => {
    await TourModel.find({
      // $text: { $search: req.query.q, $caseSensitive: false },
    })
      .then((tours) => {
        if (!tours) {
          throw new NotFoundError(
            HttpStatusCode.NOT_FOUND,
            `No tours found for query: ${req.query.q}`
          );
        }

        return res.status(HttpStatusCode.OK).json({
          count: tours.length,
          data: tours,
        });
      })
      .catch((err) => next(err));
  }
);

/**
 * Retrieve a tour item using its :id.
 */
const retrieveTourItem = AsyncErrorWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<typeof Response | void> => {
    await TourModel.findById({ _id: req.params.id })
      .then((tour) => {
        if (!tour) {
          throw new NotFoundError(
            HttpStatusCode.NOT_FOUND,
            `No tour found for id: ${req.params.id}`
          );
        }

        return res.status(HttpStatusCode.OK).json({ data: tour });
      })
      .catch((err) => next(err));
  }
);

/**
 * Replace a tour item using its :id.
 */
const replaceTourItem = AsyncErrorWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<typeof Response | void> => {
    await TourModel.findOneAndReplace({ _id: req.params._id }, req.body, {
      new: true,
    })
      .then((tour) => {
        if (!tour) {
          throw new NotFoundError(
            HttpStatusCode.NOT_FOUND,
            `No tour found for id: ${req.params.id}`
          );
        }

        return res.status(HttpStatusCode.MODIFIED).json(null);
      })
      .catch((err) => next(err));
  }
);

/**
 * Updates a tour item using its :id.
 */
const updateTourItem = AsyncErrorWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<typeof Response | void> => {
    await TourModel.findOneAndUpdate({ _id: req.params._id }, req.body, {
      new: true,
    })
      .then((tour) => {
        if (!tour) {
          throw new NotFoundError(
            HttpStatusCode.NOT_FOUND,
            `No tour found for id: ${req.params.id}`
          );
        }

        return res.status(HttpStatusCode.MODIFIED).json(null);
      })
      .catch((err) => next(err));
  }
);

/**
 * Deletes a tour item using its :id.
 */
const deleteTourItem = AsyncErrorWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<typeof Response | void> => {
    await TourModel.findOneAndUpdate({ _id: req.params._id })
      .then((tour) => {
        if (!tour) {
          throw new NotFoundError(
            HttpStatusCode.NOT_FOUND,
            `No tour found for id: ${req.params.id}`
          );
        }

        return res.status(HttpStatusCode.MODIFIED).json(null);
      })
      .catch((err) => next(err));
  }
);

/**
 * Complete a tour item using its :id.
 */
const completeTourItem = AsyncErrorWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<typeof Response | void> => {
    await TourModel.findOneAndUpdate(
      { _id: req.params._id },
      { status: "completed", isClosed: true },
      {
        new: true,
      }
    )
      .then((tour) => {
        if (!tour) {
          throw new NotFoundError(
            HttpStatusCode.NOT_FOUND,
            `No tour found for id: ${req.params.id}`
          );
        }

        return res
          .status(HttpStatusCode.OK)
          .json("Your tour has been successfully completed");
      })
      .catch((err) => next(err));
  }
);

/**
 * Cancels a tour item using its :id.
 */
const cancelTourItem = AsyncErrorWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<typeof Response | void> => {
    await TourModel.findOneAndUpdate(
      { _id: req.params._id },
      { status: "cancelled", isClosed: true },
      {
        new: true,
      }
    )
      .then((tour) => {
        if (!tour) {
          throw new NotFoundError(
            HttpStatusCode.NOT_FOUND,
            `No tour found for id: ${req.params.id}`
          );
        }

        return res
          .status(HttpStatusCode.OK)
          .json("Your tour has been successfully cancelled");
      })
      .catch((err) => next(err));
  }
);

/**
 * reopens a cancelled tour using its :id.
 */
const reopenTourItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<typeof Response | void> => {
  await TourModel.findOneAndUpdate(
    { _id: req.params._id, status: "cancelled" },
    { isClosed: false },
    {
      new: true,
    }
  )
    .then((tour) => {
      if (!tour) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No cancelled tour found for id: ${req.params.id}`
        );
      }

      return res
        .status(HttpStatusCode.OK)
        .json("Your tour has been successfully reopened");
    })
    .catch((err) => next(err));
};

const scheduleTour = AsyncErrorWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<typeof Response | void> => {
    const tourId = req.params.id;

    const { proposedDate, proposedTime } = req.body;

    await TourModel.findById({ id: tourId })
      .then((tour) => {
        if (!tour) {
          throw new NotFoundError(
            HttpStatusCode.NOT_FOUND,
            `No tour found for id: ${req.params.id}`
          );
        }
      })
      .catch((err) => next(err));

    await TourScheduleModel.create({ tourId, proposedDate, proposedTime })
      .then((schedule) => {
        return res.status(HttpStatusCode.CREATED).json({
          message:
            "your availability schedule have been set. A realtor will be assigned to you shortly based on your proposed availability date and time.",
          data: schedule,
        });
      })
      .catch((err) => next(err));
  }
);

const acceptProposedTourSchedule = AsyncErrorWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<typeof Response | void> => {
    const tourId = req.params.id;

    const tourScheduleId = req.params.rescheduleId;

    const schedule = await TourScheduleModel.findByIdAndUpdate(
      { _id: tourScheduleId },
      { status: "accepted" },
      { new: true }
    );

    if (!schedule || schedule.status !== "pending") {
      throw new NotFoundError(
        HttpStatusCode.NOT_FOUND,
        "schedule not found or already processed."
      );
    }

    const tour = await TourModel.findByIdAndUpdate(
      { _id: tourId },
      {
        scheduledDate: schedule.proposedDate,
        scheduledTime: schedule.proposedTime,
      },
      { new: true }
    );

    if (!tour) {
      throw new NotFoundError(
        HttpStatusCode.NOT_FOUND,
        `No tour found for id: ${req.params.id}`
      );
    }
  }
);

const rejectProposedTourSchedule = AsyncErrorWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<typeof Response | void> => {
    const tourScheduleId = req.params.rescheduleId;

    const schedule = await TourScheduleModel.findByIdAndUpdate(
      { _id: tourScheduleId },
      { status: "rejected" },
      { new: true }
    );

    if (!schedule || schedule.status !== "pending") {
      throw new NotFoundError(
        HttpStatusCode.NOT_FOUND,
        "schedule not found or already processed."
      );
    }
  }
);

/**
 * Handle not allowed operations
 */
const operationNotAllowed = (
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  return res.status(405).json({
    message: "operation not allowed",
  });
};

export default {
  retrieveTourCollection,
  retrieveTourSearch,
  retrieveTourItem,
  replaceTourItem,
  updateTourItem,
  completeTourItem,
  cancelTourItem,
  reopenTourItem,
  scheduleTour,
  acceptProposedTourSchedule,
  rejectProposedTourSchedule,
  operationNotAllowed,
};
