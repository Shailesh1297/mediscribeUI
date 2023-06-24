import { environment } from "../../../environments/environment";

export const BASE_URL = environment.baseurl;

export const API_CONSTANTS = {
    AUTHENTICATE : `${BASE_URL}/authenticate`,
    VALID : `${BASE_URL}/valid`
}