import developmentConfigureStore from "./configureStore.development";
import productionConfigureStore from "./configureStore.production";

export default (
  process.env.NODE_ENV === "production"
    ? productionConfigureStore
    : developmentConfigureStore
);
