/* eslint no-underscore-dangle: "off" */
const {
  NODE_ENV = 'development',
  PORT,
  CRYSTALLIZE_TENANT_ID,
  CRYSTALLIZE_GRAPH_URL_BASE,
  GTM_ID
} = process.env;

const DEV = NODE_ENV !== 'production';

global.__crystallizeConfig = {
  NODE_ENV,
  PORT: parseInt(PORT, 10),
  HOST_NAME: `http://localhost:${PORT}`,
  TENANT_ID: CRYSTALLIZE_TENANT_ID,
  GRAPH_URL: `${CRYSTALLIZE_GRAPH_URL_BASE}/tenant/${CRYSTALLIZE_TENANT_ID}`,
  GTM_ID,
  DEV
};

module.exports = global.__crystallizeConfig;
