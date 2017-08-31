import React, { PropTypes } from "react";
import {EN, RU} from "../constants";
import en from "./EN";
import ru from "./RU";

export default function localize(message: string, locale = EN) {
  const category: string = message.substring(0, message.indexOf("."));
  const field: string = message.substring(message.indexOf(".") + 1, message.length);

  switch (locale) {
    case RU:
      return ru[category][field];
    case EN:
      return en[category][field];
  }
}

localize.contextTypes = {
  locale: PropTypes.string.isRequired,
};
