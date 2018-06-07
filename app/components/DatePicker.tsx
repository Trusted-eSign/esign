import PropTypes from "prop-types";
import React from "react";
import { EN, RU } from "../constants";

interface IDatePickerProps {
  id: string;
  label: string;
  max?: Date;
  min?: Date;
  onSelect?: (thingSet: number) => void;
  selected?: Date;
}

class DatePicker extends React.Component<IDatePickerProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  picker: any = undefined;

  componentDidUpdate(prevProps: IDatePickerProps) {
    if ((prevProps.min !== this.props.min) && this.picker) {
      this.picker.set("min", this.props.min);
    }
  }

  componentDidMount() {
    const { locale } = this.context;
    const { id, max, min, onSelect, selected } = this.props;

    let translations;

    switch (locale) {
      case RU:
        translations = {
          clear: "Удалить",
          close: "Закрыть",
          firstDay: 1,
          format: "d mmmm yyyy г.",
          monthsFull: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
          monthsShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
          today: "Сегодня",
          weekdaysFull: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
          weekdaysLetter: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
          weekdaysShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        };
        break;

      case EN:
      default:
        translations = {
          clear: "Clear",
          close: "Close",
          firstDay: 0,
          format: "d mmmm, yyyy",
          monthsFull: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
          monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          today: "Today",
          weekdaysFull: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          weekdaysLetter: ["S", "M", "T", "W", "T", "F", "S"],
          weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        };
        break;
    }

    const input = $(".datepicker" + "_" + id).pickadate({
      clear: translations.clear,
      close: translations.close,
      closeOnSelect: true,
      firstDay: translations.firstDay,
      format: translations.format,
      max,
      min,
      monthsFull: translations.monthsFull,
      monthsShort: translations.monthsShort,
      onSet: (thingSet) => {
        if (onSelect) {
          onSelect(thingSet);
        }
      },
      selectMonths: true,
      selectYears: 5,
      today: translations.today,
      weekdaysFull: translations.weekdaysFull,
      weekdaysLetter: translations.weekdaysLetter,
      weekdaysShort: translations.weekdaysShort,
    });

    this.picker = input.pickadate("picker");

    if (this.picker && selected) {
      this.picker.set("select", selected);
    }
  }

  render() {
    const { localize, locale } = this.context;
    const { id, label } = this.props;

    return (
      <div className="row">
        <div className="input-field col s12">
          <input id={id} type="text" className={"datepicker" + "_" + id} />
          <label htmlFor={id}>{label}</label>
        </div>
      </div>
    );
  }
}

export default DatePicker;
