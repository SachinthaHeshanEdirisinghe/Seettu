import axios from 'axios';
import { API_BASE } from '../constants';

const client = axios.create({ baseURL: API_BASE });

export default client;
