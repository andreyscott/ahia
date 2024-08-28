enum HttpCode {
  OK = 200,
  CREATED = 201,
  MODIFIED = 204,
  REDIRECT = 301,
  BAD_REQUEST = 400,
  UNAUTHORISED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  NOT_ALLOWED = 405,
  CONFLICT = 409,
  PAYMENT_REQUIRED = 412,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

export default HttpCode;
