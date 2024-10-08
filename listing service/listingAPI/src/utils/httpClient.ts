import { randomUUID } from "node:crypto";
import https from "node:https";
import FailureRetry from "./failureRetry";
import HttpCode from "../enum/httpCode";
import IHttpRequestOptions from "../interface/IHttprequestoptions";
import IHttpResponse from "../interface/IHttpresponse";

/**
 * Http Client
 * @method Get
 * @method Post
 * @method Put
 * @method Patch
 * @method Delete
 */
class HttpClient {
  private httpOptions: IHttpRequestOptions;

  private httpHeaders: Record<string, string>;

  constructor(url: string, httpHeaders: Record<string, string> = {}) {
    const parsedUrl = new URL(url);

    this.httpOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
    };

    this.httpHeaders = { ...httpHeaders };
  }

  /**
   * Generates random string values to ensure idempotency of some http methods
   * @private
   * @returns Promise<string>
   */
  private generateIdempotencyKey(): Promise<string> {
    return new Promise((resolve) => resolve(randomUUID()));
  }

  /**
   * Http request handler
   * @private
   * @param options
   * @param payload
   * @returns Promise<IHttpResponse>
   */
  private async call(
    options: IHttpRequestOptions,
    payload?: any
  ): Promise<IHttpResponse> {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const parsedData =
              res.headers["content-type"] === "application/json"
                ? JSON.parse(data)
                : data;

            resolve({
              statusCode: res.statusCode,
              body: parsedData,
            });
          } catch (error: any) {
            resolve({
              statusCode: res.statusCode ?? HttpCode.INTERNAL_SERVER_ERROR,
              body: data ?? "Error parsing response: " + error.message,
            });
          }
        });
      });

      req.on("error", (err) => {
        reject({
          statusCode: HttpCode.INTERNAL_SERVER_ERROR,
          body: "Error: " + err.message,
        });
      });

      if (payload) req.write(JSON.stringify(payload));

      req.end();
    });
  }

  /**
   * Handles various http request operations
   * @private
   * @param method
   * @param payload
   * @returns Promise<IHttpResponse>
   */
  private async request(method: string, payload?: any): Promise<IHttpResponse> {
    const headers = { ...this.httpHeaders };

    if (
      !headers["content-type"] ||
      headers["content-type"] !== "application/json"
    )
      Object.assign(headers, { "content-type": "application/json" });

    if (method.toUpperCase() === "POST" || method.toUpperCase() === "PATCH")
      Object.assign(headers, {
        "idempotency-key": await this.generateIdempotencyKey(),
      });

    const options = { ...this.httpOptions, method, headers };

    return FailureRetry.ExponentialBackoff(() => this.call(options, payload));
  }

  /**
   * Carries out a get request
   * @returns Promise<IHttpResponse>
   */
  public Get(): Promise<IHttpResponse> {
    return this.request("GET");
  }

  /**
   * Carries out a post request
   * @param payload
   * @returns Promise<IHttpResponse>
   */
  public Post(payload: any): Promise<IHttpResponse> {
    return this.request("POST", payload);
  }

  /**
   * Carries out a put request
   * @param payload
   * @returns Promise<IHttpResponse>
   */
  public Put(payload: any): Promise<IHttpResponse> {
    return this.request("PUT", payload);
  }

  /**
   * Carries out a patch request
   * @param payload
   * @returns Promise<IHttpResponse>
   */
  public Patch(payload: any): Promise<IHttpResponse> {
    return this.request("PATCH", payload);
  }

  /**
   * Carries out a delete request
   * @returns Promise<IHttpResponse>
   */
  public Delete(): Promise<IHttpResponse> {
    return this.request("DELETE");
  }

  /**
   * Returns a new instance of the HttpClient class
   * @param url
   * @param httpHeaders
   * @returns HttpClient
   */
  static Create(url: string, httpHeaders: Record<string, string>): HttpClient {
    return new HttpClient(url, httpHeaders);
  }
}

export default HttpClient;
