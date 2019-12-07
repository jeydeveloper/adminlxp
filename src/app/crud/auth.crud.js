import axios from "axios";

const { REACT_APP_API_URL } = process.env;

export const LOGIN_URL = `${REACT_APP_API_URL}/auth/login`;
export const REGISTER_URL = `${REACT_APP_API_URL}/auth/register`;
export const REQUEST_PASSWORD_URL = `${REACT_APP_API_URL}/auth/forgot-password`;

export const ME_URL = `${REACT_APP_API_URL}/auth/current-from-token`;

export function login(email, password) {
	let payload = {
		"email":email,
		"password":password
	};
  return axios.post(LOGIN_URL, payload);
}

export function register(email, fullname, username, password) {
  return axios.post(REGISTER_URL, { email, fullname, username, password });
}

export function requestPassword(email) {
  return axios.post(REQUEST_PASSWORD_URL, { email });
}

export function getUserByToken() {
  // Authorization head should be fulfilled in interceptor.
  return axios.get(ME_URL);
}
